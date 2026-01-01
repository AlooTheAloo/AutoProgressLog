import Toggl from "toggl-track";
import client from "../../db/client";
import dayjs from "dayjs";

interface activity {
  activityName: string;
  activityDuration: number;
}

interface entry {
  id: number;
  workspace_id: number;
  project_id: number | null;
  task_id: number | null;
  billable: boolean;
  start: string;
  stop: string;
  duration: number;
  description: string;
  tags: any[];
  tag_ids: any[];
  duronly: boolean;
  at: string;
  server_deleted_at: null;
  user_id: number;
  uid: number;
  wid: number;
  permissions: null;
}

const ignore = (tags: string[]) =>
  ["aplignore", "ignore", "autoprogresslogignore"].some((x) =>
    tags.map((x) => x.toLowerCase()).includes(x)
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
}

export async function fullSync(userID: number) {
  console.log("--- FULL SYNC START ---");

  const cfg = await client.userConfig.findUnique({
    where: { userId: userID },
    select: { togglToken: true, togglUserId: true },
  });

  if(cfg == null) return false;

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


  url.searchParams.set("since", dayjs().subtract(90, "days").add(1, "minute").format("YYYY-MM-DD"));

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "AutoProgressLog | aplapp.dev",
      "Authorization": `Basic ${auth}`,
    },
  });

  
  const json = await response.json();

  await client.immersionActivity.createMany({
    data: json.data.items.map((e: item) => {
      return {
        userId: userID,
        activityName: e.title,
        activityTogglId: null,
        createdAt: new Date(e.local_start),
        seconds: e.time / 1000 // ms -> s
      };
    }),
    skipDuplicates: true,
  });

  ManualSync(userID)

}


export async function ManualSync(userID: number) {
  console.log("--- MANUAL SYNC START ---");
  const cfg = await client.userConfig.findUnique({
    where: { userId: userID },
    select: { togglToken: true, togglUserId: true },
  });

  if (cfg == undefined) return false;

  const since = dayjs().subtract(90, "day").add(1, "minute");

  const t = new Toggl({
    auth: {
      token: cfg.togglToken,
    },
  });

  let entries: entry[] = await t.timeEntry.list({
    since: dayjs(since).unix().toString(),
  });

  console.log("ENTRIES : " + entries.length);

  // Only keep events that are finished
  entries = entries.filter((x) => x.stop != null);

  // TODO : Telemetry maybe
  entries = entries.filter((x) => {
    const formattedTags = x.tags.map((x) => (x as string).toLowerCase());
    return (
      !ignore(formattedTags) &&
      dayjs(x.stop).isAfter(dayjs(since)) &&
      x.server_deleted_at == null &&
      x.stop != null
    );
  });
  

  await client.immersionActivity.createMany({
    data: entries.map((e) => {
      return {
        userId: userID,
        activityName: e.description,
        activityTogglId: e.id.toString(),
        createdAt: new Date(e.start),
        seconds: Math.floor(
          (new Date(e.stop).getTime() - new Date(e.start).getTime()) / 1000
        ),
      };
    }),
    skipDuplicates: true,
  });
}

function sumTime(entries: entry[]) {
  return entries.reduce((sum, current) => sum + current.duration, 0);
}

function compareActivities(a: activity, b: activity) {
  if (a.activityDuration < b.activityDuration) return -1;
  if (a.activityDuration > b.activityDuration) return 1;
  return 0;
}
