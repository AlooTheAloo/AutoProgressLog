import { writeFileSync } from "fs";
import { configPath, getConfig, updateConfig } from "../Helpers/getConfig";
import { onConfigChange } from "../../../apl-frontend/electron/main/Electron-Backend/SettingsListeners";
import { APLStorage } from "../../electron/main/Electron-Backend/util/auth";
import { Options } from "../types/options";

export async function setConfig(config: Options) {
  const oldConfig = await getConfig();
  APLStorage.set("serverConfig", config.serverOptions);
  APLStorage.set("localConfig", config.localOptions);
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  updateConfig();
  onConfigChange.emit("config-change", oldConfig, config);
  return getConfig();
}
