import dayjs, { Dayjs } from 'dayjs';
import sqlite3 from 'sqlite3';

interface row {
    reviews:number
}

export async function getAnkiCardReviewCount(startTime:Dayjs){
    return new Promise<number|null>((res, rej) => {
        console.log(process.env.ANKI_DB_PATH)
        // Create a database connection
        const db = new sqlite3.Database(process.env.ANKI_DB_PATH ?? "", (err) => {
            if (err) {
                res(null);
            } else {
            }
        });

        // Execute a SQL query
        db.all('SELECT COUNT(*) as "reviews" FROM revlog WHERE id > ' + startTime.valueOf(), (err, rows:row[]) => {
            if (err) {
                res(null);
            } else {
                console.log(startTime.valueOf())
                // Process the results
                res(rows[0].reviews)
            }
        });

        // Close the database connection when done
        db.close((err) => {
            if (err) {
                res(null);
            } else {
            }
        });
    })


}
