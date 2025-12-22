import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { fileURLToPath } from "node:url";
import registerEvents from "./Electron-Backend/";
import path from "node:path";
import os from "node:os";
import { buildMenu } from "./Electron-App/MenuBuilder";
import electronUpdater from "electron-updater";
import {
  buildContextMenu,
  createAppBackend,
  FocusApp,
} from "./Electron-Backend/appBackend";
import { createAutoRPC } from "./Electron-Backend/RPC/RPCHandler";
import {
  getConfig,
  getFileInAPLData,
} from "../../apl-backend/Helpers/getConfig";
import fs from "fs";
import checkHealth from "./Electron-App/HealthCheck";
import { SocketClient } from "./Electron-Backend/Socket/SocketClient";

import {
  Browser,
  detectBrowserPlatform,
  getInstalledBrowsers,
  install,
  resolveBuildId,
} from "@puppeteer/browsers";
import { initializeDeepLink } from "./Electron-Backend/DeepLink";
import { config as dotenvConfig } from "dotenv";
import { initializeApiManager } from "./Electron-Backend/api/ApiManager";
import { Logger } from "../../apl-backend/Helpers/Log";
import { init } from "@bokuweb/zstd-wasm";
import { APLStorage } from "./Electron-Backend/util/auth";
import { VersionManager } from "../../apl-backend/Helpers/VersionManager";

const isProd = app.isPackaged;

// When packaged, use the correct path relative to the `.asar`
const envPath = isProd
  ? path.join(process.resourcesPath, "app.asar.unpacked", ".env.production")
  : path.resolve(".env");

Logger.log(`Loading ${envPath}`, "ENV");
if (fs.existsSync(envPath)) {
  dotenvConfig({ path: envPath });
  Logger.log(`SERVER_URL = ${process.env.SERVER_URL}`, "ENV");
  (async () => {
    Logger.log("AUTHORIZATION = " + (await APLStorage.get("token")), "ENV");
  })();
} else {
  Logger.log(`Missing .env file at ${envPath}`, "ENV");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initializeApiManager();
registerEvents();

// In production (packaged), __dirname is inside app.asar at app.asar/dist/main/
// In development, __dirname is at electron/main/ (after build) or out/ directory structure
process.env.APP_ROOT = isProd
  ? process.resourcesPath  // Points to app.asar and app.asar.unpacked parent
  : path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
// Renderer files are built to out/renderer/ by electron-vite
export const RENDERER_DIST = isProd
  ? path.join(process.resourcesPath, "app.asar", "out", "renderer")
  : path.join(process.env.APP_ROOT, "out/renderer");
export const VITE_DEV_SERVER_URL = process.env.ELECTRON_RENDERER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  Logger.log("App already running");
  app.quit();
  process.exit(0);
}

export let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.js");
export const indexHtml = path.join(RENDERER_DIST, "index.html");
export async function createWindow() {
  win = new BrowserWindow({
    show: true,
    minHeight: 600,
    minWidth: 900,
    width: 1920,
    height: 1080,
    title: "Main window",
    icon: path.join(process.env.VITE_PUBLIC, ""),
    webPreferences: {
      preload,
    },
  });

  // Only show when ready (for first load)
  win.once("ready-to-show", () => {
    if (process.env.NODE_ENV !== "development") {
      win?.show();
    } else {
      // win?.showInactive();
      // win?.blur();
    }
  });
  win.setMenuBarVisibility(false);
  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }
  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });
  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // win.webContents.on('will-navigate', (event, url) => { }) #344
  win.webContents.once("did-finish-load", () => {});

  buildContextMenu();
}

// Handle protocol URLs on macOS when app is already running or launched with URL
app.on("open-url", async (event, url) => {
  event.preventDefault();
  
  if (url.startsWith("apl://")) {
    Logger.log(`Received deep link: ${url}`, "DeepLink");
    
    // If window doesn't exist yet, wait for it to be created
    if (!win) {
      await createWindow();
    }
    
    // Focus the window and send the URL to renderer
    await FocusApp();
    win?.webContents.send("open-url", url);
  }
});

