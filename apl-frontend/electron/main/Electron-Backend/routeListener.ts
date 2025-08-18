import { ipcMain } from "electron";
import { getConfig } from "../../../apl-backend/Helpers/getConfig";
import { CacheManager } from "../../../apl-backend/Helpers/cache";
import { win } from "..";
import { APLStorage } from "./util/auth";

export function routeListeners() {
  ipcMain.handle("PageSelect", async (event, args) => {
    if ((await APLStorage.get("setupComplete")) === true) {
      const ver = CacheManager.verifyVersion();
      if (!ver) {
        return "/update-app";
      }
      win?.webContents.send("is-setup-complete", true);
      return "/app/dashboard";
    } else {
      win?.webContents.send("is-setup-complete", false);
      return "/setup/index";
    }
  });
}
