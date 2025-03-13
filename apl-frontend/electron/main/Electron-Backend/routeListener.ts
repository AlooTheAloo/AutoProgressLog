import { ipcMain } from "electron";
import { getConfig } from "../../../apl-backend/Helpers/getConfig";
import { CacheManager } from "../../../apl-backend/Helpers/cache";
import { win } from "..";

export function routeListeners() {
  ipcMain.handle("PageSelect", (event, args) => {
    if (getConfig() === null) {
      win?.webContents.send("is-setup-complete", false);
      return "/setup/index";
    } else {
      const ver = CacheManager.verifyVersion();
      if (!ver) {
        return "/update-app";
      }
      console.log("we're so happy here :3");
      win?.webContents.send("is-setup-complete", true);
      return "/app/dashboard";
    }
  });
}
