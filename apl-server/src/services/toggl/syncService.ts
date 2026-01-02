import { Toggl } from "toggl-track";
import client from "../../db/client";
import dayjs from "dayjs";
import { writeFileSync } from "fs";

const lastSyncMap = new Map<number, number>();
const SYNC_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

function isRateLimited(userId: number): boolean {
  const lastSync = lastSyncMap.get(userId);
  if (!lastSync) return false;

  const now = Date.now();
  if (now - lastSync < SYNC_THRESHOLD_MS) {
    const remaining = Math.ceil(
      (SYNC_THRESHOLD_MS - (now - lastSync)) / 1000 / 60
    );
    console.log(
      `User ${userId} is Toggl sync rate limited. Remaining: ~${remaining} mins`
    );
    return true;
  }
  return false;
}

interface TogglEntry {
  id: number;
  description: string;
  start: string;
  stop: string;
  duration: number;
  at: string; // last modification time
  server_deleted_at: string | null;
}

const ignore = (tags: string[]) =>
  ["aplignore", "ignore", "autoprogresslogignore"].some((x) =>
    tags.map((t) => t.toLowerCase()).includes(x)
  );

type item = {
  title: {
    time_entry: string;
  };
  time: number;
  cur: string;
  sum: number;
  rate: number;
  local_start: string;
};

/**
 * Runs a full dirty toggl sync (9 months of dirty data + 3 months of clean data)
 * @param userID The user to sync for
 * @returns True if the sync was successful, false otherwise
 */
export async function fullSyncTogglData(
  userID: number,
  force: boolean = false
) {
  if (!force && isRateLimited(userID)) return false;
  console.log("--- FULL SYNC START ---");

  const cfg = await client.userConfig.findUnique({
    where: { userId: userID },
    select: { togglToken: true, togglUserId: true },
  });

  if (cfg == null) return false;

  const apiToken = cfg.togglToken;

  const toggl = new Toggl({
    auth: {
      token: apiToken,
    },
  });
  const me = await toggl.me.get();

  const auth = Buffer.from(`${apiToken}:api_token`).toString("base64");

  const url = new URL("https://api.track.toggl.com/reports/api/v2/summary");
  url.searchParams.set("workspace_id", me.default_workspace_id.toString());
  url.searchParams.set("user_agent", "AutoProgressLog/1.0");

  url.searchParams.set(
    "since",
    dayjs().subtract(1, "year").add(1, "minute").format("YYYY-MM-DD")
  );
  url.searchParams.set(
    "until",
    dayjs().subtract(90, "days").add(1, "minute").format("YYYY-MM-DD")
  );
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "AutoProgressLog | aplapp.dev",
      Authorization: `Basic ${auth}`,
    },
  });

  const json: { data: { items: item[] }[] } = await response.json();

  try {
    const prout = await client.immersionActivity.createMany({
      data: json.data
        .flatMap((x: any) => x.items)
        .map((e: item) => {
          return {
            userId: userID,
            activityName: e.title.time_entry,
            activityTogglId: null,
            createdAt: new Date(e.local_start),
            seconds: e.time / 1000, // ms -> s
          };
        }),
      skipDuplicates: true,
    });
    console.log("worked ??" + JSON.stringify(prout));
  } catch (e) {
    console.log("ERRORED !OUUT");
    console.error(e);
    return false;
  }
  console.log("No error :3");

  await syncTogglData(userID, force);

  return true;
}

/**
 * Synchronizes Toggl data for the last 3 months.
 * Adds missing entries, updates changed ones, and deletes removed ones.
 */
