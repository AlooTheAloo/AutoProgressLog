import { Dayjs } from 'dayjs';
import sqlite3 from 'sqlite3'
import { getConfig } from '../Helpers/getConfig.js';

interface row {
    reviews:number
}

export async function getAnkiCardReviewCount(startTime:Dayjs){
    return new Promise<number|null>((res, rej) => {
        // Create a database connection

        new sqlite3.Database("/Users/philipanthony-davis/Library/Application Support/Anki2/User 1/collection.anki2");

        const db = new sqlite3.Database(getConfig().anki.ankiDB ?? "", (err) => {
            if (err) {
                console.log(err);
                res(null);
            } else {
            }
        });

        // Execute SQL query
        db.all('SELECT COUNT(*) as "reviews" FROM revlog WHERE id > ' + startTime.valueOf(), (err, rows:row[]) => {
            if (err) {
                console.log(err);

                res(null);
            } else {
                // Process the results
                res(rows[0].reviews)
            }
        });

        // Close the database connection when done
        db.close((err) => {
            if (err) {
                console.log(err);

                res(null);
            } else {
            }
        });
    })


}
