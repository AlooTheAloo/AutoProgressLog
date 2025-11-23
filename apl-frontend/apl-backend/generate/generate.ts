import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import path from "path";
import { fileURLToPath } from "url";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(duration);
dayjs.extend(advancedFormat);

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export let isGenerating = false;

import { EdenClient } from "../../electron/main/Electron-Backend/api/ApiManager";
import { APLStorage } from "../../electron/main/Electron-Backend/util/auth";

import { runSync } from "./sync";

// TODO : make API call to server
export async function runGeneration() {
  isGenerating = true;
  try {
    const token = await APLStorage.get("token");
    const { data, error } = await EdenClient.user.report.post({}, {
        headers: { authorization: `Bearer ${token}` }
    });
    if (error) {
      console.error("Error generating report:", error);
      return { error: "Failed to generate report" };
    }
    const res = await runSync();
    if (!res) return { error: "Failed to sync after generation" };
    return res;
  } catch (e) {
    console.error(e);
    return { error: "Exception during generation" };
  } finally {
    isGenerating = false;
  }
}
