import fs from "fs";
import os from "os";
import path from "path";

const fsExistsSync = function (file: string) {
  try {
    fs.accessSync(file);
    return true;
  } catch (ignore) {
    return false;
  }
};

const osType =
  process.platform === "darwin"
    ? "macOS"
    : process.platform === "win32"
      ? "windows"
      : "linux";
export const variations = {
  CHROME: 0,
  CHROME_CANARY: 1,
  CHROMIUM: 2,
};
// Source: https://chromium.googlesource.com/chromium/src/+/HEAD/docs/user_data_dir.md
const locations = {
  macOS: [
    `${os.homedir()}/Library/Application Support/Google/Chrome`,
    `${os.homedir()}/Library/Application Support/Google/Chrome Canary`,
    `${os.homedir()}/Library/Application Support/Chromium`,
  ],
  windows: [
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data`,
    `${process.env.LOCALAPPDATA}\\Google\\Chrome SxS\\User Data`,
    `${process.env.LOCALAPPDATA}\\Chromium\\User Data`,
  ],
  linux: [
    `${os.homedir()}/.config/google-chrome`,
    `${os.homedir()}/.config/google-chrome-beta`,
    `${os.homedir()}/.config/chromium`,
  ],
};

export const ListProfiles = function (variant = variations.CHROME) {
  return locations[osType]
    .filter((f) => fsExistsSync(f))
    .map((variant) => {
      return fs
        .readdirSync(variant)
        .filter(
          (f) =>
            f !== "System Profile" &&
            fsExistsSync(path.join(variant, f, "Preferences")),
        )
        .map((p) => {
          let profileInfo = JSON.parse(
            fs.readFileSync(path.join(variant, p, "Preferences")).toString(),
          );
          return {
            displayName: profileInfo.profile.name,
            profileDirName: p,
            profileDirPath: path.join(variant, p),
            profilePictureUrl:
              profileInfo.profile.gaia_info_picture_url || null,
          };
        });
    })
    .flat();
};
