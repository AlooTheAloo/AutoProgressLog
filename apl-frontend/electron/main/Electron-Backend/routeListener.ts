import { ipcMain } from "electron";
import { win } from "..";
import { APLStorage } from "./util/auth";
import { VersionManager } from "../../../apl-backend/Helpers/VersionManager";

export function routeListeners() {
  ipcMain.handle("PageSelect", async (event, args) => {
    if ((await APLStorage.get("setupComplete")) === true) {
      const ver = await VersionManager.verifyVersion();
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
