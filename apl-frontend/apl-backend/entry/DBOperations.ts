import path from "path";
import { fileURLToPath } from "url";
import { ankiPath } from "../Helpers/getConfig";
import sqlite3 from "sqlite3";
import fs from "fs";

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

export async function cleanAnkiDB() {
  await run(CleanAnkiDB);
}

export async function clearOldRevlog() {
  await run(ClearOldRevlog);
}

function run(sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(ankiPath, (openErr) => {
      if (openErr) return reject(openErr);

      db.exec(sql, (execErr) => {
        db.close((closeErr) => {
          if (execErr) return reject(execErr);
          if (closeErr) return reject(closeErr);
          resolve();
        });
      });
    });
  });
}
