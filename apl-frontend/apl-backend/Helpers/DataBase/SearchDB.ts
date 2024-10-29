import sqlite3 from "sqlite3";
import { syncDataPath } from "../getConfig";
import { ImmersionActivity, SyncData, SyncType } from "../../types/sync";
import dayjs from "dayjs";

interface flatSyncData {
    id: number;
    generationTime: number;
    type: SyncType;
    totalCardsStudied: number;
    cardsStudied: number;
    mature: number;
    retention: number;
    totalSeconds: number;
    lastAnkiUpdate: number;
}

export async function GetLastEntry(type?:SyncType):Promise<SyncData>{
    return new Promise((resolve, reject) => {
        new sqlite3.Database(syncDataPath).all(`
            SELECT * FROM syncData 
            ${type ? `WHERE type = '${type}'` : ""}
            ORDER BY id DESC LIMIT 1
        `, (err, rows:flatSyncData[]) => {
            if(err) reject(err);
            const flat = rows[0];
            console.log(flat);
            resolve({
                id: flat.id,
                generationTime: flat.generationTime,
                type: flat.type,
                anki: {
                    totalCardsStudied: flat.totalCardsStudied,
                    cardsStudied: flat.cardsStudied,
                    mature: flat.mature,
                    retention: flat.retention,
                    lastAnkiUpdate: flat.lastAnkiUpdate
                },
                toggl: {
                    totalSeconds: flat.totalSeconds,
                } 
            })
        });
    })
}

export async function GetActivitiesBetween(since:dayjs.Dayjs, until:dayjs.Dayjs):Promise<ImmersionActivity[]>{
    return new Promise((resolve, reject) => {
        new sqlite3.Database(syncDataPath).all(`
            SELECT * FROM immersionActivity WHERE time > '${since.unix()}' AND time < '${until.unix()}'
        `, (err, rows:ImmersionActivity[]) => {
            if(err) reject(err);
            resolve(rows) 
        });
    })
}



export async function GetImmersionTimeSince(since:dayjs.Dayjs):Promise<number>{
    return new Promise((resolve, reject) => {
        new sqlite3.Database(syncDataPath).all(`
            SELECT SUM(seconds) as "sum" FROM immersionActivity WHERE time > '${since.unix()}'
        `, (err, rows:any[]) => {
            if(err) {
                reject(err);
            } 
            resolve(rows[0].sum ?? 0);
        });
    })
}

export async function GetImmersionTimeBetween(since:dayjs.Dayjs, until:dayjs.Dayjs):Promise<number>{
    return new Promise((resolve, reject) => {
        new sqlite3.Database(syncDataPath).all(`
            SELECT SUM(seconds) as "sum" FROM immersionActivity WHERE time > '${since.unix()}' AND time < '${until.unix()}'
        `, (err, rows:any[]) => {
            if(err) {
                reject(err);
            } 
            resolve(rows[0].sum ?? 0);
        });
    })
}


export async function GetImmersionSourcesSince(since:dayjs.Dayjs):Promise<{name: string;relativeValue: number; }[]>{
    return new Promise((resolve, reject) => {
        new sqlite3.Database(syncDataPath).all(`
            SELECT activityName AS "name", SUM(seconds) AS "relativeValue" FROM immersionActivity WHERE time > '${since.unix()}' GROUP BY activityName
        `, (err, rows:any[]) => {
            if(err) reject(err);
            resolve(rows);
        });
    })
}

export async function GetSyncCount(){
    return new Promise<number>((resolve, reject) => {
        new sqlite3.Database(syncDataPath).all(`
            SELECT COUNT(*) AS 'syncs' FROM syncData;  
        `, (err, rows:any[]) => {
            if(err) reject(err);
            resolve(rows[0].syncs as number);
        });
    })
}