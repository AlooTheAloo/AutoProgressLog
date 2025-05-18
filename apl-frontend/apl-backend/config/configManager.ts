import { writeFileSync } from "fs";
import { configPath, getConfig, updateConfig } from "../Helpers/getConfig";
import { onConfigChange } from "../../electron/main/Electron-Backend/settingsListeners";

export function setConfig(config: any) {
  const oldConfig = getConfig();
  writeFileSync(configPath, JSON.stringify(config));
  updateConfig();
  onConfigChange.emit("config-change", oldConfig, config);
  return getConfig();
}
