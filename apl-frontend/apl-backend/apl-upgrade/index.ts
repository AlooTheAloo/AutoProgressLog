import { win } from "../../electron/main";
import { CacheManager } from "../Helpers/cache";
import upgrade_1_0_2 from "./Versions/1.0.2";
import upgrade_2_0_0 from "./Versions/2.0.0";

export async function upgrade_schema(version_current: string): Promise<void> {
  await launchUpgrade("2.0.0", upgrade_2_0_0);
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
  console.log("upgraded to " + version_target);
  CacheManager.setVersion(version_target);
}
