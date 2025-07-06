import { safeStorage } from "electron";
import electronStore from "electron-json-storage";

type StorageKey = "token";

export class APLStorage {
  static async set(key: StorageKey, value: any) {
    console.log(electronStore.getDataPath());
    const encrypted = safeStorage.encryptString(value);

    return new Promise((resolve, reject) => {
      // @ts-ignore
      electronStore.set(
        key,
        {
          value: encrypted.toString("base64"),
        },
        (error) => {
          if (error) {
            return reject(error);
          } else return resolve(true);
        }
      );
    });
  }

  // Retrieve and decrypt the base64-encoded token
  static async get(key: StorageKey) {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      electronStore.get(key, (error, data: { value: any }) => {
        if (error) {
          return reject(error);
        } else {
          if (!data) return resolve(null);
          const encryptedBuffer = Buffer.from(data.value, "base64");
          return resolve(safeStorage.decryptString(encryptedBuffer));
        }
      });
    });
  }
}
