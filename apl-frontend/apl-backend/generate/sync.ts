import { LaunchAnki } from "../config/configAnkiIntegration";
import { GetLastEntry } from "../Helpers/DataBase/SearchDB";
import { WriteEntries, WriteSyncData } from "../Helpers/DataBase/WriteDB";
import { getConfig, syncDataPath } from "../Helpers/getConfig";
import { getTimeEntries } from "../toggl/toggl-service";
import sqlite3 from "sqlite3";
import { entry } from "../types/entry";
import { getAnkiCardReviewCount, getMatureCards, getRetention } from "../anki/db";
import dayjs from "dayjs";
import { sumTime } from "../Helpers/entryHelper";
import { CreateDTO } from "../../electron/main/Electron-Backend/DashboardListeners";


export async function runSilentSync(){    
    syncToggl();
}

export async function runSync(){
    const lastEntry = await GetLastEntry();

    await LaunchAnki(getConfig().anki.ankiIntegration);
    const toggl = await syncToggl();
    const anki = await syncAnki();
    const time = sumTime(toggl);
    await WriteSyncData({
        id: 0,
        generationTime: dayjs().valueOf(),
        totalSeconds: lastEntry.totalSeconds + time,
        totalCardsStudied: lastEntry.totalCardsStudied + anki.cardReview,
        cardsStudied: anki.cardReview,
        mature: anki.matureCards,
        retention: anki.retention,
        type: "Full"
    }, toggl);

    return CreateDTO();
}


export async function syncAnki() {
    const anki = getConfig().anki;
    const lastEntry = await GetLastEntry("Full");
    const cardReview = await getAnkiCardReviewCount(dayjs(lastEntry.generationTime), anki.ankiIntegration);
    const matureCards = await getMatureCards(anki.ankiIntegration);
    const retention = await getRetention(anki.options.retentionMode, anki.ankiIntegration);
    return {
        cardReview: cardReview,
        matureCards: matureCards,
        retention: retention
    }
}

export async function syncToggl():Promise<entry[]>{
    const startSync = await GetLastEntry();
    const entries = await getTimeEntries(startSync.generationTime);
    return entries.entriesAfterLastGen;
}


