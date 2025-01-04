import { ankiIntegration } from "../types/options.js";
import fs, { existsSync } from "fs";
import sqlite3 from 'sqlite3';
import { exec } from 'child_process';
import proc from 'find-process';
import { app, shell } from "electron";
import path, { basename } from "path";
import { kill } from "process";
import { readWindows } from "../Helpers/readWindows.js";
import { getSetupAnkiIntegration } from "../../electron/main/Electron-Backend/SetupConfigBuilder.js";

export interface ankiPaths{
    ankiDB: string,
    ankiPath: string,
    profile: string
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
    const prefsDBPath = path.join(getAnkiBase(), chosenProfile, "collection.anki2");
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
            deckCount: decks.length,
        })
    }))
    

    return ret;
}


const getAnkiBase = () => {
    if(process.platform == "darwin" || process.platform == "win32"){
        return path.join(app.getPath("appData"), "anki2");
    }
    else {
        // TODO: Linux
        return path.join(app.getPath("home"), ".local", "share", "Anki2");
    }
} 

export async function getAnkiProfiles():Promise<{name: string}[]>{
    const prefsDBPath = path.join(getAnkiBase(), "prefs21.db");
    const prefsDB = new sqlite3.Database(prefsDBPath, (err) => {});
    const profiles:{name: string}[] = await new Promise((res, rej) => {
        prefsDB.all("SELECT name FROM profiles WHERE name NOT IN ('_global')", (err, rows:any[]) => {
            res(rows);
        });
    });

   return profiles;
}

export let getAnkiProfileCount = async () => (await getAnkiProfiles()).length;

export async function getAnkiDBPaths(chosenProfile?:string):Promise<ankiPaths>{

    const prefsDBPath = path.join(getAnkiBase(), chosenProfile, "collection.anki2");
    let AppPath = "";

    if(process.platform == "darwin"){
        AppPath = path.join("/", "Applications", "Anki.app");
    }
    else if (process.platform == "win32"){
        // TODO : Windows
    }
    else {
        AppPath = path.join("/", "usr", "bin", "anki");
        if(!existsSync(AppPath)){
            AppPath = path.join("/", "usr", "bin", "local", "anki");
        }
    }
    
    await sleep(500);

    return {
        ankiDB: prefsDBPath,
        ankiPath: AppPath,
        profile: chosenProfile
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
    if(worked.at(0) == false) { 
        return false;
    }
    return {
        ankiDB: paths.ankiDB,
        ankiPath: paths.ankiPath,
        ankiProgramBinaryName: worked[1] as string,
        profile: paths.profile
    }
}

export async function KillAnkiIfOpen(){
    const targetProcesses = await getAnkiProcesses();
    if(targetProcesses.length == 0) return;
    const pid = targetProcesses[0].pid;
    kill(pid);
    let iterations = 0;
    return new Promise<void>(async (res, rej) => {
        var intervalClose = setInterval(async () => {
            if(iterations > 500) res(null);
            const remainingProcesses = await proc("name", "Anki")
            if(remainingProcesses.filter(x => x.pid == pid).length == 0){
                res();
                clearInterval(intervalClose);
            }
            iterations++;
        }, 500)
    });
   

}


// This function is pure hell. It's a mess.
export async function LaunchAnki(paths:ankiPaths|ankiIntegration){
        
    console.log("LAunching anki..");
    // Uncomment for funny
    // const Rand = Math.random();
    // console.log(Rand);
    // if( Rand > 0.5){
    //     shell.openExternal("https://www.youtube.com/watch?v=gQD2IZItlVk");
    // }
    // return [false, null];

    if(!fs.existsSync(paths.ankiPath)){
        console.log(`The file ${paths.ankiPath} does not exist. Please provide a valid path`.red);
        return [false, null];
    }

    const isOpened = (await getAnkiProcesses()).length > 0;
    const openCommand = (process.platform == "darwin" ? "open " : "") + paths.ankiPath;


    if(!isOpened){
        exec(openCommand);    
    }
    
    let iterations = 0;

    const resp = await new Promise<string|null>(async (res, rej) => {
        var intervalOpen = setInterval(async () => {
            if(iterations > 500) res(null);
            const targetProcesses = await getAnkiProcesses();
            if(targetProcesses.length == 0 && !isOpened) return;
            const pid = targetProcesses[0].pid;
            if((await readWindows([pid])).length > 0 || isOpened){
                if(!isOpened) await sleep(1000);
                try{
                    kill(pid);                    
                }
                catch(e){
                    console.log(e);
                }
                clearInterval(intervalOpen);
                var intervalClose = setInterval(async () => {
                    if(iterations > 500) res(null);
                    const remainingProcesses = await proc("name", "Anki")
                    if(remainingProcesses.filter(x => x.pid == pid).length == 0){
                        res(targetProcesses.filter(x => x.pid == pid)[0].cmd);
                        clearInterval(intervalClose);

                        if(isOpened){
                            exec(openCommand);    
                        }
                    }
                    iterations++;
                }, 500)
            }

            iterations++;
        }, 500);

    })
    if(typeof(resp) == null)
    {
        return [false, null];
    }
    
    return [true, resp];
}


export async function getAnkiProcesses():Promise<{
    pid: number;
    ppid?: number;
    uid?: number;
    gid?: number;
    name: string;
    cmd: string;
}[]>{
    const winDarProcesses = await proc("name",  "Anki")
    const linuxProcesses = await proc("name", "anki")
    const processes = winDarProcesses.concat(linuxProcesses);
    const targetProcesses = processes.filter(x => {
        const base = basename(x.cmd).toLowerCase();
        return base == "anki" || base == "anki.exe"
     });
     return targetProcesses
}



export const sleep = (ms:number) => new Promise<void>((res, rej) => setTimeout(() => { res() }, ms));
