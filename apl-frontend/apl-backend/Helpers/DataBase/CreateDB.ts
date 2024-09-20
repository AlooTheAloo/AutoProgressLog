import dayjs from "dayjs";
import sqlite3 from "sqlite3";

export function CreateDB(db:sqlite3.Database){
    db.run(`
        CREATE TABLE IF NOT EXISTS syncData 
        (
            id INTEGER PRIMARY KEY, 
            generationTime INTEGER, 
            totalSeconds INTEGER, 
            totalCardsStudied INTEGER, 
            cardsStudied INTEGER,
            mature INTEGER, 
            retention REAL
        )
    `, () => {
        db.run(`INSERT INTO syncData (generationTime, totalSeconds, totalCardsStudied, cardsStudied, mature, retention) VALUES (
                $generationTime, $totalSeconds, $totalCardsStudied, $cardsStudied, $mature, $retention)`,
            dayjs().startOf("day").valueOf(), 0, 0, 0, 0, 0
        );
    });
    
    db.run(`CREATE TABLE IF NOT EXISTS immersionActivity
        (
            id INTEGER PRIMARY KEY,
            syncDataId INTEGER,
            time INTEGER,
            seconds INTEGER,
            activityName TEXT
        )`
    );


}