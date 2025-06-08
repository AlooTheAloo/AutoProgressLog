import dayjs from "dayjs";
import { entry } from "../types/entry";
import { HHMMSS } from "../consts/time";
import { sumTime } from "../Helpers/entryHelper";
import { compareActivities } from "../Helpers/activityHelper";
import { Toggl } from "toggl-track";
import { getConfig } from "../Helpers/getConfig";
import { activity } from "../types/activity";
import { onConfigChange } from "../../electron/main/Electron-Backend/SettingsListeners";
import { Options } from "../types/options";
import { EventAction, TogglWebhookClient } from "toggl-webhook";

const ignore = (tags: string[]) =>
  ["aplignore", "ignore", "autoprogresslogignore"].some((x) =>
    tags.map((x) => x.toLowerCase()).includes(x)
  );

export let toggl: Toggl | undefined = undefined;

export async function getTimeEntries(
  sinceDayjs: dayjs.Dayjs,
  beforeDayjs: dayjs.Dayjs | undefined = undefined
) {
  if (sinceDayjs.isSame(beforeDayjs)) {
    beforeDayjs = undefined;
  }

  let since = sinceDayjs.valueOf();
  try {
    toggl = new Toggl({
      auth: {
        token: getConfig()?.toggl.togglToken ?? "",
      },
    });

    const compare = dayjs().subtract(3, "month").add(1, "day");
    if (dayjs(since).isBefore(compare)) {
      since = compare.valueOf();
    }

    const start = dayjs();
    let entries: entry[] = await toggl.timeEntry.list({
      since: dayjs(since).unix().toString(),
    });

    entries = entries.filter(
      (x) => dayjs(x.stop).isBefore(beforeDayjs) || x.stop != null
    );

    // TODO : Telemetry maybe
    console.log("Fetch took " + dayjs().diff(start, "ms") + " ms");
    const entriesAfterLastGen = entries.filter((x) => {
      const formattedTags = x.tags.map((x) => (x as string).toLowerCase());
      return (
        !ignore(formattedTags) &&
        dayjs(x.stop).isAfter(dayjs(since)) &&
        x.server_deleted_at == null &&
        x.stop != null
      );
    });

    const uniqueEvents: string[] = [
      ...new Set(entriesAfterLastGen.map((x) => x.description)),
    ];
    const allEvents = uniqueEvents
      .map(function (evt) {
        const correspondingEntries = entriesAfterLastGen.filter(
          (x) => x.description == evt
        );
        const activityTime = sumTime(correspondingEntries);
        const ret: activity = {
          activityTitle: evt,
          activityDurationHR:
            dayjs.duration(activityTime, "second").format(HHMMSS) + "",
          activitySeconds: activityTime,
        };
        return ret;
      })
      .sort(compareActivities)
      .reverse();

    return { entriesAfterLastGen, allEvents };
  } catch (e) {
    console.log("error fetching entries", e);
    return null;
  }
}

const wh_name = "APL_Toggl_Webhook";
const wh_link = "https://dev.chromaserver.net/webhooks/toggl";
const evt_props = {
  event_filters: [{ entity: "time_entry", action: "*" as EventAction }],
  description: wh_name,
  secret: crypto.randomUUID().toString(),
  enabled: true,
};

/**
 * Initializes or enables the APL webhook. Consumes 2 tokens.
 * @param workspaceID The workspace ID to use. If -1, uses the default workspace and consumes 1 extra token.
 */
export default async function createWebhook(workspaceID = -1) {
  const tok = getConfig()?.toggl.togglToken;
  if (!tok) return;
  toggl = new Toggl({
    auth: {
      token: tok,
    },
  });

  if (workspaceID == -1) {
    const me = await toggl.me.get();
    workspaceID = me.default_workspace_id;
  }

  const client = new TogglWebhookClient({
    apiToken: tok,
  });

  const ls = await client.listSubscriptions({
    workspace_id: workspaceID,
  });

  const wh = ls.find((x) => x.description == wh_name);
  if (wh != undefined) {
    client.updateSubscription({
      subscription_id: wh.subscription_id,
      workspace_id: wh.workspace_id,
      url_callback: wh_link,
      ...evt_props,
    });
    return;
  }

  await client.createSubscription({
    workspace_id: workspaceID,
    url_callback: wh_link,
    ...evt_props,
  });
}

onConfigChange.on(
  "config-change",
  async (oldConfig: Options, newConfig: Options) => {
    if (oldConfig.toggl.togglToken != newConfig.toggl.togglToken) {
      if (newConfig.toggl.togglToken == "") {
        toggl = undefined;
      } else {
        console.log("creating new toggl");
        toggl = new Toggl({
          auth: {
            token: newConfig.toggl.togglToken,
          },
        });
      }
    }
  }
);
