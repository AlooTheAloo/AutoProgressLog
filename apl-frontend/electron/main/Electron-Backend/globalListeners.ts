import { ipcMain, shell } from "electron";
import { checkInternet, setInternet } from "../../../apl-backend/Helpers/Healthcheck/internetHelper";
import electronUpdater from "electron-updater";
import { writeFileSync } from "fs";
import { getFileInAPLData } from "../../../apl-backend/Helpers/getConfig";

export function globalListeners() {
    ipcMain.handle("OpenExternal", (event, args) => {
        shell.openExternal(args);
    });

    ipcMain.handle("HasInternetConnection", async (event, args) => {
        return await checkInternet();
    })

    ipcMain.handle("SetInternetConnection", (event, args) => {
        return setInternet(args);
    })

    ipcMain.handle("Update-App", async (event, args) => {
        return await electronUpdater.autoUpdater.downloadUpdate();
    })

    ipcMain.handle("Skip-update", async (event, args) => {
        writeFileSync(getFileInAPLData("skip.txt"), args);
    })
}