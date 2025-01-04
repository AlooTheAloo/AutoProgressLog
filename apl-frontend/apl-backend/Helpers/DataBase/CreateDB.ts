import dayjs from "dayjs";
import sqlite3 from "sqlite3";
import { getTimeEntries } from "../../toggl/toggl-service";

export async function CreateDB(db: sqlite3.Database) {
  db.run(
    `
        CREATE TABLE IF NOT EXISTS syncData 
        (
            id INTEGER PRIMARY KEY, 
            generationTime INTEGER, 
            lastAnkiUpdate INTEGER,
            totalSeconds INTEGER, 
            totalCardsStudied INTEGER, 
            cardsStudied INTEGER,
            mature INTEGER, 
            retention REAL,
            type STRING
        )
    `,
    () => {
      db.run(
        `INSERT INTO syncData (generationTime, totalSeconds, totalCardsStudied, cardsStudied, mature, retention, type) VALUES (
                $generationTime, $totalSeconds, $totalCardsStudied, $cardsStudied, $mature, $retention, $type)`,
        dayjs().startOf("day").valueOf(),
        0,
        0,
        0,
        0,
        0,
        "Full"
      );
    }
  );

  db.run(`CREATE TABLE IF NOT EXISTS immersionActivity
        (
            id INTEGER PRIMARY KEY,
            syncDataId INTEGER,
            time INTEGER,
            seconds INTEGER,
            activityName TEXT
        )`);

  const entries = await getTimeEntries(
    dayjs().startOf("month").subtract(1, "month").valueOf()
  );
  if (entries.entriesAfterLastGen.length != 0) {
    await db.run(`INSERT INTO immersionActivity (id, syncDataId, time, seconds, activityName) VALUES 
            ${entries.entriesAfterLastGen
              .map((x) => {
                return `(${x.id}, ${dayjs().startOf("day").valueOf()}, '${dayjs(
                  x.stop
                ).unix()}', ${x.duration}, '${x.description}')`;
              })
              .join(", \n")}`);
  }
}
