import dayjs from "dayjs";
import sqlite3 from "sqlite3";
import { getTimeEntries } from "../../toggl/toggl-service";

export async function CreateDB(
  db: sqlite3.Database,
): Promise<number | undefined> {
  const entries = await getTimeEntries(
    dayjs().subtract(3, "month").add(1, "minute").valueOf(),
  );

  const fullTime = entries?.allEvents.reduce((acc, x) => {
    return acc + x.activitySeconds;
  }, 0);

  console.log("Full Time : " + fullTime);

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
      console.log('Table "syncData" created');
      db.run(
        `INSERT INTO syncData (id, generationTime, totalSeconds, totalCardsStudied, cardsStudied, mature, retention, type) VALUES (
              $id, $generationTime, $totalSeconds, $totalCardsStudied, $cardsStudied, $mature, $retention, $type)`,
        0,
        dayjs().startOf("day").valueOf(),
        fullTime,
        0,
        0,
        0,
        0,
        "Full",
      );
    },
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS immersionActivity
  (
      id INTEGER PRIMARY KEY,
      syncDataId INTEGER,
      time INTEGER,
      seconds INTEGER,
      activityName TEXT
  )`,
    () => {
      if (!entries || entries.entriesAfterLastGen.length === 0) return;

      const placeholders = entries.entriesAfterLastGen
        .map(() => "(?, ?, ?, ?, ?)")
        .join(", ");
      const values = entries.entriesAfterLastGen.flatMap((x) => [
        x.id,
        0,
        dayjs(x.stop).unix(),
        x.duration,
        x.description,
      ]);

      db.run(
        `INSERT INTO immersionActivity (id, syncDataId, time, seconds, activityName) VALUES ${placeholders}`,
        values,
      );
    },
  );

  return fullTime;
}
