import { entry } from "../../types/entry";
import sqlite3 from "sqlite3";
import { syncDataPath } from "../getConfig";
import dayjs from "dayjs";
import { SyncData } from "../../types/sync";

export async function WriteEntries(entries:entry[], syncDataId:number = -1){
    if(entries.length == 0) return;
    
    return new Promise<void>((res, rej) => {
        const query = `INSERT OR IGNORE INTO immersionActivity (id, syncDataId, time, seconds, activityName) VALUES 
    ${
        entries.map((x) => {
            return `(${x.id}, ${syncDataId}, '${dayjs(x.stop).unix()}', ${x.duration}, '${x.description}')`
        }).join(", \n")
    }`;
        new sqlite3.Database(syncDataPath).all(query, (err, rows:any[]) => {
            if(err){
                console.log(err);
            }
            res();
        });
    })
}

export async function WriteSyncData(syncData:SyncData, entries:entry[]){
    return new Promise<void>((res, rej) => {
        new sqlite3.Database(syncDataPath).all(`
            INSERT INTO syncData (generationTime, totalSeconds, totalCardsStudied, cardsStudied, mature, retention, type) VALUES 
            (${syncData.generationTime}, ${syncData.toggl.totalSeconds}, ${syncData.anki.totalCardsStudied}, ${syncData.anki.cardsStudied}, ${syncData.anki.mature}, ${syncData.anki.retention}, '${syncData.type}')
            RETURNING id;
            `, async (err, rows:{id:number}[]) => {
            if(err){
                console.log(err);
            }
            await WriteEntries(entries, rows[0].id);
            res();
        });
    })
}