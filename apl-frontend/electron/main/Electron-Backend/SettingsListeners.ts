import { ipcMain } from "electron";
import { configPath, getConfig, updateConfig } from "../../../apl-backend/Helpers/getConfig";
import { writeFileSync } from "fs";
import { options } from "../../../apl-backend/types/options";

export function settingsListeners() {
    ipcMain.handle("GetConfig", async (event: any) => {
        console.log(getConfig());
        return getConfig();
    })

    ipcMain.handle("SetConfig", async (event: any, arg: string) => {
        console.log(arg);
        writeFileSync(configPath, arg);
        updateConfig();
        return getConfig();
    })
}