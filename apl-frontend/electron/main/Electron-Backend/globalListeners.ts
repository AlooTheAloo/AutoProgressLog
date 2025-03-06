import { ipcMain, shell } from "electron";
import { checkInternet, setInternet } from "../../../apl-backend/Helpers/Healthcheck/internetHelper";
import electronUpdater from "electron-updater";
import { writeFileSync } from "fs";
import { getFileInAPLData } from "../../../apl-backend/Helpers/getConfig";

const APP_URL = "https://github.com/AlooTheAloo/AutoProgressLog/";

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
        console.log(args);
        shell.openExternal(`${APP_URL}/releases/download/${args.version}/${args.path}`);
    })

    ipcMain.handle("Skip-update", async (event, args) => {
        writeFileSync(getFileInAPLData("skip.txt"), args);
    })
}