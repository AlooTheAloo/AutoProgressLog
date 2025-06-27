import { Graves } from "./AnkiHTTPClient";
import sqlite3, { Database } from "sqlite3";
import { CardEntry, Chunk, RevlogEntry } from "./NormalSyncer";

export default class Storage {
  private db: Database;
  constructor(path: string) {
    this.db = new sqlite3.Database(path, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  public async close() {
    await new Promise((res, rej) => {
      // Close the database connection when done
      this.db.close((err) => {
        res(err == null);
      });
    });
  }

  public async applyChunk(chunk: Chunk, pending_usn: number) {
    await this.mergeRevlog(chunk.revlog ?? []);
    await this.mergeCards(chunk.cards ?? [], pending_usn);
  }

  public apply_graves(graves: Graves, usn: number) {
    for (const cid in graves.cards) {
      this.remove_card(cid);
    }

    for (const cid in graves.cards) {
      this.remove_deck(cid);
    }
  }

  public remove_card(cid: string) {
    const stmt = this.db.prepare("delete from cards where id = ?");
    stmt.run(cid);
    stmt.finalize();
  }

  public remove_deck(did: string) {
    const stmt = this.db.prepare("delete from decks where id = ?");
    stmt.run(did);
    stmt.finalize();
  }

  async mergeRevlog(entries: RevlogEntry[]): Promise<void[]> {
    if (entries.length == 0) return [];

    return Promise.all(entries.map((x) => this.addRevlogEntry(x)));
  }

  async mergeCards(entries: CardEntry[], pendingUsn: number): Promise<void[]> {
    if (entries.length == 0) return [];
    return Promise.all(
      entries.map((x) => this.addOrUpdateCardIfNewer(x, pendingUsn))
    );
  }

  async addRevlogEntry(entry: RevlogEntry) {
    return new Promise<void>((s, j) => {
      this.db
        .prepare(
          `INSERT OR IGNORE INTO revlog (id, cid, usn, ease, ivl, lastIvl, factor, time, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(entry)
        .finalize(() => {
          s();
        });
    });
  }

  // Entry is an array of the form [id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data]
  async addOrUpdateCardIfNewer(entry: CardEntry, pendingUsn: number) {
    return new Promise<void>((s, j) => {
      this.db
        .prepare(
          `INSERT OR REPLACE INTO cards (id, did, usn, ivl) VALUES (?,?,?,?)`
        )
        .run(
          [entry[0], entry[2], entry[6], entry[9]], // id, did, usn, ivl
          (err: any, data: any) => {
            if (err) {
              console.log(err);
            }
          }
        )
        .finalize(() => {
          s();
        });
    });
  }

  async getUsn(): Promise<number> {
    return new Promise<number>((res, rej) => {
      this.db
        .prepare("SELECT usn FROM col;")
        .get((e: Error, d: { usn: number }) => {
          res(d.usn ?? 0);
        });
    });
  }

  async setUsn(usn: number): Promise<void> {
    this.db.prepare("UPDATE col SET usn = ?").run(usn);
  }
}
