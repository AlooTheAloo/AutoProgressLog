import sqlite3 from "sqlite3";
import fs from "fs/promises";
import path from "path";
import { tmpdir } from "os";

export async function executeQuery(
  filePath: string,
  query: string,
  params: any[] = []
) {
  return new Promise<any[]>((resolve, reject) => {
    sqlite3.verbose();
    const db = new sqlite3.Database(filePath, (err) => {
      if (err) return reject(err);
      db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
        db.close();
      });
    });
  });
}

export async function executeModification(
  filepath: string,
  sql: string,
  params: any[] = []
) {
  return new Promise<number>((resolve, reject) => {
    const db = new sqlite3.Database(filepath, (err) => {
      if (err) return reject(err);
      db.run(sql, params, function (this, err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
  });
}

export async function CreateAndTrimDatabase(
  destinationPath: string,
  file: File
) {
  const tempFilePath = `${destinationPath}.tmp`;

  // Step 1: Write uploaded file to a temporary path
  const buffer = new Uint8Array(await file.arrayBuffer());
  await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
  console.log("created dir", path.dirname(tempFilePath));
  await fs.writeFile(tempFilePath, buffer);

  // Step 2: Run cleanup SQL
  await new Promise<void>((resolve, reject) => {
    const db = new sqlite3.Database(tempFilePath, (err) => {
      if (err)
        return reject(new Error(`Failed to open SQLite DB: ${err.message}`));
    });

    db.run(CleanAnkiDB, (err) => {
      if (err)
        return reject(new Error(`Failed to clean SQLite DB: ${err.message}`));
      db.close((err) => {
        if (err)
          return reject(new Error(`Failed to close SQLite DB: ${err.message}`));
        resolve();
      });
    });
  });

  // Step 3: Move the cleaned file to the final destination
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.rename(tempFilePath, destinationPath);
}

/**
 * Deletes old revlog entries (older than ~50 days) from the given SQLite DB.
 * @param dbPath Absolute path to the .anki2 file
 */
export async function CleanRevlog(dbPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(new Error(`Failed to open DB: ${err.message}`));
    });

    db.exec(ClearOldRevlog, (err) => {
      if (err)
        return reject(new Error(`Failed to clean revlog: ${err.message}`));
      db.close((err) => {
        if (err) return reject(new Error(`Failed to close DB: ${err.message}`));
        resolve();
      });
    });
  });
}

export const getDBPath = (userId: string) =>
  path.resolve("./public/ankidb", `${userId}.collection.anki2`);

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
