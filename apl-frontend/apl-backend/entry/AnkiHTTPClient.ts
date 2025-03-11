import { compressSync, decompressSync } from "zstd.ts";
import * as fzstd from "fzstd";
import { writeFileSync } from "fs";
import { Chunk } from "./NormalSyncer";

export interface Graves {
  cards: string[];
  notes: string[];
  decks: string[];
}

export default class AnkiHTTPClient {
  private anki_URL = "http://localhost:8080";
  public key: string = "";
  public simpleRandom = crypto.randomUUID();

  constructor(key: string = "") {
    this.key = key;
  }

  private createAnkiObject(key: string = "") {
    return JSON.stringify({
      v: 11,
      k: key ?? "",
      c: "24.11,87ccd24e,macos",
      s: this.simpleRandom,
    });
  }

  private async executeRequest<T>(endpoint: string, data: any): Promise<T> {
    const compressedData = compressSync({ input: JSON.stringify(data) });
    const response = await fetch(`${this.anki_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "anki-sync": this.createAnkiObject(this.key),
        "Content-Type": "application/octet-stream",
        Accept: "*/*",
      },
      body: compressedData,
    });

    const blob = await response.blob();
    const arr = await this.blobToObject(blob);
    return JSON.parse(Buffer.from(arr).toString("utf-8"));
  }

  private async blobToObject(blob: Blob): Promise<Uint8Array> {
    const stream = blob.stream();
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;

    while (!done) {
      const { value, done: isDone } = await reader.read();
      if (value) chunks.push(value);
      done = isDone;
    }

    const data = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    );
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }

    return fzstd.decompress(data);
  }

  public async getAnkiHostKey(
    username: string,
    password: string
  ): Promise<string | undefined> {
    const response = await this.executeRequest<{ key: string }>(
      "/sync/hostKey",
      { u: username, p: password }
    );
    this.key = response.key;
    return response.key;
  }

  public async downloadInitialDatabase(): Promise<void> {
    const obj = await this.executeRequest<Uint8Array>("/sync/download", {
      _pad: null,
    });
    writeFileSync("caca.sql", obj);
  }

  public async getMetaUSN(): Promise<number> {
    const response = await this.executeRequest<{ usn: number }>("/sync/meta", {
      v: 11,
      cv: "anki,24.11 (87ccd24e),mac:15.1",
    });
    return response.usn;
  }

  public async startSync(usn: number): Promise<Graves> {
    return this.executeRequest<Graves>("/sync/start", {
      minUsn: usn,
      lnewer: false,
      graves: null,
    });
  }

  public async getChanges(): Promise<any> {
    return this.executeRequest("/sync/applyChanges", {
      changes: { models: [], decks: [[], []], tags: [] },
    });
  }

  public async getChunk(): Promise<Chunk> {
    return this.executeRequest<Chunk>("/sync/chunk", { _pad: null });
  }

  public async finish(): Promise<void> {
    await this.executeRequest("/sync/finish", { _pad: null });
  }
}
