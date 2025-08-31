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

// TODO : make API call to server
export async function runGeneration() {}
