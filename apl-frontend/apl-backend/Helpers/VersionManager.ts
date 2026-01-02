import fs from "fs";
import { SemVer } from "semver";
import { appVersion } from "../consts/versioning.js";
import { cache_location } from "./getConfig.js";
import { APLStorage } from "../../electron/main/Electron-Backend/util/auth.js";
import { existsSync } from "fs";
export class VersionManager {
  static setVersion = async (version: string) => {
    console.log("Setting version to " + version);
    // await APLStorage.set("version", version);
  };

  static SemVer = async () => {
    return new SemVer((await this.getVersion()) ?? "0.0.0");
  };

  static verifyVersion = async () => {
    console.log("Does this exist yet? " + (await this.exists()));
    if (existsSync(cache_location)) return false; // Before v2
    if(!(await this.exists())) return true; // newly installed
    return (await this.SemVer()).compare(appVersion) == 0;
  };

  static exists = async () => {
    return (await APLStorage.get("version")) != null;
  }

  static init = () => {
    console.log("Initializing version manager");
    this.setVersion(appVersion);
  };

  static getVersion = async (): Promise<string> => {
    return (await APLStorage.get<string>("version")) ?? "0.0.0";
  };
}