app
  .whenReady()
  .then(async () => {
    await createWindow();
    if (
      app.getLoginItemSettings().wasOpenedAtLogin ||
      process.argv.includes("was-opened-at-login")
    ) {
      win?.destroy();
      return;
    }
    
    // Check if app was launched with a protocol URL (e.g., from email link)
    const protocolUrl = process.argv.find(arg => arg.startsWith("apl://"));
    if (protocolUrl && win) {
      Logger.log(`Launched with deep link: ${protocolUrl}`, "DeepLink");
      win.webContents.send("open-url", protocolUrl);
    }
  })
  .then(createAppBackend);
app.on("window-all-closed", () => {
  if (process.platform == "darwin") {
    app.dock?.hide();
  } else if (process.platform == "win32") {
    if (!win?.isDestroyed) win?.setSkipTaskbar(true);
  } else {
    app.quit();
  }

  buildContextMenu();
});

app.on("second-instance", async (evt, cmd, wd) => {
  if (VITE_DEV_SERVER_URL) return;
  if (win) {
    FocusApp();
    buildContextMenu();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
    if (
      app.getLoginItemSettings().wasOpenedAtLogin ||
      process.argv.includes("was-opened-at-login")
    ) {
      Logger.log("App opened at login but window not created");
      win?.destroy();
      return;
    }
  }
});

app.on("ready", async () => {
  // Register as default protocol client for apl:// URLs
  // This ensures that email links open AutoProgressLog instead of a generic Electron app
  if (!app.isDefaultProtocolClient("apl")) {
    const registered = app.setAsDefaultProtocolClient("apl");
    Logger.log(
      `Protocol registration for apl:// ${registered ? "successful" : "failed"}`,
      "Protocol"
    );
  }

  if (await VersionManager.verifyVersion()) {
    await checkHealth(getConfig());
  }

  if (!VersionManager.exists()) {
    await VersionManager.init();
  }

  // ZFSTD
  await init();

  const ver = await VersionManager.verifyVersion();
  console.log("ver : " + ver);
  console.log("setupComplete : " + (await APLStorage.get("setupComplete")));  
  if ((await APLStorage.get("setupComplete")) && ver) {
    try {
      console.log("Trying to init socket client");
      // TODO : Add an API call to create the webhook
      await new SocketClient().init({
        token: (await APLStorage.get("token")) as string,
      });
    } catch (e) {
      Logger.log("Failed to init socket client", "Socket");
      Logger.log(e, "Socket");
    }
  }

  buildMenu(app);
  createAutoRPC();
  electronUpdater.autoUpdater.forceDevUpdateConfig = true;
  electronUpdater.autoUpdater.autoDownload = false;

  const logFile = getFileInAPLData("app.log");
  const logStream = fs.createWriteStream(logFile, { flags: "a" });

  console.log = (...args) => {
    logStream.write(new Date().toISOString() + " " + args.join(" ") + "\n");
    process.stdout.write(args.join(" ") + "\n");
  };

  console.error = (...args) => {
    logStream.write(
      new Date().toISOString() + " ERROR : " + args.join(" ") + "\n"
    );
    process.stderr.write(args.join(" ") + "\n");
  };
  const isDev = process.env.NODE_ENV === "development";
  if (!app.getLoginItemSettings().openAtLogin && !isDev) {
    app.setLoginItemSettings({
      openAtLogin: !isDev,
      args: ["was-opened-at-login"],
    });
  }
  await initializeDeepLink();
});

(async () => {
  const cachedir = path.join(app.getPath("home"), ".cache", "puppeteer");
  const browsers = await getInstalledBrowsers({
    cacheDir: cachedir,
  });

  const plat = await detectBrowserPlatform();
  if (plat == undefined) return;
  const buildId = await resolveBuildId(Browser.CHROME, plat, "latest");

  if (browsers.filter((x) => x.browser == Browser.CHROME).length == 0) {
    await install({
      browser: Browser.CHROME,
      cacheDir: cachedir,
      buildId: buildId,
      unpack: true,
    });
  }
})();
