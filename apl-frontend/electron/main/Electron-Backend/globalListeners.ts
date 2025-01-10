import { ipcMain, shell } from "electron";
import { checkInternet, setInternet } from "../../../apl-backend/Helpers/Healthcheck/internetHelper";

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
}