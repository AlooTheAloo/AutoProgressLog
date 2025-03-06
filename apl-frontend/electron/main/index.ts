import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Menu,
  MenuItem,
  dialog,
  crashReporter,
} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import registerEvents from "./Electron-Backend/";
import path from "node:path";
import os from "node:os";
import { buildMenu } from "./Electron-App/MenuBuilder";
import { version as v1 } from "../../package.json"
import semver from "semver";
import { Browser, detectBrowserPlatform, getInstalledBrowsers, install, resolveBuildId} from '@puppeteer/browsers';

const require = createRequire(import.meta.url);
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
console.log("wtf is happening 2");

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

// if (!app.requestSingleInstanceLock()) {
//   console.log("dead");
//   app.quit();
//   process.exit(0);
// }





export let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
export const indexHtml = path.join(RENDERER_DIST, "index.html");
export async function createWindow() {
  win = new BrowserWindow({
    minHeight: 600,
    minWidth: 900,
    width: 1920,
    height: 1080,
    title: "Main window",
    icon: path.join(process.env.VITE_PUBLIC, ""),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  });

  win.setMenuBarVisibility(false);
  console.log("a");
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
}

app.whenReady().then(() => {
  if(app.getLoginItemSettings().wasOpenedAtLogin || process.argv.includes("was-opened-at-login")) return;
  createWindow();
}).then(createAppBackend);
app.on("window-all-closed", () => {
  if (process.platform == "darwin") {
    app.dock.hide();
  } else if (process.platform == "win32") {
    if(!win?.isDestroyed)
      win?.setSkipTaskbar(true);
  } else {
    app.quit();
  }
  
  buildContextMenu();
});

app.on("second-instance", async () => {
  console.log("second instance");
  if (win) {
    if (process.platform == "darwin") {
      app.dock.show();
    } else if (process.platform == "win32" && !win?.isDestroyed) {
      win?.setSkipTaskbar(false);
    }
    if (win?.isDestroyed()) await createWindow();
    if (win?.isMinimized()) win.restore();
    win?.focus();
    buildContextMenu();
  }
});

app.on("activate", () => {
  
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    if(app.getLoginItemSettings().wasOpenedAtLogin || process.argv.includes("was-opened-at-login")) return;
    createWindow();
  }
});

import electronUpdater, { type AppUpdater } from "electron-updater";
import {
  buildContextMenu,
  createAppBackend,
} from "./Electron-Backend/appBackend";
import { createAutoReport } from "./Electron-Backend/Reports/AutoReportGenerator";
import { createAutoRPC } from "./Electron-Backend/RPC/RPCHandler";
import { getConfig, getFileInAPLData } from "../../apl-backend/Helpers/getConfig";
import fs from 'fs';
import { existsSync, readFileSync } from "node:fs";


app.on("ready", async () => {
  buildMenu(app);
  createAutoReport();
  createAutoRPC();
  electronUpdater.autoUpdater.forceDevUpdateConfig = true;
  electronUpdater.autoUpdater.autoDownload = false;


  const result = await electronUpdater.autoUpdater.checkForUpdates();
  const f = getFileInAPLData("skip.txt")
  const skipped = existsSync(f) ? readFileSync(f).toString() ?? "0.0.0" : "0.0.0";
  if(result?.updateInfo.version != (semver.gt(v1, skipped) ? v1 : skipped) && result?.updateInfo != null)
  {
    win?.webContents.send("update-available", result?.updateInfo);
  }

  const logFile = getFileInAPLData("app.log");
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  console.log = (...args) => {
    logStream.write(new Date().toISOString() + ' ' + args.join(' ') + '\n');
    process.stdout.write(args.join(' ') + '\n');
  };

  app.setLoginItemSettings({
    openAtLogin: true,
    args: [
      "was-opened-at-login"
    ]
  })
});


(async () => {
  const cachedir = path.join(app.getPath('home'), '.cache', 'puppeteer')
  const browsers = await getInstalledBrowsers({
    cacheDir: cachedir
  })

  const plat = await detectBrowserPlatform();
  if(plat == undefined) return;
  const buildId = await resolveBuildId(
    Browser.CHROME, plat,  "latest"
  );


  if((browsers.filter(x => x.browser == Browser.CHROME).length == 0)){
    await install({ 
      browser: Browser.CHROME,
      cacheDir: cachedir,
      buildId: buildId,
      unpack: true,
    })
  }
})();
