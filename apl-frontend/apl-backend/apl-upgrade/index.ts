import { win } from "../../electron/main";
import { CacheManager } from "../Helpers/cache";
import upgrade_1_0_2 from "./Versions/1.0.2";

export async function upgrade_schema(version_current: string): Promise<void> {
  console.log("current version is " + version_current);
  await launchUpgrade("1.0.2", upgrade_1_0_2);
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
