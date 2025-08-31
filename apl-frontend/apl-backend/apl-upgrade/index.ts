import { win } from "../../../apl-frontend/electron/main";
import { buildContextMenu } from "../../../apl-frontend/electron/main/Electron-Backend/appBackend";
import { CacheManager } from "../Helpers/cache";
import { Logger } from "../Helpers/Log";
import upgrade_1_0_2 from "./Versions/1.0.2";
import upgrade_2_0_0 from "./Versions/2.0.0";

export let upgrading = false;

export async function upgrade_schema(version_current: string): Promise<void> {
  upgrading = true;
  buildContextMenu();
  await launchUpgrade("2.0.0", upgrade_2_0_0);
  upgrading = false;
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
  CacheManager.setVersion(version_target);
}
