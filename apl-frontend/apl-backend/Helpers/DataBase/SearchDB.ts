import sqlite3 from "sqlite3";
import { syncDataPath } from "../getConfig";
import { SyncData } from "../../types/sync";

export async function GetLastEntry():Promise<SyncData>{
    return new Promise((resolve, reject) => {
        new sqlite3.Database(syncDataPath).all(`
            SELECT * FROM syncData ORDER BY id DESC LIMIT 1
        `, (err, rows:any[]) => {
            if(err) reject(err);
            resolve(rows[0]);
        });
    })
}