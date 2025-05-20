import dayjs from "dayjs";
import { Toggl } from "./index";
import { entry } from "@/types/entry";
import { sumTime } from "@/helpers/entryHelper";
import { activity } from "@/types/activity";
import { compareActivities } from "@/helpers/activityHelper";

const ignore = (tags: string[]) =>
  ["aplignore", "ignore", "autoprogresslogignore"].some((x) =>
    tags.map((x) => x.toLowerCase()).includes(x)
  );

export async function getTimeEntries(
  sinceDayjs: dayjs.Dayjs,
  beforeDayjs: dayjs.Dayjs | undefined = undefined
) {
  if (sinceDayjs.isSame(beforeDayjs)) {
    beforeDayjs = undefined;
  }

  let since = sinceDayjs.valueOf();
  try {
    let toggl = new Toggl({
      auth: {
        token: "14ae47743918e7eec62aeff746f6f59f",
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
            dayjs.duration(activityTime, "second").format("HHMMSS") + "",
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
