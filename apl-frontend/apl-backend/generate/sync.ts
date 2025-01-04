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
    win?.webContents.send("SetSync", value);
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
    let anki:AnkiSyncData|null = null;

    const [t, a] = await Promise.all([
        props.syncToggl ? syncToggl() : null,
        new Promise<AnkiSyncData|null>(async (res, rej) => {
            if(props.syncAnki == false) return res(null);
            const config = getConfig();
            if(config == undefined) return res(null);
            if(await hasSyncEnabled(config.anki?.ankiIntegration?.profile ?? "") && !silent){
                if(config.anki?.ankiIntegration == undefined) return res(null);
                await LaunchAnki(config.anki?.ankiIntegration);
                syncAnki(props.isReport).then(res).catch(rej);
            }
            if(silent){
                syncAnkiIfClosed().then((data) => {res(data ?? null)}).catch(() => {
                    res(null);
                });
            }

        })
    ])

    if(t == null) return null;

    let lastEntry:SyncData = await GetLastEntry();
    if(lastEntry.toggl == undefined) return null;

    let time:number = 0;
    
    toggl = t;
    if(a == null)
    {
        anki = {
            cardReview: 0,
            matureCards: lastEntry.anki?.mature ?? 0,
            retention: lastEntry.anki?.retention ?? 0,
            lastUpdate: lastEntry.anki?.lastAnkiUpdate ?? 0
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
        } : undefined,
        anki: props.syncAnki ? {
            totalCardsStudied: (lastEntry.anki?.totalCardsStudied ?? 0)+ anki.cardReview,
            cardsStudied: anki.cardReview,
            mature: anki.matureCards,
            retention: anki.retention,
            lastAnkiUpdate: anki.lastUpdate,
        } : undefined,
        type: "Full",
    }, toggl.entries);



    if(!props.isReport && sendSyncing){
        setSyncing(false);
    } 

    const h = await getreadinghours();
    return CreateDTO();
}

export async function syncAnkiIfClosed():Promise<AnkiSyncData|undefined>{
    const targetProcesses = await getAnkiProcesses();
    if(targetProcesses.length != 0) return;
    return await syncAnki(false) ?? undefined;
}

export async function syncAnki(isReport = false):Promise<AnkiSyncData | null> {

    const anki = getConfig()?.anki;
    const integration = anki?.ankiIntegration;
    if(integration == undefined || !anki?.enabled) return null;
    const lastEntry = await GetLastEntry("Full");
    const cardReview = await getAnkiCardReviewCount(dayjs(lastEntry.anki?.lastAnkiUpdate ?? lastEntry.generationTime), integration);
    const matureCards = await getMatureCards(integration);
    const retention = await getRetention(anki.options.retentionMode, integration);
    const lastUpdate = isReport ? dayjs().valueOf() : Math.max(lastEntry?.anki?.lastAnkiUpdate ?? 0, await getLastUpdate(integration));
    
    if(cardReview == null || matureCards == null || retention == null || lastUpdate == null) return null;
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

        if(dbEntry == undefined) return;

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


