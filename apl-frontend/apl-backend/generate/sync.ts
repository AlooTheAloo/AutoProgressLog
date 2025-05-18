import {
  GetActivitiesBetween,
  GetLastEntry,
  getreadinghours,
  getTotalTime,
} from "../Helpers/DataBase/SearchDB";
import {
  DeleteActivity,
  ModifyActivityByID,
  WriteEntries,
  WriteSyncData,
} from "../Helpers/DataBase/WriteDB";
import { ankiPath, getConfig, syncDataPath } from "../Helpers/getConfig";
import { getTimeEntries, toggl } from "../toggl/toggl-service";
import { entry } from "../types/entry";
import {
  getAnkiCardReviewCount,
  getLastUpdate,
  getMatureCards,
  getRetention,
} from "../anki/db";
import dayjs from "dayjs";
import { sumTime } from "../Helpers/entryHelper";
import { CreateDTO } from "../../electron/main/Electron-Backend/DashboardListeners";
import { SyncData } from "../types/sync";
import { CacheManager } from "../Helpers/cache";
import { win } from "../../electron/main";
import NormalSyncer from "../entry/NormalSyncer";
import AnkiHTTPClient from "../entry/AnkiHTTPClient";
import Storage from "../entry/Storage";
import { NotificationManager } from "../Helpers/notifications";

export interface AnkiSyncData {
  cardReview: number;
  matureCards: number;
  retention: number;
  lastUpdate: number;
}

export interface syncProps {
  syncAnki: boolean;
  syncToggl: boolean;

  isReport: boolean;
}

const DEFAULT: syncProps = {
  syncAnki: true,
  syncToggl: true,
  isReport: false,
};

let syncing = false;

export function setSyncing(value: boolean) {
  if (win?.isDestroyed()) return;
  win?.webContents.send("SetSync", value);
  syncing = value;
}

export function isSyncing() {
  return syncing;
}

export async function runSync(props: syncProps = DEFAULT) {
  let toggl: {
    entries: entry[];
    delta: number;
  };
  let anki: AnkiSyncData | null = null;

  let t;
  let a;
  try {
    [t, a] = await Promise.all([
      props.syncToggl ? syncToggl() : null,
      new Promise<AnkiSyncData | null>(async (res, rej) => {
        const start = dayjs();
        if (props.syncAnki == false) return res(null);
        const config = getConfig();
        if (config == undefined) return res(null);
        await syncAnki(props.isReport)
          .then(res)
          .catch((e) => {
            console.log("Anki sync failed" + e);
            rej();
          });
        console.log(
          "Finished syncing anki in ",
          dayjs().diff(start, "ms") + " ms"
        );
      }),
    ]);
  } catch (e) {
    console.log("Sync failed" + e);
    return false;
  }

  if (t == null) {
    NotificationManager.notify({
      header: "Cannot complete sync!",
      content:
        "APL is unable to perform a synchronisation with the toggl servers. <br> <b>Potential cause of error : Invalid toggl token.</b> ",
    });
    return null;
  }

  let lastEntry: SyncData | null = await GetLastEntry();
  if (lastEntry?.toggl == undefined) return null;

  toggl = t;
  if (a == null) {
    anki = {
      cardReview: 0,
      matureCards: lastEntry.anki?.mature ?? 0,
      retention: lastEntry.anki?.retention ?? 0,
      lastUpdate: lastEntry.anki?.lastAnkiUpdate ?? 0,
    };
  } else anki = a;

  const time =
    toggl.delta == 0
      ? lastEntry.toggl.totalSeconds + sumTime(toggl.entries)
      : await getTotalTime();

  await WriteSyncData(
    {
      generationTime: dayjs().valueOf(),
      toggl: props.syncToggl
        ? {
            totalSeconds: time,
          }
        : undefined,
      anki: props.syncAnki
        ? {
            totalCardsStudied:
              (lastEntry.anki?.totalCardsStudied ?? 0) + anki.cardReview,
            cardsStudied: anki.cardReview,
            mature: anki.matureCards,
            retention: anki.retention,
            lastAnkiUpdate: anki.lastUpdate,
          }
        : undefined,
      type: "Full",
    },
    toggl.entries
  );

  return CreateDTO();
}

