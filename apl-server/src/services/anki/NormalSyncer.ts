import AnkiHTTPClient from "./AnkiHTTPClient";
import AnkiStorage from "./AnkiStorage";

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
  private userID: number;

  constructor(HTTPClient: AnkiHTTPClient, userID: number) {
    this.client = HTTPClient;
    this.userID = userID;
  }

  public async start(): Promise<boolean> {
    const pending_usn = await this.startAndProcessDeletions();
    if (!pending_usn) return false;
    const proceeded = await this.processChunksFromServer();
    if (!proceeded) return false;
    await this.stopConnection(pending_usn);
    return true;
  }

  private async startAndProcessDeletions(): Promise<number | undefined> {
    const local_usn = await AnkiStorage.getUsn(this.userID);
    const pending_usn = await this.client.getMetaUSN();
    if (!pending_usn) return undefined;
    const graves = await this.client.startSync(local_usn);
    if (graves == undefined) return undefined;
    AnkiStorage.apply_graves(graves, this.userID);
    return pending_usn;
  }

  private async processChunksFromServer() {
    return new Promise<boolean>(async (s, j) => {
      while (true) {
        const chunk = await this.client.getChunk();
        if (chunk == undefined) {
          console.log("Chunk was undefined...", "Anki");
          s(false);
          return;
        }
        await AnkiStorage.applyChunk(chunk, this.userID);
        if (chunk.done) {
          s(true);
          break;
        }
      }
      s(true);
    });
  }

  private async stopConnection(pending_usn: number): Promise<void> {
    await AnkiStorage.setUsn(pending_usn, this.userID);
  }
}
