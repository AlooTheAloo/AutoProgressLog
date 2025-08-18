import { dialog, ipcMain } from "electron";
import {
  configPath,
  getConfig,
  getFileInAPLData,
  invalidateConfigCache,
  setServerConfigAndInvalidate,
  updateConfig,
} from "../../../apl-backend/Helpers/getConfig";
import { writeFileSync, rmdirSync } from "fs";
import { Options } from "../../../apl-backend/types/options";
import { EventEmitter } from "node:events";
import { win } from "..";
import { app } from "electron";
import path from "node:path";
import { cpSync, readFileSync, rmSync } from "node:fs";
import { setConfig } from "../../../apl-backend/config/configManager";
import { Logger } from "../../../apl-backend/Helpers/Log";
import { EdenClient } from "./api/ApiManager";
import { APLStorage } from "./util/auth";
import { File } from "node:buffer";
import FormData from "form-data";

export const onConfigChange = new EventEmitter();

export function settingsListeners() {
  ipcMain.handle("GetConfig", async (event: any) => {
    return getConfig();
  });

  ipcMain.handle("SetConfig", async (event: any, arg: string) => {
    const auth = {
      headers: {
        authorization: `Bearer ${await APLStorage.get("token")}`,
      },
    };

    const oldConfig = await getConfig();
    writeFileSync(configPath, arg);
    updateConfig();
    const conf: Options = JSON.parse(arg);
    await setServerConfigAndInvalidate(async () => {
      await EdenClient.user.config.patch(conf.serverOptions.userOptions, auth);
    });
    onConfigChange.emit("config-change", oldConfig, JSON.parse(arg));
    return await getConfig();
  });

  onConfigChange.on(
    "config-change",
    (oldConfig: Options, newConfig: Options) => {
      win?.webContents.send("config-change", newConfig);
    }
  );

  ipcMain.handle("reset-settings", async () => {
    Logger.log("Reset settings handled in the electron process", "Settings");
    rmSync(path.resolve(configPath, "../"), {
      recursive: true,
      force: true,
    });
    app.relaunch();
    app.exit();
  });

  ipcMain.handle("Upload-Profile-Picture", async () => {
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
    const form = new FormData();

    EdenClient.storage.pictures.upload
      .post(
        {
          file: new File([readFileSync(image[0])], "profilePicture.png"),
        },
        {
          headers: {
            authorization: `Bearer ${await APLStorage.get("token")}`,
          },
        }
      )
      .then((x) => {
        console.log("Uploaded", JSON.stringify(x));
      });
  });
}
