import { writeFileSync } from "fs";
import { configPath, getConfig, updateConfig } from "../Helpers/getConfig";
import { onConfigChange } from "../../../apl-frontend/electron/main/Electron-Backend/SettingsListeners";

export async function setConfig(config: any) {
  const oldConfig = await getConfig();
  writeFileSync(configPath, JSON.stringify(config));
  updateConfig();
  onConfigChange.emit("config-change", oldConfig, config);
  return getConfig();
}
