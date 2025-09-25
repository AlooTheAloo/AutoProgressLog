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

export async function ManualSync(userID: number) {
  const cfg = await client.userConfig.findUnique({
    where: { userId: userID },
    select: { togglToken: true, togglUserId: true },
  });
  if (cfg == undefined) return false;

  const since = dayjs().subtract(3, "month").add(1, "day");

  const t = new Toggl({
    auth: {
      token: cfg.togglToken,
    },
  });

  let entries: entry[] = await t.timeEntry.list({
    since: dayjs(since).unix().toString(),
  });

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
}

function sumTime(entries: entry[]) {
  return entries.reduce((sum, current) => sum + current.duration, 0);
}

function compareActivities(a: activity, b: activity) {
  if (a.activityDuration < b.activityDuration) return -1;
  if (a.activityDuration > b.activityDuration) return 1;
  return 0;
}
