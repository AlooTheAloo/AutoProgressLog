import { entry } from "../../types/entry";
import sqlite3 from "sqlite3";
import { syncDataPath } from "../getConfig";
import dayjs from "dayjs";
import { SyncData } from "../../types/sync";

export async function WriteEntries(entries: entry[], syncDataId: number = -1) {
  if (entries.length == 0) return;
  console.log("Adding " + entries.length + " entries");
  const db = new sqlite3.Database(syncDataPath);
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO immersionActivity (id, syncDataId, time, seconds, activityName) VALUES (?, ?, ?, ?, ?)"
  );

  entries.forEach((x) => {
    stmt.run(x.id, syncDataId, dayjs(x.stop).unix(), x.duration, x.description);
  });

  stmt.finalize();
}

export async function WriteSyncData(
  syncData: Omit<SyncData, "id">,
  entries: entry[]
) {
  return new Promise<void>((res, rej) => {
    new sqlite3.Database(syncDataPath).all(
      `
            INSERT INTO syncData (generationTime, totalSeconds, totalCardsStudied, cardsStudied, mature, retention, lastAnkiUpdate, type) VALUES 
            (${syncData.generationTime}, 
            ${syncData.toggl?.totalSeconds ?? 0}, 
            ${syncData.anki?.totalCardsStudied ?? 0}, 
            ${syncData.anki?.cardsStudied ?? 0}, 
            ${syncData.anki?.mature ?? 0}, 
            ${syncData.anki?.retention ?? 0}, 
            '${syncData.anki?.lastAnkiUpdate}',
            '${syncData.type}')
            RETURNING id;
            `,
      async (err, rows: { id: number }[]) => {
        if (err) {
          console.log(err);
        }
        await WriteEntries(entries, rows[0].id);
        res();
      }
    );
  });
}

export async function ModifyActivityByID(id: number, entry: entry) {
  return new Promise<void>((res, rej) => {
    const db = new sqlite3.Database(syncDataPath);

    const stmt = db.prepare(`
            UPDATE immersionActivity 
            SET time = ?, seconds = ?, activityName = ? 
            WHERE id = ?
        `);

    stmt.run(
      dayjs(entry.stop).unix(),
      entry.duration,
      entry.description,
      id,
      function (err: any) {
        if (err) {
          rej(err);
        } else {
          res();
        }
      }
    );

    stmt.finalize();
  });
}

export async function DeleteActivity(id: number) {
  return new Promise<void>((res, rej) => {
    new sqlite3.Database(syncDataPath).all(
      `
            DELETE FROM immersionActivity WHERE id = ${id}
            `,
      async (err, rows: { id: number }[]) => {
        if (err) {
          console.log(err);
        }
        res();
      }
    );
  });
}