export async function syncTogglData(userId: number, force: boolean = false) {
  if (!force && isRateLimited(userId)) return;
  console.log(`--- TOGGL SYNC START for User ${userId} ---`);

  const config = await client.userConfig.findUnique({
    where: { userId },
    select: { togglToken: true },
  });

  if (!config?.togglToken) {
    console.warn(`Sync aborted: No Toggl token for user ${userId}`);
    return;
  }

  const toggl = new Toggl({
    auth: { token: config.togglToken },
  });

  // Time window: Last 3 months
  const sinceDate = dayjs().subtract(90, "day").add(1, "minute");

  try {
    let togglEntries: any[] | string | null = null;

    try {
      togglEntries = await toggl.timeEntry.list({
        since: sinceDate.unix().toString(),
      });
    } catch (e) {
      console.log(e);
      return;
    }

    writeFileSync("stuff.json", JSON.stringify(togglEntries));

    if (typeof togglEntries == "string" || togglEntries == null) {
      console.log("User is out of API calls for the hour. Skipping diff sync.");
      // lmfao get API call diffed
      return;
    }

    // Update last sync time
    lastSyncMap.set(userId, Date.now());

    // Filter out ongoing entries and ignored ones
    const validTogglEntries = togglEntries.filter(
      (e) =>
        e.stop && // completed
        e.description && // not empty
        e.server_deleted_at == null && // not deleted
        !ignore((e.tags || []).map((t: any) => t.toString().toLowerCase())) // not ignored
    );

    const togglMap = new Map<string, any>();
    validTogglEntries.forEach((e) => togglMap.set(e.id.toString(), e));

    // 2. Fetch DB entries for the same period
    const dbEntries = await client.immersionActivity.findMany({
      where: {
        userId,
        createdAt: { gte: sinceDate.toDate() },
      },
    });
    console.log("len dbent : " + dbEntries.length);

    const dbMap = new Map<string, (typeof dbEntries)[0]>();
    dbEntries.forEach((e) => dbMap.set(e.activityTogglId ?? "null", e));

    const toCreate: any[] = [];
    const toUpdate: { id: number; data: any }[] = [];
    const toDelete: number[] = [];

    // Check for updates and new entries
    for (const [togglId, togglEntry] of togglMap) {
      const dbEntry = dbMap.get(togglId);
      const togglDuration = Math.floor(
        (new Date(togglEntry.stop).getTime() -
          new Date(togglEntry.start).getTime()) /
          1000
      );
      const togglStart = new Date(togglEntry.start);

      if (!dbEntry) {
        // MISSING: Add
        toCreate.push({
          userId,
          activityName: togglEntry.description,
          activityTogglId: togglId,
          createdAt: togglStart,
          seconds: togglDuration,
        });
      } else {
        // EXISTS: Check for changes
        const hasNameChanged = dbEntry.activityName !== togglEntry.description;
        const hasDurationChanged = dbEntry.seconds !== togglDuration;
        // Compare dates (ignoring sub-second precision differences if any)
        const hasTimeChanged =
          Math.abs(dbEntry.createdAt.getTime() - togglStart.getTime()) > 1000;

        if (hasNameChanged || hasDurationChanged || hasTimeChanged) {
          toUpdate.push({
            id: dbEntry.id,
            data: {
              activityName: togglEntry.description,
              seconds: togglDuration,
              createdAt: togglStart,
            },
          });
        }
      }
    }

    // Check for deletions (In DB but NOT in Toggl list)
    for (const [togglId, dbEntry] of dbMap) {
      console.log("Checking if toggl knows about " + togglId);
      if (!togglMap.has(togglId)) {
        toDelete.push(dbEntry.id);
      }
    }

    console.log(`Sync status for User ${userId}: 
            To Create: ${toCreate.length}
            To Update: ${toUpdate.length}
            To Delete: ${toDelete.length}`);

    // 3. Execute DB operations
    if (toCreate.length > 0) {
      await client.immersionActivity.createMany({
        data: toCreate,
        skipDuplicates: true, // Just in case
      });
    }

    if (toUpdate.length > 0) {
      // Prisma doesn't have a batch update for different records, so we do them individually
      // or we could use multiple transactions. Individual is fine for small/medium counts.
      for (const update of toUpdate) {
        await client.immersionActivity.update({
          where: { id: update.id },
          data: update.data,
        });
      }
    }

    if (toDelete.length > 0) {
      await client.immersionActivity.deleteMany({
        where: {
          id: { in: toDelete },
        },
      });
    }

    console.log(`--- TOGGL SYNC COMPLETE for User ${userId} ---`);
  } catch (error) {
    console.error(`Error during Toggl sync for user ${userId}:`, error);
  }
}
