import dayjs, { Dayjs } from 'dayjs';
import sqlite3, { Database } from 'sqlite3'
import { getConfig } from '../Helpers/getConfig.js';

interface reviewsrow {
    reviews:number
}

interface maturerow {
    mature:number
}

export async function getAnkiCardReviewCount(startTime:Dayjs){
    return new Promise<number|null>((res, rej) => {
        // Create a database connection
        const db = open();

        // Execute SQL query
        db.all('SELECT COUNT(*) as "reviews" FROM revlog WHERE id > ' + startTime.valueOf(), (err, rows:reviewsrow[]) => {
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

export type retentionMode = "default_anki" | "true_retention"


export async function getRetention(retentionMode:retentionMode = "true_retention"){
    return new Promise<number|null>((res, rej) => {
        // A month ago
        const aMonthAgo = dayjs().subtract( retentionMode == "true_retention" ? 30 : 29, "days").unix() * 1000;

        // Create a database connection
        const db = open();

        if(retentionMode == "default_anki"){
            // Execute SQL query
            db.all('SELECT COUNT(*) as "reviews" FROM revlog WHERE lastIvl >= 21 AND id > ' + aMonthAgo, (err, allReviews:reviewsrow[]) => {
                if (err) {
                    console.log(err);
                    res(null);
                } else {
                    db.all('SELECT COUNT(*) as "reviews" FROM revlog WHERE lastIvl >= 21 AND id > ' + aMonthAgo + " AND ((type = 1 AND ease >= 2));", (err, correctReviews:reviewsrow[]) => {
                        res(correctReviews[0].reviews / allReviews[0].reviews * 100)
                    })
                }
            });
        }

        if(retentionMode == "true_retention"){
            db.all(`select
            sum(case when ease = 1 and type == 1 then 1 else 0 end) as "FLUNKED",
            sum(case when ease > 1 and type == 1 then 1 else 0 end) as "PASSED", 
            sum(case when ease > 1 and type == 1 and lastIvl >= 100 then 1 else 0 end) as "PASSED_SUPERMATURE", 
            sum(case when ease = 1 and type == 1 and lastIvl >= 100 then 1 else 0 end) as "FLUNKED_SUPERMATURE", 
            sum(case when ivl > 0 and type == 0 then 1 else 0 end) as "LEARNED", 
            sum(case when ivl > 0 and type == 2 then 1 else 0 end) as "RELEARNED"
            from revlog where id > ${aMonthAgo}`, (err, a:any[]) => {
                const passed = a[0].PASSED;
                const flunked = a[0].FLUNKED;
                try{
                    let temp = passed/(passed+flunked)*100
                    res(temp);
                }
                catch(err){
                    console.log(err)
                }
            });

        }
       
        
        close(db);
    })
}




export async function getMatureCards(){
    return new Promise<number|null>((res, rej) => {
        // Create a database connection
        const db = open();
        // Execute SQL query
        db.all('SELECT COUNT(*) as "mature" from cards WHERE ivl >= 21;', (err, rows:maturerow[]) => {
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

function open(){
    return new sqlite3.Database(getConfig().anki.ankiDB ?? "", (err) => {
        if (err) {
            console.log(err);
        } else {
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