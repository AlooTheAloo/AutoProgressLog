import {
  APLLocalOptions,
  APLServerOptions,
  Options,
  UserProfile,
} from "../types/options.js";
import fs, { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import electron from "electron";
import { EdenClient } from "../../electron/main/Electron-Backend/api/ApiManager.js";
import { APLStorage } from "../../electron/main/Electron-Backend/util/auth.js";

let config: Options | null = null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getFileInAPLData = (file: string) =>
  path.join(
    environment == "electron"
      ? electron.app.getPath("userData")
      : (process.env.APL_DATA_PATH ?? ""),
    file
  );

const environment: "electron" | "node" =
  electron.app != null ? "electron" : "node";
export const ankiPath = getFileInAPLData("anki.db");
export const configPath = getFileInAPLData("config.json");
export const syncDataPath = getFileInAPLData("syncData.db");
export const cache_location = getFileInAPLData("cache.json");
export const version_location = getFileInAPLData("version.json");

const DEFAULT_LOCAL_CONFIG: APLLocalOptions = {
  general: {
    discordIntegration: true,
  },
  appearance: {
    glow: true,
  },
  outputOptions: {
    outputFile: {
      path: "",
      name: "index",
      extension: ".jpg",
    },
    outputQuality: 3,
  },
};

export async function updateConfig() {
  const localOptions = await APLStorage.get<APLLocalOptions>("localConfig");
  const serverOptions = await APLStorage.get<APLServerOptions>("serverConfig");
  if (localOptions && serverOptions) {
    config = { localOptions, serverOptions };
  }
}
// --- In-memory cache ---
let serverConfigCache: { data: APLServerOptions; fetchedAt: number } | null =
  null;
let inFlight: Promise<APLServerOptions | null> | null = null;
let cacheRestored = false;

// Optional: a single key to persist the server cache (timestamp + payload)
const SERVER_CACHE_KEY = "serverConfig"; // { data: ServerOptions, fetchedAt: number }

// Restore persisted cache once (lazy)
async function restoreCacheFromStorageOnce() {
  if (cacheRestored) return;
  cacheRestored = true;
  try {
    const persisted = await APLStorage.get<{
      data: APLServerOptions;
      fetchedAt: number;
    }>(SERVER_CACHE_KEY);
    if (
      persisted &&
      typeof persisted.fetchedAt === "number" &&
      persisted.data
    ) {
      serverConfigCache = persisted;
    }
  } catch {
    /* ignore */
  }
}

// Fetch server-side config (no caching here)
async function fetchServerOptions(): Promise<APLServerOptions | null> {
  const auth = {
    headers: {
      authorization: `Bearer ${await APLStorage.get("token")}`,
    },
  };

  const [userConfig, ankiConfig, userProfile] = await Promise.all([
    EdenClient.user.config.get(auth),
    EdenClient.user.config.anki.get(auth),
    EdenClient.user.me.get(auth),
  ]);

  console.log(ankiConfig.status);
  console.log("ankiconf is : " + JSON.stringify(ankiConfig.data));

  if (userConfig.data == null) return null;
  if (userProfile.data == null) return null;
  if (userProfile.data == null) return null;
  const serverOptions: APLServerOptions = {
    userOptions: userConfig.data,
    ankiOptions:
      ankiConfig.status == 404 || ankiConfig.data == null
        ? { enabled: false }
        : { enabled: true, options: ankiConfig.data },
    userProfile: userProfile.data,
  };

  return serverOptions;
}

export async function getLegacyConfig(): Promise<any> {
  const config = await readFileSync(configPath);
  return JSON.parse(config.toString());
}

export async function setLegacyConfig(config: any) {
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

/**
 * Get merged config with caching for the server part.
 * @param opts.forceRefresh  Set true to ignore cache (manual reload).
 * @param opts.ttlMs         Cache TTL in ms (default 120_000).
 */
export async function getConfig(
  opts: { forceRefresh?: boolean; ttlMs?: number } = {}
): Promise<Options | null> {
  await restoreCacheFromStorageOnce();

  const ttlMs = opts.ttlMs ?? 120_000; // default: 2 minutes
  const now = Date.now();

  // Always read local options fresh (they live in APLStorage)
  let localConfig = (await APLStorage.get<APLLocalOptions>(
    "localConfig"
  )) as APLLocalOptions | null;
  if (localConfig == null) {
    await APLStorage.set("localConfig", DEFAULT_LOCAL_CONFIG);
    localConfig = DEFAULT_LOCAL_CONFIG;
  }

  // Use cache if valid and not forced
  const cacheValid =
    !opts.forceRefresh &&
    serverConfigCache != null &&
    now - serverConfigCache.fetchedAt < ttlMs;

  if (cacheValid && serverConfigCache != null) {
    return {
      localOptions: localConfig,
      serverOptions: serverConfigCache.data,
    };
  }

  // If another call is already fetching, await it (unless forceRefresh is set)
  if (!opts.forceRefresh && inFlight) {
    try {
      const data = await inFlight;
      if (data == null) return null;
      return { localOptions: localConfig, serverOptions: data };
    } catch {
      // fall through to refetch
    }
  }
  // Do the fetch (deduped)
  inFlight = (async () => {
    console.log("fetching server options");
    const fresh = await fetchServerOptions();
    console.log("fresh is " + JSON.stringify(fresh));
    if (fresh == null)
      return Promise.reject(new Error("No user config on server"));
    else {
      const entry = { data: fresh, fetchedAt: Date.now() };
      serverConfigCache = entry;
      // Persist (best-effort)
      try {
        await APLStorage.set(SERVER_CACHE_KEY, entry);
      } catch {
        /* ignore */
      }
      return fresh;
    }
  })();

  try {
    const data = await inFlight;
    if (data == null) return null;
    return { localOptions: localConfig, serverOptions: data };
  } finally {
    inFlight = null;
  }
}

/**
 * Manually clear the server cache (e.g., call after a successful setConfig).
 * Safe to call even if cache is empty.
 */
export async function invalidateConfigCache(): Promise<void> {
  serverConfigCache = null;
  inFlight = null;
  try {
    // If your APLStorage has delete/remove, use it. Otherwise set to null.
    if (typeof (APLStorage as any).delete === "function") {
      await (APLStorage as any).delete(SERVER_CACHE_KEY);
    } else {
      await APLStorage.set(SERVER_CACHE_KEY, null as any);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Convenience helper if you have a setter that updates server config.
 * Call this after the server confirms the update so future getConfig()
 * returns the new values immediately.
 */
export async function setServerConfigAndInvalidate(
  updater: () => Promise<void>
): Promise<void> {
  await updater();
  await invalidateConfigCache();
}

// --- Example usage ---
// 1) Normal call (uses cache if < 2 min old):
// const cfg = await getConfig();
//
// 2) Force refresh (ignore cache):
// const cfg = await getConfig({ forceRefresh: true });
//
// 3) Shorter TTL (e.g., 60 s):
// const cfg = await getConfig({ ttlMs: 60_000 });
//
// 4) After saving new server settings:
// await setServerConfigAndInvalidate(() => EdenClient.user.config.update({...}));
