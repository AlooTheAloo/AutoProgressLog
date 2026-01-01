import { ipcMain } from "electron";
import { win } from "..";
import { APLStorage } from "./util/auth";
import { VersionManager } from "../../../apl-backend/Helpers/VersionManager";

export function routeListeners() {
  ipcMain.handle("PageSelect", async (event, args) => {
    const ver = await VersionManager.verifyVersion();

    const setupComplete = await APLStorage.get("setupComplete");
    console.log("Setup Complete", setupComplete == true);
    if (ver == false) {
      console.log("Version is not verified");
      return "/update-app";
    }
    win?.webContents.send("is-setup-complete", setupComplete);
    console.log(
      "Returning ",
      setupComplete == true ? "/app/dashboard" : "/setup/index"
    );
    return setupComplete == true ? "/app/dashboard" : "/setup/index";
  });
}
