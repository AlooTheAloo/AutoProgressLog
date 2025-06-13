import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import { sumTime } from "../Helpers/entryHelper.js";
import { getMatureCards, getRetention } from "../anki/db.js";
import {
  buildImage,
  buildJSON,
  buildLayout,
  buildNewCache,
} from "../Helpers/buildMessage.js";
import { getConfig, getSyncProps } from "../Helpers/getConfig.js";
import path from "path";
import { fileURLToPath } from "url";
import { CacheManager } from "../Helpers/cache.js";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { writeFileSync } from "fs";
import {
  GetImmersionSourcesSince,
  GetImmersionTimeSince,
  GetLastEntry,
} from "../Helpers/DataBase/SearchDB.js";
import { runSync, setSyncing } from "./sync.js";
import { Notification, shell } from "electron";
import { get } from "http";
import { TPlusDelta } from "../types/reportdata.js";
import { win } from "../../electron/main/index.js";
import { NotificationManager } from "../Helpers/notifications.js";

dayjs.extend(duration);
dayjs.extend(advancedFormat);

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export let isGenerating = false;

export async function runGeneration() {
  isGenerating = true;
  try {
    const worked = await runSync(getSyncProps());
    if (!worked) {
      NotificationManager.notify({
        header: "Cannot complete sync!",
        content:
          "APL was unable to generate a report. Potential cause of error : <b> computer turned off or not connected to the internet</b> ",
      });
      isGenerating = false;
      return;
    }
    setSyncing(true);
    const sync = await GetLastEntry("Full");
    console.log("3");

    if (sync == undefined) return;
    const syncID = sync.id;
    console.log("4");

    const startCache = CacheManager.peek();
    const generationTime = dayjs(startCache.generationTime);

    console.log("5");

    // Toggl stuff
    const events = await GetImmersionSourcesSince(generationTime);
    console.log("6");

    let count: null | number = null;
    let mature: null | number = null;
    let retention: null | number = null;

    // Anki stuff
    const config = getConfig();
    console.log("7");

    if (config == undefined) return;

    console.log("8");

    if (
      config.anki.enabled &&
      config.anki.ankiIntegration &&
      sync.anki &&
      config.anki.options
    ) {
      count = sync.anki.totalCardsStudied;
      mature = await getMatureCards();
      retention = await getRetention(config.anki.options.retentionMode);
    }
    console.log("9");

    const timeToAdd = (sync.toggl?.totalSeconds ?? 0) - startCache.totalSeconds;
    console.log("Adding " + timeToAdd + "seconds");
    const monthTime = await GetImmersionTimeSince(dayjs().startOf("month"));
    const oldBest = startCache.bestSeconds;
    const newBest = Math.max(timeToAdd, oldBest);
    const bestObject: TPlusDelta<number> = {
      current: newBest,
      delta: newBest - oldBest,
    };
    console.log("10" + bestObject);

    const json = buildJSON(
      {
        reviewCount: count ?? 0,
        matureCount: mature ?? 0,
        retention: retention ?? 0,
      },
      events,
      CacheManager.getLastN(30),
      {
        timeToAdd: timeToAdd,
        monthTime: monthTime,
        bestSeconds: bestObject,
      }
    );
    console.log("11");

    const layout = await buildLayout();
    if (layout == undefined) return;
    const imagePath = await buildImage(
      config.outputOptions,
      config.anki.enabled ? 1775 : 1375,
      json,
      layout
    );

    console.log("15");

    const notification = new Notification({
      title: `Report #${json.reportNo} generated!`,
      body: `Click here to open it in ${
        process.platform == "darwin" ? "Finder" : "File Explorer"
      }`,
    });
    console.log("16");

    notification.on("click", () => {
      shell.showItemInFolder(imagePath);
    });

    console.log("17");

    notification.show();
    console.log("18");

    // Output
    CacheManager.push(
      buildNewCache(json, startCache, timeToAdd, syncID, imagePath, newBest)
    );
    console.log("19");

    const DTO = await runSync(getSyncProps(true));
    console.log("20");

    setSyncing(false);
    console.log("21");
    isGenerating = false;
    return DTO;
  } catch (e: any) {
    NotificationManager.notify({
      header: "Apl broke :(",
      content:
        `APL was unable to generate a report due to an unknown error. <br>
        Please report an issue on the <a href='https://github.com/AlooTheAloo/AutoProgressLog/issues'>GitHub issue tracker</a>. <br> 
        Additional information : <br> 
        ` + (e.toString() ?? "No additional information provided"),
    });
    isGenerating = false;
    setSyncing(false);
    console.log(e);
    return;
  }
}
