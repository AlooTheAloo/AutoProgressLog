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
    console.log("Staring and processing deletions for user:", this.userID);
    const pending_usn = await this.startAndProcessDeletions();
    console.log("We're done with deletions, pending_usn is:", pending_usn);
    if (!pending_usn) return false;
    console.log("Let's proceed with the sync...");
    const proceeded = await this.processChunksFromServer();
    if (!proceeded) return false;
    await this.stopConnection(pending_usn);
    console.log("Start is over chat !!! were so fondeneneee ");
    return true;
  }

  private async startAndProcessDeletions(): Promise<number | undefined> {
    console.log("Getting the local USN for user:", this.userID);
    const local_usn = await AnkiStorage.getUsn(this.userID);
    console.log("Got the local USN for user, in fact:   ", local_usn);
    const pending_usn = await this.client.getMetaUSN();
    console.log("Got the pending USN for user, in fact:   ", pending_usn);
    if (!pending_usn) return undefined;
    console.log("Starting up sync... (this may take a while)");
    const graves = await this.client.startSync(local_usn);
    console.log("We're done with the sync !!! here are the graves:", graves);
    if (graves == undefined) return undefined;
    AnkiStorage.apply_graves(graves, this.userID);
    return pending_usn;
  }

  private async processChunksFromServer() {
    return new Promise<boolean>(async (s, j) => {
      while (true) {
        console.log("Let's get a chunk from the server...");
        const chunk = await this.client.getChunk();
        console.log("Chunk is:", chunk);
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
