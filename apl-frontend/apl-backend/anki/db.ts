import dayjs, { Dayjs } from "dayjs";
import sqlite3, { Database } from "sqlite3";
import { ankiPath, getConfig, syncDataPath } from "../Helpers/getConfig";
import { RetentionMode } from "../types/options";
import { getSetupAnki } from "../../electron/main/Electron-Backend/SetupConfigBuilder";

interface reviewsrow {
  reviews: number;
}

interface maturerow {
  mature: number;
}

function getAnki() {
  const conf = getConfig();
  if (conf == undefined || conf == null) return getSetupAnki();
  else return conf.anki;
}

function JoinTrackedDecks(table_primary_key: string = "revlog.cid") {
  const options = getAnki()?.options;
  if (options == undefined) return "";
  const trackedDecks = options.trackedDecks.map((x) => x.toString());
  return `JOIN cards c ON c.id = ${table_primary_key} WHERE c.did IN (${trackedDecks.join(
    ","
  )})`;
}

export async function getAnkiCardReviewCount(
  startTime: Dayjs,
  endTime: Dayjs = dayjs()
) {
  return new Promise<number | null>((res, rej) => {
    // Create a database connection
    const db = open();
    // Execute SQL query
    db.all(
      `SELECT COUNT(*) as "reviews" FROM revlog ${JoinTrackedDecks()} AND revlog.id > ? AND revlog.id < ?`,
      [startTime.valueOf(), endTime.valueOf()],
      (err, rows: reviewsrow[]) => {
        if (err) {
          console.log(err);
          res(null);
        } else {
          // Process the results
          res(rows[0].reviews);
        }
      }
    );

    close(db);
  });
}

export async function getLastUpdate() {
  return new Promise<number>((res, rej) => {
    // Create a database connection
    const db = open();

    db.all(
      `select MAX(id) AS "latest" FROM revlog`,
      (err, resp: { latest: number }[]) => {
        if (err) {
          console.log(err);
          res(0);
        } else {
          const latest = resp[0].latest ?? 0;
          res(latest);
        }
      }
    );
    close(db);
  });
}

export async function DeleteAnkiData() {
  return new Promise<void>((res, rej) => {
    new sqlite3.Database(syncDataPath).all(
      `UPDATE syncdata SET cardsStudied=0, totalCardsStudied=0, mature=0, retention=0, lastAnkiUpdate=0`,
      async (err, rows: { id: number }[]) => {
        if (err) {
          console.log(err);
        }
        return res();
      }
    );
  });
}

export async function getRetention(
  retentionMode: RetentionMode = "true_retention"
) {
  return new Promise<number | null>((res, rej) => {
    // A month ago
    const aMonthAgo =
      dayjs()
        .startOf("day")
        .subtract(retentionMode == "true_retention" ? 30 : 29, "days")
        .unix() * 1000;

    // Create a database connection
    const db = open();
    if (retentionMode == "default_anki") {
      // Execute SQL query
      db.all(
        `SELECT COUNT(*) as "reviews" FROM revlog ${JoinTrackedDecks()} AND revlog.lastIvl >= 21 AND revlog.id > ?`,
        aMonthAgo,
        (err, allReviews: reviewsrow[]) => {
          if (err) {
            res(null);
            console.log(err);
          } else {
            db.all(
              `SELECT COUNT(*) as "reviews" FROM revlog r ${JoinTrackedDecks(
                "r.cid"
              )} AND r.lastIvl >= 21 AND r.id > ? AND ((r.type = 1 AND r.ease >= 2))`,
              aMonthAgo,
              (err, correctReviews: reviewsrow[]) => {
                let ret =
                  (correctReviews[0].reviews / allReviews[0].reviews) * 100;
                if (Number.isNaN(ret)) ret = 0;
                res(ret);
              }
            );
          }
        }
      );
    }

    if (retentionMode == "true_retention") {
      db.all(
        `select
            sum(case when ease = 1 and revlog.type == 1 then 1 else 0 end) as "FLUNKED",
            sum(case when ease > 1 and revlog.type == 1 then 1 else 0 end) as "PASSED"
            from revlog ${JoinTrackedDecks()} AND revlog.id > ${aMonthAgo}`,
        (err, a: any[]) => {
          if (err) {
            console.log(err);
            res(null);
            return;
          }

          const passed = a[0].PASSED;
          const flunked = a[0].FLUNKED;
          try {
            let ret = (passed / (passed + flunked)) * 100;
            if (Number.isNaN(ret)) ret = 0;
            res(ret);
          } catch (err) {
            console.log(err);
          }
        }
      );
    }

    close(db);
  });
}

export async function getMatureCards() {
  return new Promise<number | null>((res, rej) => {
    // Create a database connection
    const db = open();
    // Execute SQL query
    db.all(
      `SELECT COUNT(*) as "mature" from cards ${JoinTrackedDecks(
        "cards.id"
      )} AND cards.ivl >= 21;`,
      (err, rows: maturerow[]) => {
        if (err) {
          console.log(err);
          res(null);
        } else {
          // Process the results
          res(rows[0].mature);
        }
      }
    );
    close(db);
  });
}

function open() {
  return new sqlite3.Database(ankiPath, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

//Returns true if everything is aok, returns false if not
async function close(db: Database) {
  await new Promise((res, rej) => {
    // Close the database connection when done
    db.close((err) => {
      res(err == null);
    });
  });
}
