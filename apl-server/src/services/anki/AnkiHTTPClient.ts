import * as fzstd from "fzstd";
import { Chunk } from "./NormalSyncer";
import { compress } from "@bokuweb/zstd-wasm";

export interface Graves {
  cards: string[];
  notes: string[];
  decks: string[];
}

export const DEFAULT_ANKI_URL = "https://sync.ankiweb.net";
// Direct copy of the original rust AnkiHTTPClient
export default class AnkiHTTPClient {
  public key: string = "";
  private anki_url = DEFAULT_ANKI_URL;
  public simpleRandom = crypto.randomUUID();

  constructor(key: string = "", url: string = DEFAULT_ANKI_URL) {
    this.anki_url = url;
    this.key = key;
  }

  isLoggedIn = () => this.key != "";

  private createAnkiObject(key: string = "") {
    return JSON.stringify({
      v: 11,
      k: key ?? "",
      c: "24.11,87ccd24e,macos",
      s: this.simpleRandom,
    });
  }

  private async fetchWithRedirect(path: string, options: RequestInit = {}) {
    console.log("Pinging endpoint at " + this.anki_url + path);
    const response = await fetch(this.anki_url + path, {
      ...options,
      redirect: "manual",
    });
    if (response.headers.has("Location")) {
      const location = response.headers.get("Location");
      if (location) {
        this.anki_url = location.slice(0, -1);
        const newUrl = new URL(this.anki_url); // Ensure the new URL is absolute
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
  ): Promise<Uint8Array | undefined>;
  private async executeRequest<T>(
    endpoint: string,
    data: any,
    raw?: false
  ): Promise<T | undefined>;
  private async executeRequest<T>(
    endpoint: string,
    data: any,
    raw: boolean = false
  ): Promise<T | Uint8Array | undefined> {
    const compressedData = compress(
      Uint8Array.from(Buffer.from(JSON.stringify(data), "utf8"))
    );

    const response = await this.fetchWithRedirect(endpoint, {
      method: "POST",
      headers: {
        "anki-sync": this.createAnkiObject(this.key),
        "Content-Type": "application/octet-stream",
        Accept: "*/*",
      },
      body: compressedData,
    });

    if (response.status != 200) {
      console.log("Response was not 200, it was " + response.status, "Anki");
      return undefined;
    }
    const blob = await response.blob();
    const arr = await this.blobToObject(blob);
    if (raw) {
      return arr;
    }
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

  public async login(
    username: string,
    password: string
  ): Promise<string | undefined> {
    try {
      const response = await this.executeRequest<{ key: string }>(
        "/sync/hostKey",
        { u: username, p: password }
      );
      console.log("Response from Anki login:", response, "Anki");
      if (response == undefined) return undefined;
      this.key = response.key;
      return response.key;
    } catch (e) {
      console.error("Anki login failed:", e, "Anki");
      return undefined;
    }
  }

  public async downloadInitialDatabase(): Promise<Uint8Array | undefined> {
    return this.executeRequest(
      "/sync/download",
      {
        _pad: null,
      },
      true
    );
  }

  public async getMetaUSN(): Promise<number | false> {
    const response = await this.executeRequest<{ usn: number }>("/sync/meta", {
      v: 11,
      cv: "anki,24.11 (87ccd24e),mac:15.3.1",
    });

    if (response == undefined) return false;
    return response.usn;
  }

  public async startSync(usn: number): Promise<Graves | undefined> {
    return this.executeRequest<Graves>("/sync/start", {
      minUsn: usn,
      lnewer: false,
      graves: null,
    });
  }

  public async getChunk(): Promise<Chunk | undefined> {
    return this.executeRequest<Chunk>("/sync/chunk", { _pad: null });
  }

  public async finish(): Promise<void> {
    await this.executeRequest("/sync/finish", { _pad: null });
    return;
  }
}
