import { safeStorage } from "electron";
import Store from "electron-store";

type StorageKey = "token";

export class APLStorage {
  static async set(key: StorageKey, value: string) {
    const encrypted = safeStorage.encryptString(value);
    // @ts-ignore
    new Store({ name: "storage" }).set(key, encrypted.toString("base64"));
  }

  // Retrieve and decrypt the base64-encoded token
  static async get(key: StorageKey) {
    // @ts-ignore
    const base64 = new Store({ name: "storage" }).get(key);
    if (!base64) return null;
    const encryptedBuffer = Buffer.from(base64, "base64");
    return safeStorage.decryptString(encryptedBuffer);
  }
}
