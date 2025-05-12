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

const ignore = (tags: string[]) =>
  ["aplignore", "ignore", "autoprogresslogignore"].some((x) =>
    tags.map((x) => x.toLowerCase()).includes(x)
  );

export let toggl: Toggl | undefined = undefined;

export async function getLiveActivity() {
  const entries: entry[] = await toggl?.timeEntry.list({
    since: dayjs().unix().toString(),
  });
  if (typeof entries == "string") {
    return undefined;
  }
  return entries;
}

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

    console.log("Entries are " + JSON.stringify(entries));

    entries = entries.filter((x) => dayjs(x.stop).isBefore(beforeDayjs));
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
