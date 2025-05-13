import { ipcMain } from "electron";
import { runGeneration } from "../../../apl-backend/generate/generate";
import {
  getConfig,
  getSyncProps,
  syncDataPath,
} from "../../../apl-backend/Helpers/getConfig";
import {
  isSyncing,
  runSync,
  setSyncing,
} from "../../../apl-backend/generate/sync";
import { CacheManager } from "../../../apl-backend/Helpers/cache";
import { DashboardDTO } from "./types/Dashboard";
import {
  GetImmersionSourcesSince,
  GetImmersionStreak,
  GetImmersionTimeBetween,
  GetImmersionTimeSince,
  GetLastEntry,
  GetSyncCount,
} from "../../../apl-backend/Helpers/DataBase/SearchDB";
import dayjs from "dayjs";
import { roundTo } from "round-to";
import {
  checkInternet,
  notifyNoInternet,
} from "../../../apl-backend/Helpers/Healthcheck/internetHelper";
import { readFile } from "fs";
import { promises as fsPromises } from "fs";
import sharp from "sharp";

export function DashboardListeners() {
  ipcMain.handle("isSyncing", async (event: any) => {
    return isSyncing();
  });

  ipcMain.handle("GenerateReport", async (event: any) => {
    if (await runChecks()) {
      return await runGeneration();
    }
  });

  ipcMain.handle("Sync", async (event: any) => {
    if (await runChecks()) {
      const sync = await runSync(getSyncProps());
      if (sync == null) {
        setSyncing(false);
      }
      return sync;
    }
  });

  ipcMain.handle("Get-Dashboard-DTO", async (event: any) => {
    return await CreateDTO();
  });
}

export async function runChecks(): Promise<boolean> {
  const start = dayjs();
  const config = getConfig();
  if (!config) return false;
  if (await checkInternet()) {
    if (!config.anki.enabled) return true;
    return true;
  } else {
    notifyNoInternet();
    return false;
  }
}

function getNextReportTime() {
  const config = getConfig();
  if (!config?.general?.autogen?.enabled) return null;
  const time = config.general.autogen.options.generationTime;
  const now = dayjs();

  // Create a dayjs instance for today with the given time
  let reportTime = now.hour(time.hours).minute(time.minutes).second(0);

  // If the time has already passed today, move to the next day
  if (reportTime.isBefore(now)) {
    reportTime = reportTime.add(1, "day");
  }

  // Format the time as "MMM D, YYYY at h:mm A"
  return reportTime.valueOf();
}

export async function CreateDTO() {
  const lastEntry = await GetLastEntry();
  const lastReport = await CacheManager.peek();
  const config = getConfig();
  if (config == undefined) return undefined;
  const thisMonth = await GetImmersionTimeSince(dayjs().startOf("month"));
  const lastMonth = await GetImmersionTimeBetween(
    dayjs().subtract(1, "month").startOf("month"),
    dayjs().subtract(1, "month")
  );

  const pfp_buffer = await createPfpBuffer(config.account.profilePicture);

  const DTO: DashboardDTO = {
    userName: config.account.userName,
    profile_picture: pfp_buffer,
    lastSyncTime: dayjs(lastEntry?.generationTime).toISOString(),
    lastReportTime: lastReport.generationTime,
    ankiDTO: config.anki.enabled
      ? {
          retentionRate: lastEntry?.anki?.retention ?? 0,
          retentionRateDelta: roundTo(
            roundTo(lastEntry?.anki?.retention ?? 0, 2) -
              roundTo(lastReport.retention ?? 0, 2),
            2
          ),

          totalReviews: lastEntry?.anki?.totalCardsStudied ?? 0,
          reviewsDelta:
            (lastEntry?.anki?.totalCardsStudied ?? 0) -
            lastReport.totalCardsStudied,
        }
      : undefined,
    immersionDTO: {
      totalImmersion: lastEntry?.toggl?.totalSeconds ?? 0,
      immersionSinceLastReport: await GetImmersionTimeSince(
        dayjs(lastReport.generationTime)
      ),
      monthlyImmersion: thisMonth,
      monthlyImmersionLastMonth: lastMonth,
      immersionSources: await GetImmersionSourcesSince(
        dayjs().subtract(1, "month")
      ),
      immersionStreak: await GetImmersionStreak(),
    },
    monthlyScore: 0,
    syncCount: await GetSyncCount(),
    nextReport: getNextReportTime(),
  };
  return DTO;
}

async function createPfpBuffer(path: string) {
  if (path.includes("profilePicture.apl")) {
    // Read the image file
    const file = await fsPromises.readFile(path);
    const sharpFile = await sharp(file);
    // Resize the image using sharp and convert it to base64
    const resizedBase64 = await sharpFile
      .toBuffer()
      .then((buffer) => buffer.toString("base64")) // Convert buffer to base64
      .catch((err) => {
        throw new Error("Error resizing image");
      });
    return {
      buffer: resizedBase64,
      isUrl: false,
    };
  } else {
    return {
      buffer: path,
      isUrl: true,
    };
  }
}
