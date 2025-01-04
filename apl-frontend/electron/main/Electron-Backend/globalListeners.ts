import { ipcMain, shell } from "electron";
import { checkInternet } from "../../../apl-backend/Helpers/Healthcheck/internetHelper";

export function globalListeners() {
    ipcMain.handle("OpenExternal", (event, args) => {
        shell.openExternal(args);
    });

    ipcMain.handle("HasInternetConnection", async (event, args) => {
        return await checkInternet();
    })
}