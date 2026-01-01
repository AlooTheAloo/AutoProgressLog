import sqlite3 from "sqlite3";

const CleanAnkiDB = `
    PRAGMA foreign_keys = OFF;
    PRAGMA wal_checkpoint(FULL);
    PRAGMA journal_mode=DELETE;

    DROP TABLE IF EXISTS android_metadata;
    DROP TABLE IF EXISTS config;
    DROP TABLE IF EXISTS notetypes;
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS deck_config;
    DROP TABLE IF EXISTS fields;
    DROP TABLE IF EXISTS notes;
    DROP TABLE IF EXISTS templates;
    DROP TABLE IF EXISTS graves;

    -- ── cards ──────────────────────────────────────────────────────────────────────
    CREATE TABLE cards_new (
    id    INTEGER PRIMARY KEY,
    did   INTEGER NOT NULL,
    usn   INTEGER NOT NULL,
    ivl   INTEGER NOT NULL
    );



    INSERT INTO cards_new (id, did, usn, ivl)
    SELECT id, did, usn, ivl FROM cards;

    DROP INDEX IF EXISTS idx_decks_name;

    DROP TABLE cards;
    ALTER TABLE cards_new RENAME TO cards;

    -- ── col ────────────────────────────────────────────────────────────────────────
    CREATE TABLE col_new (
    id      INTEGER PRIMARY KEY,
    crt     INTEGER       NOT NULL,
    mod     INTEGER       NOT NULL,
    scm     INTEGER       NOT NULL,
    ver     INTEGER       NOT NULL,
    dty     INTEGER       NOT NULL,
    usn     INTEGER       NOT NULL,
    ls      INTEGER       NOT NULL,
    conf    TEXT    COLLATE NOCASE,
    models  TEXT    COLLATE NOCASE,
    decks   TEXT    COLLATE NOCASE,
    dconf   TEXT    COLLATE NOCASE,
    tags    TEXT    COLLATE NOCASE
    );
    INSERT INTO col_new SELECT * FROM col;
    DROP TABLE col;
    ALTER TABLE col_new RENAME TO col;

    -- ── decks ─────────────────────────────────────────────────────────────────────
    CREATE TABLE decks_new (
    id          INTEGER  PRIMARY KEY,
    name        TEXT     COLLATE NOCASE,
    mtime_secs  INTEGER  NOT NULL,
    usn         INTEGER  NOT NULL,
    common      BLOB     NOT NULL,
    kind        BLOB     NOT NULL
    );
    INSERT INTO decks_new SELECT * FROM decks;
    DROP TABLE decks;
    ALTER TABLE decks_new RENAME TO decks;


    DROP INDEX ix_revlog_usn;
    DROP INDEX ix_revlog_cid;

    -- Rerun this section on every sync
    DELETE FROM revlog
    WHERE id < (strftime('%s','now') - 50 * 86400) * 1000;
    PRAGMA foreign_keys = ON;

    VACUUM;
`;

const ClearOldRevlog = `
    BEGIN TRANSACTION;
    DELETE FROM revlog
    WHERE id < (strftime('%s','now') - 50 * 86400) * 1000;
    COMMIT;
`;

export async function cleanAnkiDB(path: string) {
  return await run(path, CleanAnkiDB);
}

export async function clearOldRevlog(path: string) {
  return await run(path, ClearOldRevlog);
}

export async function checkIntegrity(path: string): Promise<boolean> {
  return new Promise<boolean>((res, rej) => {
    const db = new sqlite3.Database(path, (err) => {
      if (err) {
        console.error("Could not open database", err);
        return;
      }

      db.get(
        "PRAGMA integrity_check;",
        (err, row: { integrity_check: string }) => {
          if (err) {
            console.error("Error running integrity check", err);
            res(false);
          } else if (row.integrity_check === "ok") {
            res(true);
          } else {
            console.error("Database is corrupt:", row.integrity_check);
            res(false);
          }

          db.close();
        }
      );
    });
  });
}

function run(path: string, sql: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(path, (openErr) => {
      if (openErr) return resolve(false);

      db.exec(sql, (execErr) => {
        db.close((closeErr) => {
          if (execErr) return resolve(false);
          if (closeErr) return reject(false);
          resolve(true);
        });
      });
    });
  });
}
