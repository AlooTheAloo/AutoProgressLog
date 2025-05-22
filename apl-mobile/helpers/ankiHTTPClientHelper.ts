import * as fzstd from "fzstd";
//import { writeFileSync } from "fs";
import { Chunk } from "./NormalSyncer";
import Buffer from "buffer/";
import * as FileSystem from "expo-file-system";

import { compress, decompress } from "react-native-zstd";

export interface Graves {
  cards: string[];
  notes: string[];
  decks: string[];
}

export const DEFAULT_ANKI_URL = "https://sync.ankiweb.net";
let anki_url = DEFAULT_ANKI_URL;

export default class AnkiHTTPClient {
  public key: string = "";
  public simpleRandom = "apl-mobile-is-real";

  constructor(key: string = "", url: string = DEFAULT_ANKI_URL) {
    if (url != DEFAULT_ANKI_URL) anki_url = url;
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
    const response = await window.fetch(anki_url + path, {
      ...options,
      redirect: "manual",
    });
    if (response.headers.has("Location")) {
      const location = response.headers.get("Location");
      if (location) {
        anki_url = location.slice(0, -1);
        const newUrl = new URL(anki_url); // Ensure the new URL is absolute
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
    const compressedData = compress(JSON.stringify(data));
    const testData = Uint8Array.from(compressedData);

    const response = await this.fetchWithRedirect(endpoint, {
      method: "POST",
      headers: {
        "anki-sync": this.createAnkiObject(this.key),
        "Content-Type": "application/octet-stream",
        Accept: "*/*",
      },
      body: testData,
    });

    if (response.status != 200) {
      console.log("Response was not 200, it was " + response.status);
      return undefined;
    }
    const blob = await response.blob();
    const arr = await this.blobToObject(blob);
    if (raw) {
      return arr;
    }
    return JSON.parse(Buffer.Buffer.from(arr).toString("utf-8"));
  }

  private async blobToObject(blob: Blob): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (result instanceof ArrayBuffer) {
          resolve(fzstd.decompress(new Uint8Array(result)));
        } else {
          reject(new Error("Failed to read blob as ArrayBuffer"));
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
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
      if (response == undefined) return undefined;
      this.key = response.key;
      return response.key;
    } catch (e) {
      return undefined;
    }
  }

  public async downloadInitialDatabase(filePath: string): Promise<boolean> {
    const usn = await this.getMetaUSN();

    const obj = await this.executeRequest(
      "/sync/download",
      {
        _pad: null,
      },
      true
    );
    if (obj == undefined) return false;

    this.writeFileSync(obj);
    return true;
  }

  public async writeFileSync(obj: any, filename = "dump.apl") {
    try {
      const path = `${FileSystem.documentDirectory}${filename}`;
      const realObj = Buffer.Buffer.from(obj).toString("base64");
      await FileSystem.writeAsStringAsync(path, realObj, {
        encoding: "base64",
      });
      console.log(`File written to: ${path}`);
      return path;
    } catch (error) {
      console.error("Error writing file:", error);
      return null;
    }
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

  public async getChanges(): Promise<boolean> {
    return (
      (await this.executeRequest("/sync/applyChanges", {
        changes: { models: [], decks: [[], []], tags: [] },
      })) != undefined
    );
  }

  public async getChunk(): Promise<Chunk | undefined> {
    return this.executeRequest<Chunk>("/sync/chunk", { _pad: null });
  }

  public async finish(): Promise<void> {
    await this.executeRequest("/sync/finish", { _pad: null });
    return;
  }
}
