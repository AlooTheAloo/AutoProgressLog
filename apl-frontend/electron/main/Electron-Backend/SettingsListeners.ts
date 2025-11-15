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
    console.log("SetConfig is called with arg " + arg);
    const auth = {
      headers: {
        authorization: `Bearer ${await APLStorage.get("token")}`,
      },
    };

    const oldConfig = await getConfig();
    writeFileSync(configPath, arg);
    updateConfig();
    const conf: Options = JSON.parse(arg);
    console.log("AGT is " + conf.serverOptions.userOptions.autoGenTime);
    await setServerConfigAndInvalidate(async () => {
      APLStorage.set("localConfig", conf.localOptions);
      const res1 = await EdenClient.user.config.patch(
        conf.serverOptions.userOptions,
        auth
      );
      const res2 = await EdenClient.user.me.patch(
        conf.serverOptions.userProfile,
        auth
      );
      console.log("res1 is " + JSON.stringify(res1));
      console.log("res2 is " + JSON.stringify(res2));
      const currentAnkiSettings = await EdenClient.user.config.anki.get(auth);
      if (
        currentAnkiSettings.status == 200 &&
        !conf.serverOptions.ankiOptions.enabled
      ) {
        await EdenClient.user.config.anki.delete(null, auth);
      }

      if (conf.serverOptions.ankiOptions.enabled)
        try {
          let resp;
          if (currentAnkiSettings.status == 404) {
            resp = await EdenClient.user.config.anki.post(
              conf.serverOptions.ankiOptions.options,
              auth
            );
          } else {
            resp = await EdenClient.user.config.anki.patch(
              conf.serverOptions.ankiOptions.options,
              auth
            );
          }

          resp.status == 200
            ? console.log("Patched successfully")
            : console.log("Failed to patch" + resp.status);
        } catch (e) {
          console.log("Anki config patch failed : " + e);
        }
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
    const imagePaths = dialog.showOpenDialogSync(win, {
      properties: ["openFile"],
      filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg", "webp"] }],
    });
    if (!imagePaths || imagePaths.length === 0) return null;

    const imagePath = imagePaths[0];
    const buffer = readFileSync(imagePath);
    const file = new File([buffer], path.basename(imagePath), {
      type: "image/" + path.extname(imagePath).replace(".", ""),
    });

    // Call Eden treaty route
    const res = await EdenClient.storage.pictures.upload.post(
      {
        file: file as any,
      },
      {
        headers: {
          authorization: `Bearer ${await APLStorage.get("token")}`,
        },
      }
    );
    console.log("Uploaded", JSON.stringify(res));
    return res.data;
  });
}
