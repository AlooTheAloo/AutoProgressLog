import { ipcMain, Notification } from "electron";
import { getConfig } from "../../../apl-backend/Helpers/getConfig";
import { appUpgrade } from "../../../apl-backend/entry/upgrade";
import { CacheManager } from "../../../apl-backend/Helpers/cache";
import { shell } from "electron";
import {
  hasPerms,
  macOSRequireNotification,
  macOSRequirePerms,
} from "../../../apl-backend/Helpers/readWindows";
import { win } from "..";

export function routeListeners() {
  ipcMain.handle("request-permissions", async (event, args) => {
    macOSRequirePerms();
  });

  ipcMain.handle("find-next-page-permissions", async (event, args) => {
    if (process.platform == "darwin") {
      const perms = await hasPerms();
      if (perms) {
        return "/setup/client-server-selection";
      } else {
        return "/setup/macos-permissions";
      }
    } else {
      return "/setup/client-server-selection";
    }
  });

  ipcMain.handle("PageSelect", (event, args) => {
    if (getConfig() === null) {
      if (process.platform === "darwin") {
        macOSRequireNotification();
      }
      win?.webContents.send("is-setup-complete", false);
      return "/setup/index";
    } else {
      const ver = CacheManager.verifyVersion();
      if (!ver) {
        appUpgrade(CacheManager.get(false));
      }
      win?.webContents.send("is-setup-complete", true);
      return "/app/dashboard";
    }
  });
}
