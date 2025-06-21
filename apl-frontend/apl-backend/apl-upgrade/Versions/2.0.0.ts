import { semver } from "bun";
import { win } from "../../../electron/main";
import upgrade_1_0_2 from "./1.0.2";
import { SemVer } from "semver";
import { CacheManager } from "../../Helpers/cache";

export default async function upgrade_2_0_0() {
  if (new SemVer(CacheManager.get().version).compare("2.0.0") > -1) {
    return;
  }
  upgrade_1_0_2();
  console.log("Upgrading to 2.0.0");
  await new Promise((res, req) => {
    win?.webContents.send("2_0_0_upgrade");
  });
}
