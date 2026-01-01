import { safeStorage } from "electron";
import electronStore from "electron-json-storage";

type StorageKey =
  | "token"
  | "setupComplete"
  | "Cached_DTO"
  | "localConfig"
  | "serverConfig"
  | "version";

export class APLStorage {
  static async set(key: StorageKey, value: unknown) {
    try {
      const text =
        typeof value === "string" ? value : JSON.stringify(value ?? null);

      if (!safeStorage.isEncryptionAvailable()) {
        // Optional: fall back to plaintext (or throw)
        console.warn("safeStorage not available; storing plaintext.");
        await new Promise<void>((resolve, reject) => {
          // @ts-ignore using electron-json-storage style API with callback
          electronStore.set(key, { value: text }, (error: unknown) =>
            error ? reject(error) : resolve()
          );
        });
        return true;
      }

      const encrypted = safeStorage.encryptString(text); // ✅ always a string
      const base64 = encrypted.toString("base64");

      await new Promise<void>((resolve, reject) => {
        // @ts-ignore
        electronStore.set(key, { value: base64 }, (error: unknown) =>
          error ? reject(error) : resolve()
        );
      });

      return true;
    } catch (err) {
      console.error("APLStorage.set failed:", err);
      throw err; // propagate so caller can handle
    }
  }

  // Overload signatures
  static async get<T>(key: StorageKey): Promise<T | undefined | null>;
  static async get(key: StorageKey): Promise<string | undefined | null>;
  static async get<T>(
    key: StorageKey,
    defaultValue: T | null
  ): Promise<T | undefined | null>;
  static async get(
    key: StorageKey,
    defaultValue: any
  ): Promise<string | undefined | null>;

  // Implementation
  static async get<T = unknown>(
    key: StorageKey,
    defaultValue: T | null = null
  ): Promise<T | string | undefined | null> {
    return new Promise((resolve, reject) => {
      electronStore.has(key, (err: unknown, hasKey: boolean) => {
        if (err) return reject(err);
        if (!hasKey) return resolve(defaultValue);

        // @ts-ignore electron-json-storage-style API
        electronStore.get(key, (error: unknown, data?: { value?: unknown }) => {
          if (error) return reject(error);
          if (!data || data.value == null) return resolve(null);

          const raw = data.value;

          // If it's not a string, just return it as-is.
          if (typeof raw !== "string") {
            return resolve(raw as T);
          }

          // Try to decrypt assuming base64-encoded ciphertext.
          const tryDecrypt = () => {
            try {
              const buf = Buffer.from(raw, "base64");
              // If the base64 decodes to something tiny or invalid, decryptString will throw.
              const decrypted = safeStorage.decryptString(buf);
              return decrypted;
            } catch {
              return null;
            }
          };

          const maybeDecrypted = tryDecrypt();
          const text = maybeDecrypted ?? raw; // fall back to plaintext

          // Try to JSON.parse — if it fails, return the string.
          try {
            return resolve(JSON.parse(text) as T);
          } catch {
            return resolve(text);
          }
        });
      });
    });
  }
}
