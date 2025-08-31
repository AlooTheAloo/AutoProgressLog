import dayjs from "dayjs";
import AnkiHTTPClient from "./AnkiHTTPClient";
import Storage from "./Storage";
import { Logger } from "../Helpers/Log";

export interface Chunk {
  done: boolean;
  revlog: RevlogEntry[];
  cards: CardEntry[];
  notes: NoteEntry[];
}

export type RevlogEntry = number[];
export type CardEntry = string[];
export type NoteEntry = string[];

export default class NormalSyncer {
  private client: AnkiHTTPClient;
  private col: Storage;
  constructor(HTTPClient: AnkiHTTPClient, col: Storage) {
    this.client = HTTPClient;
    this.col = col;
  }

  public async start(): Promise<boolean> {
    const pending_usn = await this.startAndProcessDeletions();
    if (!pending_usn) return false;
    const proceeded = await this.processChunksFromServer(pending_usn);
    if (!proceeded) return false;
    await this.stopConnection(pending_usn);
    await this.col.close();
    return true;
  }

  private async startAndProcessDeletions(): Promise<number | undefined> {
    const local_usn = await this.col.getUsn();
    const pending_usn = await this.client.getMetaUSN();
    if (!pending_usn) return undefined;
    const graves = await this.client.startSync(local_usn);
    if (graves == undefined) return undefined;
    this.col.apply_graves(graves, pending_usn);
    return pending_usn;
  }

  private async processChunksFromServer(pending_usn: number) {
    return new Promise<boolean>(async (s, j) => {
      while (true) {
        const chunk = await this.client.getChunk();
        if (chunk == undefined) {
          Logger.log("Chunk was undefined...", "Anki");
          s(false);
          return;
        }
        await this.col.applyChunk(chunk, pending_usn);
        if (chunk.done) {
          s(true);
          break;
        }
      }
      s(true);
    });
  }

  private async stopConnection(pending_usn: number): Promise<void> {
    await this.col.setUsn(pending_usn);
  }
}
