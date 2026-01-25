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
import { SocketClient } from "../../../electron/main/Electron-Backend/Socket/SocketClient";
import { createListeners } from "../../../electron/main/Electron-Backend/RPC/RPCHandler";
import { APLLocalOptions, OutputOptions } from "../../types/options";

let migrated = false;

export default async function upgrade_2_0_0() {
  console.log("Upgrading to 2.0.0");
  
  // Run previous upgrade steps to migrate older configs (v1.0.0, v1.0.1)
  // This ensures the config has the required `appearance` property
  await upgrade_1_0_2();
  
  // If cache file doesn't exist, there's nothing to migrate - skip this upgrade
  if (!existsSync(cache_location)) {
    return;
  }

  // If already at version 2.0.0+, skip this upgrade
  if (new SemVer(CacheManager.get().version ?? "0.0.0").compare("2.0.0") > -1) {
    return;
  }
  await new Promise<void>((res, req) => {
    console.log("Sending 2_0_0_upgrade");
    // Add a small delay to ensure the frontend event listener is ready
    // This fixes a timing issue where 1.0.0 users get stuck on the update screen
    setTimeout(() => {
      win?.webContents.send("2_0_0_upgrade");
    }, 100);
    ipcMain.handleOnce("update-2_0_0_done", async () => {
      
      console.log("Setup complete true 1");
      await APLStorage.set("setupComplete", true);
      [cache_location, configPath, syncDataPath].forEach((x) => rmSync(x));
      await new SocketClient().init({
        token: (await APLStorage.get("token")) as string,
      });
      await createListeners();
      win?.webContents.send("is-setup-complete", true);
      res();
    });
    ipcMain.handle("legacy-migration", async () => {
      console.log("migrated is " + migrated);
      if(migrated) return -1;
      migrated = true;
      console.log("migrating...");
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
          appearance?: {
            glow: boolean;
          };
          appreance?: {
            glow: boolean;
          };
          outputOptions: OutputOptions;
        } = JSON.parse(readFileSync(configPath).toString());

        console.log(JSON.stringify(oldConfig));

        const localConfig: APLLocalOptions = {
          general: {
            discordIntegration: oldConfig.general.discordIntegration,
          },
          appearance: {
            glow: oldConfig.appearance?.glow ?? oldConfig.appreance?.glow ?? true,
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

        console.log("res : " + JSON.stringify(res));
        migrated = false;

        return res.status == 200;
      } catch (e) {
        migrated = false;
        console.log(e);
        return false;
      }
    });
  });
}
