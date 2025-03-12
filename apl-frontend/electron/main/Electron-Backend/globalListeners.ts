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

  ipcMain.handle("Update-App", async (event, args) => {
    console.log(args);
    shell.openExternal(
      `${APP_URL}/releases/download/${args.version}/${args.path}`
    );
  });

  ipcMain.handle("Skip-update", async (event, args) => {
    writeFileSync(getFileInAPLData("skip.txt"), args);
  });

  ipcMain.handle("check-for-update", async (event, args) => {
    // const result = await electronUpdater.autoUpdater.checkForUpdates();
    // console.log("result is " + result);
    // const f = getFileInAPLData("skip.txt");
    // const skipped = existsSync(f)
    //   ? readFileSync(f).toString() ?? "0.0.0"
    //   : "0.0.0";
    // console.log(skipped);
    // if (
    //   result?.updateInfo.version != (semver.gt(v1, skipped) ? v1 : skipped) &&
    //   result?.updateInfo != null
    // ) {
    //   console.log("Update availeable !");
    //   win?.webContents.send("update-available", result?.updateInfo);
    // }
  });
}
