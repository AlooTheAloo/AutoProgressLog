import sqlite3 from "sqlite3";
import { syncDataPath } from "../getConfig";
import { SyncData, SyncType } from "../../types/sync";
import dayjs from "dayjs";



export async function GetLastEntry(type?:SyncType):Promise<SyncData>{
    return new Promise((resolve, reject) => {
        new sqlite3.Database(syncDataPath).all(`
            SELECT * FROM syncData 
            ${type ? `WHERE type = '${type}'` : ""}
            ORDER BY id DESC LIMIT 1
        `, (err, rows:any[]) => {
            if(err) reject(err);
            resolve(rows[0]);
        });
    })
}
export async function GetImmersionTimeSince(since:dayjs.Dayjs):Promise<number>{
    console.log(since.unix());
    return new Promise((resolve, reject) => {
        new sqlite3.Database(syncDataPath).all(`
            SELECT SUM(seconds) as "sum" FROM immersionActivity WHERE time > '${since.unix()}'
        `, (err, rows:any[]) => {
            console.log("sum is " + rows[0].sum);
            console.log("err " + err);

            if(err) {
                console.log("err is " + err);
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