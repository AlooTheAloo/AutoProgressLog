import { getAnkiProcesses, KillAnkiIfOpen, LaunchAnki } from "../config/configAnkiIntegration";
import { GetActivitiesBetween, GetLastEntry, getreadinghours } from "../Helpers/DataBase/SearchDB";
import { DeleteActivity, ModifyActivityByID, WriteEntries, WriteSyncData } from "../Helpers/DataBase/WriteDB";
import { getConfig, syncDataPath } from "../Helpers/getConfig";
import { getTimeEntries, toggl } from "../toggl/toggl-service";
import { entry } from "../types/entry";
import { getAnkiCardReviewCount, getLastUpdate, getMatureCards, getRetention, hasSyncEnabled } from "../anki/db";
import dayjs from "dayjs";
import { sumTime } from "../Helpers/entryHelper";
import { CreateDTO } from "../../electron/main/Electron-Backend/DashboardListeners";
import { SyncData } from "../types/sync";
import { CacheManager } from "../Helpers/cache";
import { hasPerms } from "../Helpers/readWindows";
import { ipcMain } from "electron";
import { win } from "../../electron/main";

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

const DEFAULT:syncProps = {
    syncAnki: true,
    syncToggl: true,
    isReport: false
}

let syncing = false;

export function setSyncing(value:boolean){
    win.webContents.send("SetSync", value);
    syncing = value;
}

export function isSyncing(){
    return syncing;
}


export async function runSync(silent = false, props:syncProps = DEFAULT, sendSyncing = true){
    if(!props.isReport && sendSyncing){
        setSyncing(true);
    } 

    let toggl:{
        entries : entry[]
        delta: number
    };
    let anki:AnkiSyncData = null;

    const [t, a] = await Promise.all([
        props.syncToggl ? syncToggl() : null,
        new Promise<AnkiSyncData|null>(async (res, rej) => {
            if(props.syncAnki == false) return res(null);
            if(hasSyncEnabled(getConfig().anki.ankiIntegration.profile) && !silent){
                await LaunchAnki(getConfig().anki.ankiIntegration);
                syncAnki(props.isReport).then(res).catch(rej);
            }
            if(silent){
                syncAnkiIfClosed().then(res).catch(() => {
                    res(null);
                });
            }

        })
    ])

    let lastEntry:SyncData|null = await GetLastEntry();
    let time:number|null = null;
    
    toggl = t;
    if(a == null)
    {
        anki = {
            cardReview: 0,
            matureCards: lastEntry.anki.mature,
            retention: lastEntry.anki.retention,
            lastUpdate: lastEntry.anki.lastAnkiUpdate
        }
    }
    else anki = a;

    if(props.syncToggl)
    {
        time = sumTime(toggl.entries) + toggl.delta;
    }
   
    await WriteSyncData({
        generationTime: dayjs().valueOf(),
        toggl: props.syncToggl ? {
            totalSeconds: lastEntry.toggl.totalSeconds + time,
        } : null,
        anki: props.syncAnki ? {
            totalCardsStudied: lastEntry.anki.totalCardsStudied + anki.cardReview,
            cardsStudied: anki.cardReview,
            mature: anki.matureCards,
            retention: anki.retention,
            lastAnkiUpdate: anki.lastUpdate,
        } : null,
        type: "Full",
    }, toggl.entries);



    if(!props.isReport && sendSyncing){
        setSyncing(false);
    } 

    const h = await getreadinghours();
    return CreateDTO();
}

export async function syncAnkiIfClosed():Promise<AnkiSyncData>{
    const targetProcesses = await getAnkiProcesses();
    if(targetProcesses.length != 0) return;
    return await syncAnki(false);
}

export async function syncAnki(isReport = false):Promise<AnkiSyncData> {
    console.log("Syncing Anki");
    const anki = getConfig().anki;
    const lastEntry = await GetLastEntry("Full");
    const cardReview = await getAnkiCardReviewCount(dayjs(lastEntry.anki?.lastAnkiUpdate ?? lastEntry.generationTime), anki.ankiIntegration);
    const matureCards = await getMatureCards(anki.ankiIntegration);
    const retention = await getRetention(anki.options.retentionMode, anki.ankiIntegration);
    const lastUpdate = isReport ? dayjs().valueOf() : Math.max(lastEntry.anki.lastAnkiUpdate, await getLastUpdate(anki.ankiIntegration));
    return {
        cardReview: cardReview,
        matureCards: matureCards,
        retention: retention,
        lastUpdate: lastUpdate
    }
}

export async function VerifyPreviousActivities(from:dayjs.Dayjs, to:dayjs.Dayjs, togglEntries:entry[] = []):Promise<number>{
    let delta = 0;
    const dbEntries = await GetActivitiesBetween(from, to);

    const dbIDs = dbEntries.map(x => x.id);
    const togglIDs = togglEntries.map(x => x.id);

    // Modified
    togglEntries.filter(x => dbIDs.includes(x.id)).forEach(entry => {
        const dbEntry = dbEntries.find(x => x.id == entry.id);
        if([() => dbEntry.time !== dayjs(entry.stop).unix(),
            () => dbEntry.seconds !== entry.duration,
            () => dbEntry.activityName !== entry.description].some(check => check())){
            delta += entry.duration - dbEntry.seconds;
            ModifyActivityByID(entry.id, entry);
        }
    })

    // Added
    const toAdd = togglEntries.filter(x => !dbIDs.includes(x.id) && dayjs(x.stop).unix() > from.unix() && dayjs(x.stop).unix() < to.unix());
    await WriteEntries(toAdd);

    delta += toAdd.reduce((acc, x) => acc + x.duration, 0);


    // Removed
    const toRemove = dbEntries.filter(x => !togglIDs.includes(x.id));
    await Promise.all(toRemove.map(x => DeleteActivity(x.id)));
    delta -= toRemove.reduce((acc, x) => acc + x.seconds, 0);
    return delta;
} 


export async function syncToggl():Promise<{entries: entry[], delta:number}>{
    const lastReportTime = await CacheManager.peek().generationTime;
    const startSync = await GetLastEntry();
    const entries = await getTimeEntries(lastReportTime);
    const delta = await VerifyPreviousActivities(dayjs(lastReportTime), dayjs(startSync.generationTime), entries.entriesAfterLastGen);
    return {
        entries: entries.entriesAfterLastGen.filter(x => dayjs(x.stop).isAfter(startSync.generationTime)),
        delta: delta
    }
}


