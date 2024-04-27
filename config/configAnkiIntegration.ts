import { getAnswer } from "../Helpers/configHelper.js";
import { ankiIntegration } from "../types/options.js";
import fs from "fs";
import sqlite3 from 'sqlite3';
import { exec } from 'child_process';
import proc from 'find-process';
import Database from "bun:sqlite";

export async function createAnkiIntegration():Promise<ankiIntegration>{


    const dbPath = await getAnswer({question: "Please provide the anki Database path. For more information, kindly refer to the README. ", verifFunc: async (v) => {
        try{
            if(!fs.existsSync(v)){
                console.log(`The file '${v}' does not exist. Please provide a valid file path.`.red);
                return false;
            }

            const res = await new Promise((res, rej) => {

                // Create a database connection
                const db = new sqlite3.Database(v, (err) => {
                    if (err) {
                        console.log(`The database file could not be opened. Make sure you followed the instructions in the README properly and try again.`.red)
                        res(false);
                    } else {
                        console.log("Successfully connected to anki database!".blue);
                        db.close();
                        res(true);
                    }
                });
            })

            if(!res)
            {
                console.log(`The database file could not be opened. Make sure you followed the instructions in the README properly and try again.`.red)
                return false
            }

            return true;
        }
        catch(e:any){
            console.log(e);
            console.log("There was an error while loading the file. Please try again".red);
            return false;
        }
    }});
    let appPath = "";
    let appBin = "";
    let pid = -1;
    while(true){
        appPath = await getAnswer({question: "Please provide the anki Application path. For more information, kindly refer to the README. ", verifFunc: (v) => true});
        
        const worked = await (async ():Promise<boolean> => {
            if(!fs.existsSync(appPath)){
                console.log(`The file ${appPath} does not exist. Please provide a valid path`.red);
                return false;
            }
            
            exec((process.platform == "darwin" ? "open " : "") + appPath).on("message", (message) => {
            });

            const resp = await new Promise<string|null>(async (res, rej) => {
                setTimeout(async () => {
                    const processes = await proc("name", "Anki")
                    let str = "Out of these processes, please select Anki.\n"
    
                    processes.forEach((x, i) => {
                        str += `[${i + 1}]`.blue + ` ${x.name} - ${JSON.stringify((x as any).bin)}\n`
                    })
                    str += "[0]".red + " None of these are anki."
                    const options = Array.from({length: processes.length + 1}, (_, i) => {
                        return { 
                            input: (i).toString(),
                            returnVal: i - 1,
                            default: i == 0
                        }
                    })

                    console.log(str);

                    const ans = await getAnswer({question: "Select the anki process", options: options})
                    if(ans == -1){
                        console.log("If anki was not launched, you've most likely provided the wrong path (or you're using linux). If anki was launched and was not detected, please open an issue on github.".red);
                        res(null);
                    }
                    else {
                        pid = processes[ans].pid;
                        res((processes[ans] as any).bin);
                    } 
                }, 5000);
            })

            if(resp == null)
            {
                return false;
            }
            appBin = resp;
            return true;
        })();

        if(worked) { 
            process.kill(pid); 
            break;
        }
    }

    return {
        enabled : true,
        ankiDB: dbPath,
        ankiPath: appPath,
        ankiProgramBinaryName: appBin
    }
}