export async function syncAnki(isReport = false): Promise<AnkiSyncData | null> {
  const anki = getConfig()?.anki;

  if (!anki?.enabled) return null;
  if (anki.ankiIntegration == undefined) return null;

  let httpClient = new AnkiHTTPClient(
    anki?.ankiIntegration?.key,
    anki?.ankiIntegration?.url
  );
  let syncer: NormalSyncer = new NormalSyncer(
    httpClient,
    new Storage(ankiPath)
  );

  const lastEntry = await GetLastEntry("Full");
  if (lastEntry == null) return null;
  const worked = await syncer.start();
  if (!worked) {
    NotificationManager.notify({
      header: "Invalid anki key!",
      content:
        "APL is unable to connect with your anki account. <br> <b>Potential cause of error : Invalid anki key</b> ",
    });
    return null;
  }
  if (
    Number.isNaN(Number(lastEntry.anki?.lastAnkiUpdate)) &&
    lastEntry.anki != undefined
  ) {
    lastEntry.anki.lastAnkiUpdate = lastEntry.generationTime;
  }

  let time = Number(lastEntry.anki?.lastAnkiUpdate);
  if (time == undefined || Number.isNaN(time)) {
    time = lastEntry.generationTime;
  }

  const cardReview = await getAnkiCardReviewCount(dayjs(time));
  const matureCards = await getMatureCards();
  const retention = await getRetention(anki.options.retentionMode);
  const lastUpdate = isReport
    ? dayjs().valueOf()
    : Math.max(lastEntry?.anki?.lastAnkiUpdate ?? 0, await getLastUpdate());

  if (
    cardReview == null ||
    matureCards == null ||
    retention == null ||
    lastUpdate == null
  ) {
    NotificationManager.notify({
      header: "Cannot read anki data!",
      content:
        "APL is unable to connect with your anki account. <br> <b>Potential cause of error : Never tested anki key.</b> ",
    });
    return null;
  }
  return {
    cardReview: cardReview,
    matureCards: matureCards,
    retention: retention,
    lastUpdate: lastUpdate,
  };
}

export async function VerifyPreviousActivities(
  from: dayjs.Dayjs,
  to: dayjs.Dayjs,
  togglEntries: entry[] = []
): Promise<number> {
  let delta = 0;
  const dbEntries = await GetActivitiesBetween(from, to);

  const dbIDs = dbEntries.map((x) => x.id);
  const togglIDs = togglEntries.map((x) => x.id);

  // Modified
  // first, filter down to only entries you care about
  const toProcess = togglEntries.filter((x) => dbIDs.includes(x.id));

  const modifyPromises = toProcess.map((entry) => {
    const dbEntry = dbEntries.find((x) => x.id === entry.id);
    if (!dbEntry) return Promise.resolve();

    // if any of these checks is true, we need to modify
    const needsUpdate = [
      () => dbEntry.time !== dayjs(entry.stop).unix(),
      () => dbEntry.seconds !== entry.duration,
      () => dbEntry.activityName !== entry.description,
    ].some((check) => check());

    if (!needsUpdate) return Promise.resolve();

    // update delta immediately
    delta += entry.duration - dbEntry.seconds;

    // return the async modify call (so Promise.all will wait on it)
    return ModifyActivityByID(entry.id, entry).then(() =>
      console.log(`Modified ${entry.id}`)
    );
  });

  // wait for *all* of the modifications (or no-ops) to finish
  await Promise.all(modifyPromises);

  // Added
  const toAdd = togglEntries.filter(
    (x) =>
      !dbIDs.includes(x.id) &&
      dayjs(x.stop).unix() > from.unix() &&
      dayjs(x.stop).unix() < to.unix()
  );

  await WriteEntries(toAdd);

  delta += toAdd.reduce((acc, x) => acc + x.duration, 0);

  // Removed
  const toRemove = dbEntries.filter((x) => !togglIDs.includes(x.id));
  await Promise.all(toRemove.map((x) => DeleteActivity(x.id)));
  delta -= toRemove.reduce((acc, x) => acc + x.seconds, 0);
  return delta;
}

export async function syncToggl(): Promise<{
  entries: entry[];
  delta: number;
} | null> {
  const lastReportTime = await CacheManager.peek().generationTime;
  const startSync = await GetLastEntry();

  if (startSync == null) return null;
  const entries = await getTimeEntries(dayjs(lastReportTime));

  if (entries == null) return null;
  const delta = await VerifyPreviousActivities(
    dayjs(lastReportTime),
    dayjs(startSync.generationTime),
    entries.entriesAfterLastGen
  );
  return {
    entries: entries.entriesAfterLastGen.filter(
      (x) =>
        dayjs(x.stop).isAfter(startSync.generationTime) &&
        dayjs(x.stop).isBefore(dayjs())
    ),
    delta: delta,
  };
}
