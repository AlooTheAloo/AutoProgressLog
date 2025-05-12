import sqlite3 from "sqlite3";
import { syncDataPath } from "../getConfig";
import { ImmersionActivity, SyncData, SyncType } from "../../types/sync";
import dayjs from "dayjs";
import { ImmersionSource } from "../../../electron/main/Electron-Backend/types/Dashboard";

interface flatSyncData {
  id: number;
  generationTime: number;
  type: SyncType;
  totalCardsStudied: number;
  cardsStudied: number;
  mature: number;
  retention: number;
  totalSeconds: number;
  lastAnkiUpdate: number;
}

export async function GetLastEntry(type?: SyncType): Promise<SyncData | null> {
  return new Promise((resolve, reject) => {
    new sqlite3.Database(syncDataPath).all(
      `
            SELECT * FROM syncData 
            ${type ? `WHERE type = '${type}'` : ""}
            ORDER BY id DESC LIMIT 1
        `,
      (err, rows: flatSyncData[]) => {
        if (err) resolve(null);
        const flat = rows[0];
        resolve({
          id: flat.id,
          generationTime: flat.generationTime,
          type: flat.type,
          anki: {
            totalCardsStudied: flat.totalCardsStudied,
            cardsStudied: flat.cardsStudied,
            mature: flat.mature,
            retention: flat.retention,
            lastAnkiUpdate: flat.lastAnkiUpdate,
          },
          toggl: {
            totalSeconds: flat.totalSeconds,
          },
        });
      }
    );
  });
}

export async function GetActivitiesBetween(
  since: dayjs.Dayjs,
  until: dayjs.Dayjs
): Promise<ImmersionActivity[]> {
  return new Promise((resolve, reject) => {
    new sqlite3.Database(syncDataPath).all(
      `
            SELECT * FROM immersionActivity WHERE time > '${since.unix()}' AND time < '${until.unix()}'
        `,
      (err, rows: ImmersionActivity[]) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
}

export async function getreadinghours() {
  return new Promise((resolve, reject) => {
    new sqlite3.Database(syncDataPath).all(
      `
            SELECT (SUM(seconds) / 3600) AS "time" FROM immersionActivity WHERE activityName LIKE '%read%';
        `,
      (err, rows: any[]) => {
        if (err) {
          reject(err);
        }
        resolve(rows[0].time ?? 0);
      }
    );
  });
}

export async function GetImmersionTimeSince(
  since: dayjs.Dayjs
): Promise<number> {
  return new Promise((resolve, reject) => {
    new sqlite3.Database(syncDataPath).all(
      `
            SELECT SUM(seconds) as "sum" FROM immersionActivity WHERE time > '${since.unix()}'
        `,
      (err, rows: any[]) => {
        if (err) {
          reject(err);
        }
        resolve(rows[0].sum ?? 0);
      }
    );
  });
}

export async function GetImmersionTimeBetween(
  since: dayjs.Dayjs,
  until: dayjs.Dayjs
): Promise<number> {
  return new Promise((resolve, reject) => {
    new sqlite3.Database(syncDataPath).all(
      `
            SELECT SUM(seconds) as "sum" FROM immersionActivity WHERE time > '${since.unix()}' AND time < '${until.unix()}'
        `,
      (err, rows: any[]) => {
        if (err) {
          reject(err);
        }
        resolve(rows[0].sum ?? 0);
      }
    );
  });
}

// I LOVE VIBE CODING
export async function GetImmersionStreak(days: number = 7): Promise<number[]> {
  const offset = days - 1; // e.g. 7 days ⇒ start = now - 6 days
  const db = new sqlite3.Database(syncDataPath);

  const sql = `
    WITH RECURSIVE
      dates(day) AS (
        SELECT date('now', '-' || ? || ' days')
        UNION ALL
        SELECT date(day, '+1 day')
          FROM dates
         WHERE day < date('now')
      ),
      agg AS (
        SELECT
          date(time, 'unixepoch', 'localtime') AS day,
          SUM(seconds)                         AS total_seconds
        FROM immersionActivity
        WHERE date(time, 'unixepoch', 'localtime')
          >= date('now', '-' || ? || ' days')
        GROUP BY day
      )
    SELECT
      dates.day,
      COALESCE(agg.total_seconds, 0) AS total_seconds
    FROM dates
    LEFT JOIN agg USING(day)
    ORDER BY dates.day;
  `;

  return new Promise((resolve, reject) => {
    // we bind `offset` twice (once for generating dates, once for filtering agg)
    db.all(sql, [offset, offset], (err, rows: any[]) => {
      if (err) {
        console.error("SQLite error:", err);
        return reject(err);
      }
      resolve(rows.map((x) => x.total_seconds / 3600));
    });
  });
}

export async function GetImmersionSourcesSince(
  since: dayjs.Dayjs
): Promise<ImmersionSource[]> {
  return new Promise((resolve, reject) => {
    new sqlite3.Database(syncDataPath).all(
      `
            SELECT activityName AS "name", SUM(seconds) AS "relativeValue" FROM immersionActivity WHERE time > '${since.unix()}' GROUP BY activityName
        `,
      (err, rows: any[]) => {
        if (err) reject(err);
        resolve(mergeItems(rows));
      }
    );
  });
}

function mergeItems(items: ImmersionSource[]): ImmersionSource[] {
  // Create a map to store merged items
  const mergedMap = new Map<string, ImmersionSource>();

  items.forEach((item) => {
    const lowerCaseName = item.name.toLowerCase();

    if (mergedMap.has(lowerCaseName)) {
      const existingItem = mergedMap.get(lowerCaseName)!;

      // Update the existing item
      mergedMap.set(lowerCaseName, {
        name:
          item.relativeValue > existingItem.relativeValue
            ? item.name
            : existingItem.name,
        relativeValue: existingItem.relativeValue + item.relativeValue,
      });
    } else {
      // Add the item to the map
      mergedMap.set(lowerCaseName, { ...item });
    }
  });
  return Array.from(mergedMap.values());
}
export async function GetSyncCount() {
  return new Promise<number>((resolve, reject) => {
    new sqlite3.Database(syncDataPath).all(
      `
            SELECT COUNT(*) AS 'syncs' FROM syncData;  
        `,
      (err, rows: any[]) => {
        if (err) reject(err);
        resolve(rows[0].syncs as number);
      }
    );
  });
}
