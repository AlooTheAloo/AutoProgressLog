import { ipcMain } from "electron";
import { win } from "..";
import { APLStorage } from "./util/auth";
import { VersionManager } from "../../../apl-backend/Helpers/VersionManager";

export function routeListeners() {
  ipcMain.handle("PageSelect", async (event, args) => {
    const ver = await VersionManager.verifyVersion();
    const setupComplete = await APLStorage.get("setupComplete");
    if (!ver) {
      return "/update-app";
    }
    win?.webContents.send("is-setup-complete", setupComplete);
    return setupComplete ? "/app/dashboard" : "/setup/index";
  });
}
