import { compressSync } from "zstd.ts";
import * as fzstd from "fzstd";
import { writeFileSync } from "fs";
import { Chunk } from "./NormalSyncer";

export interface Graves {
  cards: string[];
  notes: string[];
  decks: string[];
}

export default class AnkiHTTPClient {
  private anki_URL = "https://sync.ankiweb.net";
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

  private async fetchWithRedirect(path: string, options: RequestInit = {}) {
    const response = await fetch(this.anki_URL + path, {
      ...options,
      redirect: "manual",
    });

    if (response.headers.has("Location")) {
      const location = response.headers.get("Location");
      if (location) {
        this.anki_URL = location.slice(0, -1);
        const newUrl = new URL(this.anki_URL); // Ensure the new URL is absolute
        newUrl.pathname = path; // Force the correct path

        return fetch(newUrl.toString(), options); // Make the correct request
      }
    }

    return response;
  }

  private async executeRequest<T>(
    endpoint: string,
    data: any,
    raw: true
  ): Promise<Uint8Array>;
  private async executeRequest<T>(
    endpoint: string,
    data: any,
    raw?: false
  ): Promise<T>;
  private async executeRequest<T>(
    endpoint: string,
    data: any,
    raw: boolean = false
  ): Promise<T | Uint8Array> {
    console.log(endpoint);
    console.log(this.createAnkiObject(this.key));
    const compressedData = compressSync({ input: JSON.stringify(data) });
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const response = await this.fetchWithRedirect(endpoint, {
      method: "POST",
      headers: {
        "anki-sync": this.createAnkiObject(this.key),
        "Content-Type": "application/octet-stream",
        Accept: "*/*",
      },
      body: compressedData,
    });

    const blob = await response.blob();
    console.log(await blob.text());

    const arr = await this.blobToObject(blob);
    if (raw) {
      return arr;
    }
    return JSON.parse(Buffer.from(arr).toString("utf-8"));
  }

  private async blobToObject(blob: Blob): Promise<Uint8Array> {
    console.log(await blob.text());

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
    console.log(this.key);

    return response.key;
  }

  public async downloadInitialDatabase(): Promise<void> {
    const obj = await this.executeRequest(
      "/sync/download",
      {
        _pad: null,
      },
      true
    );
    writeFileSync("caca.sql", obj);
  }

  public async getMetaUSN(): Promise<number> {
    const response = await this.executeRequest<{ usn: number }>("/sync/meta", {
      v: 11,
      cv: "anki,24.11 (87ccd24e),mac:15.3.1",
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
