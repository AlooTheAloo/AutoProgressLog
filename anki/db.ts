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



export async function getRetention(){
    return new Promise<number|null>((res, rej) => {
        // A month ago
        const aMonthAgo = dayjs().subtract(30, "days").unix() * 1000;

        console.log(aMonthAgo);

        // Create a database connection
        const db = open();

        // Execute SQL query
        db.all('SELECT COUNT(*) as "reviews" FROM revlog WHERE lastIvl >= 21 AND id > ' + aMonthAgo, (err, allReviews:reviewsrow[]) => {
            if (err) {
                console.log(err);

                res(null);
            } else {

                db.all('SELECT COUNT(*) as "reviews" FROM revlog WHERE lastIvl >= 21 AND id > ' + aMonthAgo + " AND ((type = 1 AND ease >= 3));", (err, correctReviews:reviewsrow[]) => {
                    console.log("total reviews " + allReviews[0].reviews);
                    
                    res(correctReviews[0].reviews / allReviews[0].reviews * 100)
                })
            }
        });

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