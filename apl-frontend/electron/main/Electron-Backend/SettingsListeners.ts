import { dialog, ipcMain } from "electron";
import {
  configPath,
  getConfig,
  getFileInAPLData,
  updateConfig,
} from "../../../apl-backend/Helpers/getConfig";
import { writeFileSync } from "fs";
import { Options } from "../../../apl-backend/types/options";
import { EventEmitter } from "node:events";
import { win } from "..";
import path from "node:path";
import { cpSync } from "node:fs";
import { setConfig } from "../../../apl-backend/config/configManager";

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

  ipcMain.handle("Upload-Profile-Picture", async () => {
    console.log("caca time");
    if (!win) return;
    const image = await dialog.showOpenDialogSync(win, {
      properties: [
        "openFile",
        "showHiddenFiles",
        "dontAddToRecent",
        "createDirectory",
      ],
      filters: [
        {
          name: "Image",
          extensions: ["png", "jpg", "jpeg", "webp"],
        },
      ],
    });

    if (image == undefined) return null;

    const imagePath = image[0];
    const targetPath = getFileInAPLData("profilePicture.apl");
    cpSync(imagePath, targetPath);

    const config = getConfig();
    if (config == undefined) return false;
    config.account.profilePicture = targetPath;
    setConfig(config);
    return true;
  });
}
