import { ankiIntegration } from "../types/options.js";
import fs from "fs";
import sqlite3 from 'sqlite3';
import { exec } from 'child_process';
import proc from 'find-process';
import { app } from "electron";
import path, { basename } from "path";
import { kill } from "process";
import { readWindows } from "../Helpers/readWindows.js";
import { getSetupAnkiIntegration } from "../../electron/main/Electron-Backend/SetupConfigBuilder.js";

interface ankiPaths{
    ankiDB: string,
    ankiPath: string,
}

interface deck {
    name: string,
    cardCount: number,
    id: number
}

export async function getDecksCards():Promise<deck[]>{

    const prefsDB = new sqlite3.Database(getSetupAnkiIntegration().ankiDB, (err) => {});
    return await new Promise((res, rej) => {
            prefsDB.all(`SELECT COUNT(*) as "cardCount", did FROM cards group by did;`, async (err, rowsTop:{cardCount: number, did: number}[]) => {
            
            const ret = await Promise.all(rowsTop.map(async (row) => {
                return await new Promise<deck>((res, rej) => {
                    prefsDB.all(`SELECT name FROM decks WHERE id = ${row.did};`, (err, rows:any) => {
                        res(
                        {
                            cardCount: row.cardCount,
                            name: rows[0].name,
                            id: row.did
                        });
                    });
                })
            }))
            res(ret);
            
        });
    });
}

export async function getDecks(chosenProfile?:string):Promise<string[]>{
    const prefsDBPath = path.join(app.getPath("appData"), "anki2", chosenProfile, "collection.anki2");
    const prefsDB = new sqlite3.Database(prefsDBPath, (err) => {});
    
    const decks:string[] = await new Promise((res, rej) => {
        prefsDB.all("SELECT * FROM decks", (err, rows:any[]) => {
            res(rows);
        });
    });

    prefsDB.close();
   return decks;
}

export async function getProfileDecks():Promise<{name: string, deckCount: number}[]>{
    const profiles = await getAnkiProfiles();
    const ret:{name: string, deckCount: number}[] = [];
    await Promise.all(profiles.map(async (profile) => {
        const decks = await getDecks(profile.name);
        ret.push({
            name: profile.name,
            deckCount: decks.length
        })
    }))
    

    return ret;
}


export async function getAnkiProfiles():Promise<{name: string}[]>{
    const prefsDBPath = path.join(app.getPath("appData"), "anki2", "prefs21.db");
    const prefsDB = new sqlite3.Database(prefsDBPath, (err) => {});
    console.log(prefsDBPath);
    const profiles:{name: string}[] = await new Promise((res, rej) => {
        prefsDB.all("SELECT name FROM profiles WHERE name NOT IN ('_global')", (err, rows:any[]) => {
            res(rows);
        });
    });

   return profiles;
}

export let getAnkiProfileCount = async () => (await getAnkiProfiles()).length;

export async function getAnkiDBPaths(chosenProfile?:string):Promise<ankiPaths>{

    const prefsDBPath = path.join(app.getPath("appData"), "anki2", chosenProfile, "collection.anki2");
    let AppPath = "";

    if(process.platform == "darwin"){
        AppPath = path.join("/", "Applications", "Anki.app");
    }
    else if (process.platform == "win32"){
        AppPath = path.join(app.getPath("appData"), "Anki2");
    }
    else {
        // TODO: Linux :(
    }
    
    await sleep(500);

    return {
        ankiDB: prefsDBPath,
        ankiPath: AppPath
    };
}


export async function verifyAnkiPaths(paths:ankiPaths):Promise<boolean>{
    if(!fs.existsSync(paths.ankiDB)){
        console.log(`The file ${paths.ankiDB} does not exist. Please provide a valid path`.red);
        return false;
    }
    
    const res = await new Promise<boolean>((res, rej) => {
        // Create a database connection
        const db = new sqlite3.Database(paths.ankiDB, (err) => {
            if (err) {
                console.log(`The database file could not be opened. Make sure you followed the instructions in the README properly and try again.`.red)
                res(false);
            }
            else {
                res(true);   
            }
        })
    })

    if(!res) return false;
    if(!fs.existsSync(paths.ankiPath)){
        console.log(`The file ${paths.ankiPath} does not exist. Please provide a valid path`.red);
        return false;
    }

    await sleep(500);

    return true;
}



export async function createAnkiIntegration(paths:ankiPaths):Promise<ankiIntegration|false>{
    const worked = await LaunchAnki(paths);
    if(worked == false) { 
        return false;
    }
    return {
        ankiDB: paths.ankiDB,
        ankiPath: paths.ankiPath,
        ankiProgramBinaryName: worked[1] as string
    }
}


// This function is pure hell. It's a mess.
export async function LaunchAnki(paths:ankiPaths|ankiIntegration){
        
    if(!fs.existsSync(paths.ankiPath)){
        console.log(`The file ${paths.ankiPath} does not exist. Please provide a valid path`.red);
        return false;
    }

    let shouldKill = true;

    if("ankiProgramBinaryName" in paths){
        shouldKill = !(await proc("name", "Anki")).some(x => x.cmd == paths.ankiProgramBinaryName)
    }

    const command = (process.platform == "darwin" ? "open " : "") + paths.ankiPath;
    exec(command);

    let iterations = 0;

    const resp = await new Promise<string|null>(async (res, rej) => {
        var intervalOpen = setInterval(async () => {
            if(iterations > 500) res(null);
            const processes = await proc("name", "Anki")
            if(processes.length == 0) return;

            const targetProcesses = processes.filter(x => {
               const base = basename(x.cmd).toLowerCase();
               return base == "anki" || base == "anki.exe"
            });
            if(targetProcesses.length == 0) return;
            const pid = targetProcesses[0].pid;
            if((await readWindows([pid])).length > 0){
                await sleep(1000);
                kill(pid);
                clearInterval(intervalOpen);
                var intervalClose = setInterval(async () => {
                    if(iterations > 500) res(null);
                    const remainingProcesses = await proc("name", "Anki")
                    if(remainingProcesses.filter(x => x.pid == pid).length == 0){
                        res(processes.filter(x => x.pid == pid)[0].cmd);
                        clearInterval(intervalClose);
                    }
                    iterations++;
                }, 500)
            }

            iterations++;
        }, 500);

    })

    if(resp == null)
    {
        return false;
    }
    
    return [true, resp];
}



export const sleep = (ms:number) => new Promise<void>((res, rej) => setTimeout(() => { res() }, ms));
