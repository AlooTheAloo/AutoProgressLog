import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
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
import {
  GetImmersionSourcesSince,
  GetImmersionTimeSince,
  GetLastEntry,
} from "../Helpers/DataBase/SearchDB.js";
import { runSync, setSyncing } from "./sync.js";
import { Notification, shell } from "electron";
import { TPlusDelta } from "../types/reportdata.js";
import { NotificationManager } from "../Helpers/notifications.js";

dayjs.extend(duration);
dayjs.extend(advancedFormat);

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export let isGenerating = false;

// TODO : Ship this entire thing to the server
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
    const config = getConfig();
    if (config == undefined) return;

    setSyncing(true);
    const sync = await GetLastEntry("Full");

    if (sync == undefined) return;
    const syncID = sync.id;

    const startCache = CacheManager.peek();
    const generationTime = dayjs(startCache.generationTime);

    // Toggl stuff
    const events = await GetImmersionSourcesSince(generationTime);

    let count: null | number = null;
    let mature: null | number = null;
    let retention: null | number = null;

    // Anki stuff
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

    const timeToAdd = (sync.toggl?.totalSeconds ?? 0) - startCache.totalSeconds;
    const monthTime = await GetImmersionTimeSince(dayjs().startOf("month"));
    const oldBest = startCache.bestSeconds;
    const newBest = Math.max(timeToAdd, oldBest);
    const bestObject: TPlusDelta<number> = {
      current: newBest,
      delta: newBest - oldBest,
    };

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

    const layout = await buildLayout();
    if (layout == undefined) return;

    // TODO : Make this into its seperate function
    const imagePath = await buildImage(
      config.outputOptions,
      config.anki.enabled ? 1775 : 1375,
      json,
      layout
    );

    new Notification({
      title: `Report #${json.reportNo} generated!`,
      body: `Click here to open it in ${
        process.platform == "darwin" ? "Finder" : "File Explorer"
      }`,
    })
      .on("click", () => {
        shell.showItemInFolder(imagePath);
      })
      .show();

    // Output
    CacheManager.push(
      buildNewCache(json, startCache, timeToAdd, syncID, imagePath, newBest)
    );

    const DTO = await runSync(getSyncProps(true));

    setSyncing(false);
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
    return;
  }
}
