import { ipcMain, shell } from "electron";
import {
  checkInternet,
  setInternet,
} from "../../../apl-backend/Helpers/Healthcheck/internetHelper";
import electronUpdater from "electron-updater";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { getFileInAPLData } from "../../../apl-backend/Helpers/getConfig";
import { win } from "..";
import semver from "semver";
import { version as v1 } from "../../../package.json";
import { upgrade_schema } from "../../../apl-backend/apl-upgrade";
import { CacheManager } from "../../../apl-backend/Helpers/cache";

const APP_URL = "https://github.com/AlooTheAloo/AutoProgressLog/";

export function globalListeners() {
  ipcMain.handle("OpenExternal", (event, args) => {
    shell.openExternal(args);
  });

  ipcMain.handle("HasInternetConnection", async (event, args) => {
    return await checkInternet();
  });

  ipcMain.handle("SetInternetConnection", (event, args) => {
    return setInternet(args);
  });

  ipcMain.handle("Update-App-Schema", async (event, args) => {
    await upgrade_schema(CacheManager.SemVer().version);
    win?.webContents.send("router-push", "/app/dashboard");
    win?.webContents.send("is-setup-complete", true);
  });

  ipcMain.handle("Update-App", async (event, args) => {
    shell.openExternal(
      `${APP_URL}/releases/download/${args.version}/${args.path}`
    );
  });

  ipcMain.handle("Skip-update", async (event, args) => {
    writeFileSync(getFileInAPLData("skip.txt"), args);
  });

  ipcMain.handle("check-for-update", async (event, args) => {
    if (!CacheManager.exists) return;

    const result = await electronUpdater.autoUpdater.checkForUpdates();
    console.log("result is " + result);
    const f = getFileInAPLData("skip.txt");
    const skipped = existsSync(f)
      ? readFileSync(f).toString() ?? "0.0.0"
      : "0.0.0";
    if (
      result?.updateInfo.version != (semver.gt(v1, skipped) ? v1 : skipped) &&
      result?.updateInfo != null
    ) {
      console.log("Update availeable !");
      win?.webContents.send("update-available", result?.updateInfo);
    }
  });
}
