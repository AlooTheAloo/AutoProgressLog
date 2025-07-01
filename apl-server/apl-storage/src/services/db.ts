import Database from "bun:sqlite";
import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export function executeQuery(
  filePath: string,
  query: string,
  params: any[] = []
) {
  const db = new Database(filePath, { readonly: true });
  const result = db.prepare(query).all(...params);
  db.close();
  return result;
}

export function executeModification(
  filePath: string,
  sql: string,
  params: any[] = []
) {
  const db = new Database(filePath);
  const stmt = db.prepare(sql);
  const info = stmt.run(...params);
  db.close();
  return info.lastInsertRowid;
}

export async function CreateAndTrimDatabase(
  destinationPath: string,
  file: File
) {
  const tempFilePath = `${destinationPath}.tmp`;
  const buffer = new Uint8Array(await file.arrayBuffer());
  await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
  await fs.writeFile(tempFilePath, buffer);

  const db = new Database(tempFilePath);
  db.exec(sql_CleanAnkiDB);
  db.close();

  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.rename(tempFilePath, destinationPath);
}

type CleanRevlogResult = {
  deckId: number;
  reviewCount: number;
};

export function CleanRevlog(dbPath: string): CleanRevlogResult[] {
  const db = new Database(dbPath);
  const results: CleanRevlogResult[] = db
    .prepare<CleanRevlogResult, []>(sql_CountOldRevlogByDeck)
    .all();
  db.exec(sql_ClearOldRevlog);
  db.close();
  return results;
}

export function StoreDeletedCards(
  userID: number,
  cleanedRevlog: CleanRevlogResult[]
) {
  const db = new Database(indexDBPath);
  const insertOrUpdateStmt = db.prepare(sql_StoreDeletedCards);

  const insertMany = db.transaction((data: CleanRevlogResult[]) => {
    for (const result of data) {
      insertOrUpdateStmt.run(userID, result.deckId, result.reviewCount);
    }
  });

  insertMany(cleanedRevlog);
  db.close();
}

export async function CountRevlog(
  userId: number
): Promise<Map<number, number>> {
  const indexDB = new Database(indexDBPath);
  const userDB = new Database(getDBPath(userId));
  try {
    let revlogMap = new Map<number, number>();

    const recentRes = await userDB
      .prepare<{ did: number; reviewCount: number }, []>(
        `SELECT cards.did AS did, COUNT(*) AS reviewCount
        FROM revlog
        JOIN cards ON revlog.cid = cards.id
        GROUP BY cards.did;`
      )
      .all();

    if (!recentRes) throw new Error("Internal SQLite error in recent revlogs");

    console.log(recentRes);

    recentRes.forEach((deck) => {
      revlogMap.set(deck.did, deck.reviewCount);
    });

    // Check deleted
    const deletedRes = await indexDB
      .prepare<{ did: number; reviewCount: number }, [number]>(
        `SELECT deck_id AS did, deleted_revs AS reviewCount
        FROM deleted_revs_stats
        WHERE user_id = ?;`
      )
      .all(userId);

    if (!deletedRes)
      throw new Error("Internal SQLite error in deleted revlogs");

    deletedRes.forEach((deck) => {
      const currentValue = revlogMap.get(deck.did) ?? 0;
      revlogMap.set(deck.did, currentValue + deck.reviewCount);
    });

    return revlogMap;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  } finally {
    indexDB.close();
    userDB.close();
  }
}

export const getDBPath = (userId: number) =>
  path.resolve("./public/ankidb", `${userId}.collection.anki2`);

const indexDBPath = path.resolve("./public/ankidb", `index.db`);

export function CreateIndexDB() {
  if (existsSync(indexDBPath)) return;
  const db = new Database(indexDBPath);
  db.exec(sql_CreateIndexDB);
  db.close();
}

const sql_StoreDeletedCards = `
  INSERT INTO deleted_revs_stats (user_id, deck_id, deleted_revs)
  VALUES (?, ?, ?)
  ON CONFLICT(user_id, deck_id) DO UPDATE SET
    deleted_revs = deleted_revs + excluded.deleted_revs
`;

const sql_CreateIndexDB = `
  CREATE TABLE IF NOT EXISTS deleted_revs_stats (
    user_id TEXT NOT NULL,
    deck_id INTEGER NOT NULL,
    deleted_revs INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, deck_id)
  );
`;

const sql_CleanAnkiDB = `
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

  CREATE TABLE col_new (
    id      INTEGER PRIMARY KEY,
    crt     INTEGER NOT NULL,
    mod     INTEGER NOT NULL,
    scm     INTEGER NOT NULL,
    ver     INTEGER NOT NULL,
    dty     INTEGER NOT NULL,
    usn     INTEGER NOT NULL,
    ls      INTEGER NOT NULL,
    conf    TEXT COLLATE NOCASE,
    models  TEXT COLLATE NOCASE,
    decks   TEXT COLLATE NOCASE,
    dconf   TEXT COLLATE NOCASE,
    tags    TEXT COLLATE NOCASE
  );
  INSERT INTO col_new SELECT * FROM col;
  DROP TABLE col;
  ALTER TABLE col_new RENAME TO col;

  CREATE TABLE decks_new (
    id          INTEGER PRIMARY KEY,
    name        TEXT COLLATE NOCASE,
    mtime_secs  INTEGER NOT NULL,
    usn         INTEGER NOT NULL,
    common      BLOB NOT NULL,
    kind        BLOB NOT NULL
  );
  INSERT INTO decks_new SELECT * FROM decks;
  DROP TABLE decks;
  ALTER TABLE decks_new RENAME TO decks;
  DROP INDEX IF EXISTS ix_revlog_usn;
  DROP INDEX IF EXISTS ix_revlog_cid;

  VACUUM;
`;

const sql_ClearOldRevlog = `
  DELETE FROM revlog
  WHERE id < (strftime('%s','now') - 50 * 86400) * 1000;
`;

const sql_CountOldRevlogByDeck = `
  SELECT cards.did AS deckId, COUNT(*) AS reviewCount
  FROM revlog
  JOIN cards ON revlog.cid = cards.id
  WHERE revlog.id < (strftime('%s','now') - 50 * 86400) * 1000
  GROUP BY cards.did;
`;
