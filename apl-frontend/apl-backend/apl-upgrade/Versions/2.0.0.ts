import { win } from "../../../../apl-frontend/electron/main";
import upgrade_1_0_2 from "./1.0.2";
import { SemVer } from "semver";
import { CacheManager } from "../../Helpers/cache";
import { cache_location } from "../../Helpers/getConfig";
import { existsSync, rmSync } from "fs";
import { ipcMain } from "electron";
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
    ipcMain.handleOnce("update-2_0_0_done", () => {
      res();
      rmSync(cache_location);
    });
  });
}
