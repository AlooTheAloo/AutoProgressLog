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

export interface deck {
    name: string,
    cardCount: number,
    id: number
}




export async function getDecksCards(ankiDBPath?:string):Promise<deck[]>{

    const integration = getSetupAnkiIntegration();
    const ankiDB = ankiDBPath ?? integration?.ankiDB;
    if(ankiDB == undefined) return [];

    const prefsDB = new sqlite3.Database(ankiDB, (err) => {});
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
            prefsDB.close();
            res(ret);
            
        });
    });
}

export async function getDecks(chosenProfile:string):Promise<string[]>{
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

export async function getProfileDecks():Promise<{name: string, deckCount: number}[]|false>{
    const profiles = await getAnkiProfiles();
    if(profiles == undefined) return [];
    let died = false;
    const ret:{name: string, deckCount: number}[] = [];
    await Promise.all(profiles.map(async (profile) => {
        const decks = await getDecks(profile.name);
        if(decks == undefined) { died = true; return; };
        ret.push({
            name: profile.name,
            deckCount: decks.length,
        })
    }))
    
    if(died) return false;

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

export async function getAnkiProfiles():Promise<{name: string}[]|null>{
    const prefsDBPath = path.join(getAnkiBase(), "prefs21.db");
    console.log(prefsDBPath);
    const prefsDB = new sqlite3.Database(prefsDBPath, (err) => {});
    const profiles:{name: string}[]|null = await new Promise((res, rej) => {
        prefsDB.all("SELECT name FROM profiles WHERE name NOT IN ('_global')", (err, rows:any[]) => {
            res(rows);
        });
    });

   return profiles;
}

export let getAnkiProfileCount = async () => {
    const profiles = await getAnkiProfiles();
    if(profiles == undefined) return 0;
    return profiles.length;
}
export async function getAnkiDBPaths(chosenProfile:string):Promise<ankiPaths>{

    const prefsDBPath = path.join(getAnkiBase(), chosenProfile, "collection.anki2");
    let AppPath = "";

    if(process.platform == "darwin"){
        AppPath = path.join("/", "Applications", "Anki.app");
    }
    else if (process.platform == "win32"){
        // TODO : Windows
        AppPath = path.join(app.getPath("appData"), "..", "Local", "Programs", "Anki", "anki.exe")
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
        profile: paths.profile
    }
}

export async function KillAnkiIfOpen(){
    const targetProcesses = await getAnkiProcesses();
    if(targetProcesses.length == 0) return;
    const pid = targetProcesses[0].pid;
    kill(pid);
    let iterations = 0;
    return new Promise<void|null>(async (res, rej) => {
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


// This function is pure hell. It's a mess. No actually its based :based:
export async function LaunchAnki(paths:ankiPaths|ankiIntegration){
    // Uncomment for funny
    // const Rand = Math.random();
    // if( Rand > 0.5){
    //     shell.openExternal("https://www.youtube.com/watch?v=gQD2IZItlVk");
    // }
    // return [false, null];

    console.log("Launching Anki");
    if(paths.ankiPath == undefined){
        console.log(`The file ${paths.ankiPath} does not exist. Please provide a valid path`.red);
        return [false, null];
    }
    
    if(!fs.existsSync(paths.ankiPath)){
        console.log(`The file ${paths.ankiPath} does not exist. Please provide a valid path`.red);
        return [false, null];
    }

    const isOpened = (await getAnkiProcesses()).length > 0;
    const openCommand = (process.platform == "darwin" ? `open '${paths.ankiPath}'` : `${paths.ankiPath}`);

    console.log("running command " + openCommand);

    if(!isOpened){
        exec(openCommand, (err, out, err2) => {
            console.log(out);
            console.log(err);
        });    
    }
    
    let iterations = 0;
    let hasExecOpen = false;
    const resp = await new Promise<string|null>(async (res, rej) => {
        var intervalOpen = setAsyncInterval(async () => {
            console.log("iterations " + iterations);
            if(iterations > 30) {
                {
                    intervalOpen();
                    res(null);
                }
            } 
            const allAnkis = await proc("name", "Anki");
            console.log("allAnkis " + allAnkis);
            iterations++;
            if(allAnkis.length == 0 && !isOpened){
                return;
            }

            const windows = (await readWindows(allAnkis.map(x => x.pid)))
            const pid = (await getAnkiProcesses()).at(0)?.pid;
            console.log("pid " + pid);
            console.log("windows " + windows);
            
            if((windows.length > 0 || isOpened) && pid != undefined){
                console.log("Anki has been found");
                
                intervalOpen();
                if(!isOpened) await sleep(1000);
                console.log("killing anki");

                try{
                    kill(pid);                    
                }
                catch(e){
                    console.log(e);
                }
                var intervalClose = setAsyncInterval(async () => {
                    if(iterations > 30) 
                    {
                        intervalClose();
                        res(null);
                    }
                    const remainingProcesses = await proc("name", "Anki")
                    console.log("remainingProcesses " + remainingProcesses);
                    if(remainingProcesses.filter(x => x.pid == pid).length == 0){
                        const cmd = allAnkis.filter(x => x.pid == pid)[0].cmd;
                        res(cmd);
                        intervalClose();

                        if(isOpened){
                            exec(openCommand);    
                            minimizeAnki(cmd);
                        }
                    }
                    iterations++;
                }, 500)
            }
        }, 500);

    })
    if(resp == null)
    {
        return [false, null];
    }
    
    return [true, resp];
}


function setAsyncInterval(
    callback: () => Promise<void>, 
    delay: number
): () => void {
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let kill = false;
    async function tick() {
        if(kill) return;
        await callback(); // Execute the callback
        // Schedule the next execution after the delay
        timerId = setTimeout(tick, delay);
    }

    // Start the first execution
    tick();

    return () => {
        kill = true;
        if (timerId !== null) {
            clearTimeout(timerId); // Clear the interval if the function is called
            timerId = null;
        }
    };
}

const normalizePath = (path:string) => path.replace(/^"|"$/g, '');

export async function minimizeAnki(cmd:string){
    if (process.platform !== 'darwin') return;

    let iterations = 0;
    const resp = await new Promise<void|null>(async (res, rej) => {
        var intervalOpen = setInterval(async () => {
            if(iterations > 10) {
                {
                    clearInterval(intervalOpen);
                    res(null);
                }
            }
            const targetProcesses = (await getAnkiProcesses()).filter(x => x.cmd == cmd);
            iterations++;
            if(targetProcesses.length == 0){
                return;
            }
            const pid = targetProcesses[0].pid;
            const allAnkis = await proc("name", "Anki");
            const windows = (await readWindows(allAnkis.map(x => x.pid)))
            if(windows.length == 1){
                
                clearInterval(intervalOpen);

                exec(`osascript -e 'tell application "System Events" to set visible of first application process whose unix id is ${pid} to false'`, (err, stdout, stderr) => {
                    if (err) {
                        console.error("Error hiding window:", stderr);
                    }
                    res();
                });
                
            }
        }, 500);

    })
    
    return resp;
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
        const base = basename((x as any).bin ?? x.cmd).toLowerCase();
        return base == "anki" || base == "anki.exe"
     });
     return targetProcesses
}



export const sleep = (ms:number) => new Promise<void>((res, rej) => setTimeout(() => { res() }, ms));
