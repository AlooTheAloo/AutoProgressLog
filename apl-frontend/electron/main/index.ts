import { app, BrowserWindow, shell } from "electron";
import { fileURLToPath } from "node:url";
import registerEvents from "./Electron-Backend/";
import path from "node:path";
import os from "node:os";
import { buildMenu } from "./Electron-App/MenuBuilder";
import electronUpdater, { type AppUpdater } from "electron-updater";
import {
  buildContextMenu,
  createAppBackend,
} from "./Electron-Backend/appBackend";
import { createAutoReport } from "./Electron-Backend/Reports/AutoReportGenerator";
import { createAutoRPC } from "./Electron-Backend/RPC/RPCHandler";
import {
  getConfig,
  getFileInAPLData,
} from "../../apl-backend/Helpers/getConfig";
import fs from "fs";
import { CacheManager } from "../../apl-backend/Helpers/cache";
import checkHealth from "./Electron-App/HealthCheck";
import { init } from "@bokuweb/zstd-wasm";
import { SocketClient } from "./Electron-Backend/Socket/SocketClient";
import { dialog } from "electron";
import {
  Browser,
  detectBrowserPlatform,
  getInstalledBrowsers,
  install,
  resolveBuildId,
} from "@puppeteer/browsers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

registerEvents();

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!VITE_DEV_SERVER_URL) {
  if (!app.requestSingleInstanceLock()) {
    console.log("dead");
    app.quit();
    process.exit(0);
  }
}

export let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
export const indexHtml = path.join(RENDERER_DIST, "index.html");
export async function createWindow() {
  console.log("creating window");
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
      win?.showInactive();
      win?.blur();
    }
  });
  win.setMenuBarVisibility(false);
  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    console.log("opening devt");
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

app
  .whenReady()
  .then(async () => {
    await createWindow();
    if (
      app.getLoginItemSettings().wasOpenedAtLogin ||
      process.argv.includes("was-opened-at-login")
    ) {
      win?.destroy();
      console.log("App opened at login but window not created");
      return;
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
    if (process.platform == "darwin") {
      app.dock?.show();
    } else if (process.platform == "win32" && !win?.isDestroyed) {
      win?.setSkipTaskbar(false);
    }
    if (win?.isDestroyed()) await createWindow();
    if (win?.isMinimized()) win.restore();
    win?.focus();
    buildContextMenu();
  }
});

app.on("open-url", (event, url) => {});

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
      console.log("App opened at login but window not created");
      win?.destroy();
      return;
    }
  }
});

app.on("ready", async () => {
  if (CacheManager.verifyVersion()) {
    await checkHealth(getConfig());
  }

  await init();

  if (CacheManager.exists) {
    try {
      // TODO : Add an API call to create the webhook

      // Create the socket client, accessible through the singleton
      console.log("Waiting for init...");
      await new SocketClient().init({
        token: getConfig()?.toggl.togglToken ?? "",
      });
      console.log("Init done");
    } catch (e) {
      console.log("Failed to init socket client");
      console.log(e);
    }
  }

  buildMenu(app);
  createAutoReport();
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

  // TODO : Make this into a setting
  if (!app.getLoginItemSettings().openAtLogin && !isDev) {
    app.setLoginItemSettings({
      openAtLogin: !isDev,
      args: ["was-opened-at-login"],
    });
  }

  // Register the APL protocol
  if (process.defaultApp && !isDev) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient("apl", process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient("apl");
  }
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
