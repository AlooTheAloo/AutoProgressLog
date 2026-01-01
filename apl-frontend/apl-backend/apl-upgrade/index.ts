import { win } from "../../../apl-frontend/electron/main";
import { buildContextMenu } from "../../../apl-frontend/electron/main/Electron-Backend/appBackend";
import { Logger } from "../Helpers/Log";
import { VersionManager } from "../Helpers/VersionManager";
import upgrade_2_0_0 from "./Versions/2.0.0";

export let upgrading = false;

export async function upgrade_schema(version_current: string): Promise<void> {
  upgrading = true;
  win?.webContents.send("set-sidebar-state", false);
  buildContextMenu();
  await launchUpgrade("2.0.0", upgrade_2_0_0);
  upgrading = false;
  win?.webContents.send("set-sidebar-state", true);
  win?.webContents.send("update-complete");
  buildContextMenu();
  return;
}

export async function launchUpgrade(
  version_target: string,
  upgradeFunc: (...params: any[]) => Promise<any>
) {
  win?.webContents.send(
    "update-update-message",
    `Upgrading to ${version_target}`
  );
  await upgradeFunc();
  Logger.log("Upgraded to " + version_target, "Upgrade");
  if (!VersionManager.exists()) VersionManager.init();
  VersionManager.setVersion(version_target);
}
