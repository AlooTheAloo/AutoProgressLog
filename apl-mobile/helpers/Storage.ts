import { Graves } from "./ankiHTTPClientHelper";
import sqlite3, { Database } from "sqlite3";
import { CardEntry, Chunk, NoteEntry, RevlogEntry } from "./NormalSyncer";

export default class Storage {
  private db: Database;
  constructor(path: string) {
    this.db = new sqlite3.Database(path, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  public apply_graves(graves: Graves, usn: number) {
    for (const nid in graves.notes) {
      this.addNoteGrave(nid, usn);
    }
    for (const cid in graves.cards) {
      this.addCardGrave(cid, usn);
    }
    for (const did in graves.decks) {
      this.addDeckGrave(did, usn);
    }
  }

  public async close() {
    await new Promise((res, rej) => {
      // Close the database connection when done
      this.db.close((err) => {
        res(err == null);
      });
    });
  }

  addCardGrave(cid: string, usn: number): Promise<void> {
    return this.addGrave(cid, GraveKind.Card, usn);
  }

  addNoteGrave(nid: string, usn: number): Promise<void> {
    return this.addGrave(nid, GraveKind.Note, usn);
  }

  addDeckGrave(did: string, usn: number): Promise<void> {
    return this.addGrave(did, GraveKind.Deck, usn);
  }

  removeCardGrave(cid: string): Promise<void> {
    return this.removeGrave(cid, GraveKind.Card);
  }

  removeNoteGrave(nid: string): Promise<void> {
    return this.removeGrave(nid, GraveKind.Note);
  }

  removeDeckGrave(did: string): Promise<void> {
    return this.removeGrave(did, GraveKind.Deck);
  }

  private addGrave(id: string, kind: GraveKind, usn: number): Promise<void> {
    return new Promise((r, rj) => {
      const stmt = this.db.prepare(
        "INSERT OR IGNORE INTO graves (usn, oid, type) VALUES (?, ?, ?)"
      );
      stmt.run(usn, id, kind);
      stmt.finalize(() => {
        r();
      });
    });
  }

  private removeGrave(id: string, kind: GraveKind): Promise<void> {
    return new Promise((r, rj) => {
      const stmt = this.db.prepare(
        "DELETE FROM graves WHERE oid = ? AND type = ?"
      );
      stmt.run(id, kind);
      stmt.finalize(() => {
        r();
      });
    });
  }

  public async applyChunk(chunk: Chunk, pending_usn: number) {
    await this.mergeRevlog(chunk.revlog ?? []);
    await this.mergeCards(chunk.cards ?? [], pending_usn);
    await this.mergeNotes(chunk.notes ?? [], pending_usn);
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

  async mergeNotes(entries: NoteEntry[], pendingUsn: number): Promise<void[]> {
    if (entries.length == 0) return [];
    return Promise.all(
      entries.map((x) => this.addOrUpdateNoteIfNewer(x, pendingUsn))
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

  async addOrUpdateCardIfNewer(entry: CardEntry, pendingUsn: number) {
    return new Promise<void>((s, j) => {
      this.db
        .prepare(
          `INSERT OR REPLACE INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        )
        .run(entry, (err: any, data: any) => {
          if (err) {
            console.log(err);
          }
        })
        .finalize(() => {
          s();
        });
    });
  }

  async addOrUpdateNoteIfNewer(entry: NoteEntry, pendingUsn: number) {
    return new Promise<void>((s, j) => {
      this.db
        .prepare(
          `INSERT OR REPLACE INTO notes (id,guid,mid,mod,usn,tags,flds,sfld,csum,flags,data) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
        )
        .run(entry, (err: any, data: any) => {
          if (err) {
            console.log(err);
          }
        })
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

enum GraveKind {
  Note,
  Deck,
  Card,
}
