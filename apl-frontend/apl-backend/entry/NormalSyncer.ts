import dayjs from "dayjs";
import AnkiHTTPClient from "./AnkiHTTPClient";
import Storage from "./Storage";

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
    console.log("Starting sync");
    const start = dayjs();
    const pending_usn = await this.startAndProcessDeletions();
    console.log("Got USN in ", dayjs().diff(start, "ms") + " ms");
    if (!pending_usn) return false;
    const proceeded = await this.processChunksFromServer(pending_usn);
    console.log("Got chunks ", dayjs().diff(start, "ms") + " ms");
    if (!proceeded) return false;
    await this.stopConnection(pending_usn);
    await this.col.close();
    console.log("Closed ", dayjs().diff(start, "ms") + " ms");
    return true;
  }

  private async startAndProcessDeletions(): Promise<number | undefined> {
    const start = dayjs();
    const local_usn = await this.col.getUsn();
    console.log("1 is " + dayjs().diff(start, "ms") + " ms");
    const pending_usn = await this.client.getMetaUSN();
    console.log("2 is " + dayjs().diff(start, "ms") + " ms");
    const graves = await this.client.startSync(local_usn);
    console.log("3 is " + dayjs().diff(start, "ms") + " ms");
    if (graves == undefined || !pending_usn) return undefined;
    this.col.apply_graves(graves, pending_usn);
    return pending_usn;
  }

  private async processChunksFromServer(pending_usn: number) {
    return new Promise<boolean>(async (s, j) => {
      while (true) {
        const chunk = await this.client.getChunk();
        if (chunk == undefined) {
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
