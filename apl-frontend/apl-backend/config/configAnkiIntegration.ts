import { getAnswer } from "../Helpers/configHelper.js";
import { ankiIntegration } from "../types/options.js";
import fs from "fs";
import sqlite3 from 'sqlite3';
import { exec } from 'child_process';
import proc from 'find-process';
import { app } from "electron";
import path, { basename } from "path";
import remote from "electron";
import { readWindows } from "../entry/tests.js";
import { kill } from "process";

interface ankiPaths{
    ankiDB: string,
    ankiPath: string,
}

export async function getAnkiDBPaths():Promise<ankiPaths>{
    const prefsDBPath = path.join(app.getPath("appData"), "anki2", "prefs21.db");
    const prefsDB = new sqlite3.Database(prefsDBPath, (err) => {});
    const profiles:any[] = await new Promise((res, rej) => {
        prefsDB.all("SELECT name FROM profiles WHERE name NOT IN ('_global', 'fix')", (err, rows:any[]) => {
            res(rows);
        });
    });

    const ankiDB = path.join(prefsDBPath, "../", profiles[0].name, "collection.anki2");
    let AppPath = "";

    if(process.platform == "darwin"){
        AppPath = path.join("/", "Applications", "Anki.app");
    }
    else if (process.platform == "win32"){
        AppPath = path.join(app.getPath("appData"), "Anki2");
        console.log(path.join(app.getPath("appData"), "../", "Local", "Programs", "Anki", "anki.exe"));
    }
    else {

    }
    
    await sleep(500);

    return {
        ankiDB: ankiDB,
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

async function LaunchAnki(paths:ankiPaths){
        
    if(!fs.existsSync(paths.ankiPath)){
        console.log(`The file ${paths.ankiPath} does not exist. Please provide a valid path`.red);
        return false;
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
                }, 100)
            }

            iterations++;
        }, 100);

    })

    if(resp == null)
    {
        return false;
    }
    
    return [true, resp];
}



const sleep = (ms:number) => new Promise<void>((res, rej) => setTimeout(() => { res() }, ms));
