import { LaunchAnki } from "../config/configAnkiIntegration";
import { GetLastEntry } from "../Helpers/DataBase/SearchDB";
import { WriteEntries, WriteSyncData } from "../Helpers/DataBase/WriteDB";
import { getConfig, syncDataPath } from "../Helpers/getConfig";
import { getTimeEntries } from "../toggl/toggl-service";
import sqlite3 from "sqlite3";
import { entry } from "../types/entry";
import { getAnkiCardReviewCount, getMatureCards, getRetention, hasSyncEnabled } from "../anki/db";
import dayjs from "dayjs";
import { sumTime } from "../Helpers/entryHelper";
import { CreateDTO } from "../../electron/main/Electron-Backend/DashboardListeners";
import { SyncData } from "../types/sync";

export interface AnkiSyncData {
    cardReview: number;
    matureCards: number;
    retention: number;
}

export interface syncProps {
    syncAnki: boolean;
    syncToggl: boolean;
}

const DEFAULT:syncProps = {
    syncAnki: true,
    syncToggl: true
}

export async function runSync(silent = false, props:syncProps = DEFAULT){
    
    let toggl:entry[] = [];
    let anki:AnkiSyncData = null;

    const [t, a] = await Promise.all([
        props.syncToggl ? syncToggl() : null,
        new Promise<AnkiSyncData>(async (res, rej) => {
            if(props.syncAnki == false) return res(null);
            if(hasSyncEnabled(getConfig().anki.ankiIntegration.profile) && !silent){
                await LaunchAnki(getConfig().anki.ankiIntegration);
            }
            syncAnki().then(res).catch(rej);
        })
    ])

    let lastEntry:SyncData|null = null;
    let time:number|null = null;
    
    toggl = t;
    anki = a;

    if(props.syncToggl)
    {
        lastEntry = await GetLastEntry();
        time = sumTime(toggl);
    }
   

    await WriteSyncData({
        id: 0,
        generationTime: dayjs().valueOf(),
        toggl: {
            totalSeconds: lastEntry.toggl.totalSeconds + time,
        },
        anki: {
            totalCardsStudied: lastEntry.anki.totalCardsStudied + anki.cardReview,
            cardsStudied: anki.cardReview,
            mature: anki.matureCards,
            retention: anki.retention,
        },
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


