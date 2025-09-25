import { win } from "../../../../apl-frontend/electron/main";
import upgrade_1_0_2 from "./1.0.2";
import { SemVer } from "semver";
import { CacheManager } from "../../Helpers/cache";
import {
  cache_location,
  configPath,
  syncDataPath,
} from "../../Helpers/getConfig";
import { existsSync, readFileSync, readSync, rmSync } from "fs";
import { ipcMain } from "electron";
import path from "path";
import { EdenClient } from "../../../electron/main/Electron-Backend/api/ApiManager";
import { APLStorage } from "../../../electron/main/Electron-Backend/util/auth";
import { APLLocalOptions, OutputOptions } from "../../types/options";
export default async function upgrade_2_0_0() {
  console.log("Upgrading to 2.0.0");
  if (
    new SemVer(CacheManager.get().version).compare("2.0.0") > -1 &&
    !existsSync(cache_location)
  ) {
    return;
  }
  await new Promise<void>((res, req) => {
    console.log("Sending 2_0_0_upgrade");
    win?.webContents.send("2_0_0_upgrade");
    ipcMain.handleOnce("update-2_0_0_done", async () => {
      await APLStorage.set("setupComplete", true);
      [cache_location, configPath, syncDataPath].forEach((x) => rmSync(x));
      res();
    });
    ipcMain.handleOnce("legacy-migration", async () => {
      try {
        const paths = [cache_location, configPath, syncDataPath];
        const bufs = paths.map((x) => readFileSync(x));
        const files = bufs.map(
          (x, i) =>
            new File([x], path.basename(paths[i]), {
              type: "application/text",
            })
        );

        // Call Eden treaty route
        const res = await EdenClient.user["import-legacy"].post(
          {
            cache: files[0],
            config: files[1],
            syncdb: files[2],
          },
          {
            headers: {
              authorization: `Bearer ${await APLStorage.get("token")}`,
            },
          }
        );

        const oldConfig: {
          general: {
            discordIntegration: boolean;
          };
          appearance: {
            glow: boolean;
          };
          outputOptions: OutputOptions;
        } = JSON.parse(readFileSync(configPath).toString());

        const localConfig: APLLocalOptions = {
          general: {
            discordIntegration: oldConfig.general.discordIntegration,
          },
          appearance: {
            glow: oldConfig.appearance.glow,
          },
          outputOptions: {
            outputFile: {
              path: oldConfig.outputOptions.outputFile.path,
              name: oldConfig.outputOptions.outputFile.name,
              extension: oldConfig.outputOptions.outputFile.extension,
            },
            outputQuality: oldConfig.outputOptions.outputQuality,
          },
        };

        APLStorage.set("localConfig", {
          ...localConfig,
        });

        return res.status == 200;
      } catch (e) {
        console.log(e);
        return false;
      }
    });
  });
}
