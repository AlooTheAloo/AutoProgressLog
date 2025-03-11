import AnkiHTTPClient from "./AnkiHTTPClient";
import Storage from "./Storage";

export interface Chunk {
  done: boolean;
  revlog: RevlogEntry[];
  cards: CardEntry[];
  notes: NoteEntry[];
}

export type RevlogEntry = number[];
export type CardEntry = number[];
export type NoteEntry = number[];

export default class NormalSyncer {
  private client: AnkiHTTPClient;
  private col: Storage;
  constructor(HTTPClient: AnkiHTTPClient, col: Storage) {
    this.client = HTTPClient;
    this.col = col;
  }

  async startAndProcessDeletions(): Promise<number> {
    const local_usn = await this.col.getUsn();
    const pending_usn = await this.client.getMetaUSN();
    const graves = await this.client.startSync(local_usn);
    this.col.apply_graves(graves, pending_usn);
    return pending_usn;
  }

  async processChunksFromServer(pending_usn: number): Promise<void> {
    return new Promise(async (s, j) => {
      while (true) {
        const chunk = await this.client.getChunk();
        this.col.applyChunk(chunk, pending_usn);
        if (chunk.done) {
          s();
          break;
        }
      }
      console.log("finished!");
    });
  }

  async stopConnection(pending_usn: number): Promise<void> {
    await this.col.setUsn(pending_usn);
  }
}
