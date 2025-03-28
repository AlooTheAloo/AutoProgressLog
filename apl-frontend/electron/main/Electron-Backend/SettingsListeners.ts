import { ipcMain } from "electron";
import {
  configPath,
  getConfig,
  updateConfig,
} from "../../../apl-backend/Helpers/getConfig";
import { writeFileSync } from "fs";
import { Options } from "../../../apl-backend/types/options";
import { EventEmitter } from "node:events";
import { win } from "..";

export const onConfigChange = new EventEmitter();

export function settingsListeners() {
  ipcMain.handle("GetConfig", async (event: any) => {
    return getConfig();
  });

  ipcMain.handle("SetConfig", async (event: any, arg: string) => {
    const oldConfig = getConfig();
    writeFileSync(configPath, arg);
    updateConfig();
    onConfigChange.emit("config-change", oldConfig, JSON.parse(arg));
    return getConfig();
  });

  onConfigChange.on(
    "config-change",
    (oldConfig: Options, newConfig: Options) => {
      win?.webContents.send("config-change", newConfig);
    }
  );
}
