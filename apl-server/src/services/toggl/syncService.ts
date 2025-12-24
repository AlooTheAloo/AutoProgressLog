import Toggl from "toggl-track";
import client from "../../db/client";
import dayjs from "dayjs";

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

/**
 * Synchronizes Toggl data for the last 3 months.
 * Adds missing entries, updates changed ones, and deletes removed ones.
 */
export async function syncTogglData(userId: number) {
    console.log(`--- TOGGL SYNC START for User ${userId} ---`);
    
    const config = await client.userConfig.findUnique({
        where: { userId },
        select: { togglToken: true }
    });

    if (!config?.togglToken) {
        console.warn(`Sync aborted: No Toggl token for user ${userId}`);
        return;
    }

    const toggl = new Toggl({
        auth: { token: config.togglToken }
    });

    // Time window: Last 3 months
    const sinceDate = dayjs().subtract(3, "month").add(1, "day");
    
    try {
        // 1. Fetch Toggl entries
        // Note: list() with since uses start time of entries.
        let togglEntries: any[] | string | null = null;

        try{
            togglEntries = await toggl.timeEntry.list({
                since: sinceDate.unix().toString()
            });
        } catch(e){
            console.log(e);
            return;
        }

        if(typeof(togglEntries) == "string" || togglEntries == null){
            // lmfao get API call diffed
            return;
        }

        // Filter out ongoing entries and ignored ones
        const validTogglEntries = togglEntries.filter(e => 
            e.stop && 
            e.description &&
            !ignore((e.tags || []).map((t: any) => t.toString().toLowerCase()))
        );

        const togglMap = new Map<string, any>();
        validTogglEntries.forEach(e => togglMap.set(e.id.toString(), e));

        // 2. Fetch DB entries for the same period
        const dbEntries = await client.immersionActivity.findMany({
            where: {
                userId,
                createdAt: { gte: sinceDate.toDate() }
            }
        });

        const dbMap = new Map<string, typeof dbEntries[0]>();
        dbEntries.forEach(e => dbMap.set(e.activityTogglId, e));

        const toCreate: any[] = [];
        const toUpdate: { id: number, data: any }[] = [];
        const toDelete: number[] = [];

        // Check for updates and new entries
        for (const [togglId, togglEntry] of togglMap) {
            const dbEntry = dbMap.get(togglId);
            
            const togglDuration = Math.floor(
                (new Date(togglEntry.stop).getTime() - new Date(togglEntry.start).getTime()) / 1000
            );
            const togglStart = new Date(togglEntry.start);

            if (!dbEntry) {
                // MISSING: Add
                toCreate.push({
                    userId,
                    activityName: togglEntry.description,
                    activityTogglId: togglId,
                    createdAt: togglStart,
                    seconds: togglDuration
                });
            } else {
                // EXISTS: Check for changes
                const hasNameChanged = dbEntry.activityName !== togglEntry.description;
                const hasDurationChanged = dbEntry.seconds !== togglDuration;
                // Compare dates (ignoring sub-second precision differences if any)
                const hasTimeChanged = Math.abs(dbEntry.createdAt.getTime() - togglStart.getTime()) > 1000;

                if (hasNameChanged || hasDurationChanged || hasTimeChanged) {
                    toUpdate.push({
                        id: dbEntry.id,
                        data: {
                            activityName: togglEntry.description,
                            seconds: togglDuration,
                            createdAt: togglStart
                        }
                    });
                }
            }
        }

        // Check for deletions (In DB but NOT in Toggl list)
        for (const [togglId, dbEntry] of dbMap) {
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
                skipDuplicates: true // Just in case
            });
        }

        if (toUpdate.length > 0) {
            // Prisma doesn't have a batch update for different records, so we do them individually
            // or we could use multiple transactions. Individual is fine for small/medium counts.
            for (const update of toUpdate) {
                await client.immersionActivity.update({
                    where: { id: update.id },
                    data: update.data
                });
            }
        }

        if (toDelete.length > 0) {
            await client.immersionActivity.deleteMany({
                where: {
                    id: { in: toDelete }
                }
            });
        }

        console.log(`--- TOGGL SYNC COMPLETE for User ${userId} ---`);
    } catch (error) {
        console.error(`Error during Toggl sync for user ${userId}:`, error);
    }
}
