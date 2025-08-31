import fs from "fs";
import { SemVer } from "semver";
import { appVersion } from "../consts/versioning.js";
import { cache_location } from "./getConfig.js";
import { APLStorage } from "../../electron/main/Electron-Backend/util/auth.js";
import { existsSync } from "fs";
export class VersionManager {
  static setVersion = async (version: string) => {
    await APLStorage.set("version", version);
  };

  static SemVer = async () => {
    return new SemVer((await this.getVersion()) ?? "0.0.0");
  };

  static verifyVersion = async () => {
    if (existsSync(cache_location) != null) return false; // Before v2
    return (await this.SemVer()).compare(appVersion) == 0;
  };

  static exists = () => fs.existsSync(cache_location);

  static init = () => {
    this.setVersion(appVersion);
  };

  static getVersion = async (): Promise<string> => {
    return (await APLStorage.get<string>("version")) ?? "0.0.0";
  };
}
