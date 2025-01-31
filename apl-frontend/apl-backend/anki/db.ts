import dayjs, { Dayjs } from 'dayjs';
import sqlite3, { Database } from 'sqlite3'
import { getConfig, syncDataPath } from '../Helpers/getConfig.js';
import { ankiIntegration, RetentionMode } from '../types/options.js';
import { getSetupAnki } from '../../electron/main/Electron-Backend/SetupConfigBuilder.js';
import { Parser } from 'pickleparser';
import path from 'path';

interface reviewsrow {
    reviews:number
}

interface maturerow {
    mature:number
}

function getAnki(){
    const conf = getConfig();
    if(conf == undefined || conf == null) return getSetupAnki();
    else return conf.anki;
}


function JoinTrackedDecks(table_primary_key:string = "revlog.cid"){
    const options = getAnki()?.options;
    if(options == undefined) return "";
    const trackedDecks = options.trackedDecks.map(x => x.toString());
    return `JOIN cards c ON c.id = ${table_primary_key} WHERE c.did IN (${trackedDecks.join(",")})`;

}

export async function getAnkiCardReviewCount(startTime:Dayjs, ankiIntegration:ankiIntegration){
    return new Promise<number|null>((res, rej) => {
        // Create a database connection
        const db = open(ankiIntegration);
        // Execute SQL query
        db.all(`SELECT COUNT(*) as "reviews" FROM revlog ${JoinTrackedDecks()} AND revlog.id > ?`, startTime.valueOf(), (err, rows:reviewsrow[]) => {
            if (err) {
                console.log(err);
                res(null);
            } else {
                // Process the results
                res(rows[0].reviews)
            }
        });

        close(db);
    })
}

export async function getLastUpdate(ankiIntegration:ankiIntegration){
    return new Promise<number>((res, rej) => {
        // Create a database connection
        const db = open(ankiIntegration); 

        db.all(`select MAX(id) AS "latest" FROM revlog`, (err, resp:{latest:number}[]) => {
            if (err) {
                console.log(err);
                res(0);
            } else {
                const latest = resp[0].latest ?? 0;
                res(latest);
            }
        });
        close(db);
    });
}


export async function DeleteAnkiData(){
    return new Promise<void>((res, rej) => {
        new sqlite3.Database(syncDataPath).all(`UPDATE syncdata SET cardsStudied=0, totalCardsStudied=0, mature=0, retention=0, lastAnkiUpdate=0`, async (err, rows:{id:number}[]) => {
            if(err){
                console.log(err);
            }
            return res();
        });
    })
}


export async function getRetention(retentionMode:RetentionMode = "true_retention", ankiIntegration:ankiIntegration){
    return new Promise<number|null>((res, rej) => {
        // A month ago
        const aMonthAgo = dayjs().startOf("day").subtract( retentionMode == "true_retention" ? 30 : 29, "days").unix() * 1000;

        // Create a database connection
        const db = open(ankiIntegration);
        if(retentionMode == "default_anki"){

            // Execute SQL query
            db.all(`SELECT COUNT(*) as "reviews" FROM revlog ${JoinTrackedDecks()} AND revlog.lastIvl >= 21 AND revlog.id > ?`, aMonthAgo, (err, allReviews:reviewsrow[]) => {
                if (err) {
                    console.log(err);
                    res(null);
                } else {
                    db.all(`SELECT COUNT(*) as "reviews" FROM revlog r ${JoinTrackedDecks("r.cid")} AND r.lastIvl >= 21 AND r.id > ? AND ((r.type = 1 AND r.ease >= 2))`, aMonthAgo, (err, correctReviews:reviewsrow[]) => {
                        let ret = correctReviews[0].reviews / allReviews[0].reviews * 100
                        if(Number.isNaN(ret)) ret = 0;
                        res(ret)
                    })
                }
            });
        }

        if(retentionMode == "true_retention"){
            db.all(`select
            sum(case when ease = 1 and revlog.type == 1 then 1 else 0 end) as "FLUNKED",
            sum(case when ease > 1 and revlog.type == 1 then 1 else 0 end) as "PASSED"
            from revlog ${JoinTrackedDecks()} AND revlog.id > ${aMonthAgo}`, (err, a:any[]) => {
                if(err){
                    console.log(err)
                    res(null);
                    return;
                }
            
                const passed = a[0].PASSED;
                const flunked = a[0].FLUNKED;
                try{
                    let ret = passed/(passed+flunked)*100
                    if(Number.isNaN(ret)) ret = 0;
                    res(ret);
                }
                catch(err){
                    console.log(err)
                }
            });

        }
        
        close(db);
    })
}




export async function getMatureCards(ankiIntegration:ankiIntegration){
    return new Promise<number|null>((res, rej) => {
        // Create a database connection
        const db = open(ankiIntegration);
        // Execute SQL query
        db.all(`SELECT COUNT(*) as "mature" from cards ${JoinTrackedDecks('cards.id')} AND cards.ivl >= 21;`, (err, rows:maturerow[]) => {
            if (err) {
                console.log(err);
                res(null);
            } else {
                // Process the results
                res(rows[0].mature)
            }
        });
        close(db);
    })


}

function open(ankiIntegration:ankiIntegration){
    return new sqlite3.Database(ankiIntegration.ankiDB ?? "", (err) => {
        if (err) {
            console.log(err);
        }
    });
}

//Returns true if everything is aok, returns false if not
async function close(db:Database){
    await new Promise((res, rej) => {
        // Close the database connection when done
        db.close((err) => {
            res(err == null);
        });
    })
}


export function hasSyncEnabled(profileName:string) {
    return new Promise<boolean|null>((res, rej) => {
        const prefsDB = path.join(getConfig()?.anki.ankiIntegration?.ankiDB ?? "", "..", "..", "prefs21.db");
        let db = new sqlite3.Database(prefsDB, sqlite3.OPEN_READWRITE, (err) => {
            if(err) rej(err);
        });
    
        res(new Promise<boolean|null>((res, rej) => {
            db.all(`SELECT cast(data as blob) AS "profileData" FROM profiles where name = "${profileName}"`, (err, rows) => {
                if(err) rej(err);
                if(rows.length == 0) {
                    res(null);
                    return;
                }
                res((new Parser().parse((rows[0] as any).profileData) as any).syncKey != null);
            })
        }))
       
    })
   
}