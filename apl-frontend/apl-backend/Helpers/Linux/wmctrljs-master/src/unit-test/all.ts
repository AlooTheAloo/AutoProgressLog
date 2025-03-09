import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const forbbidenFiles = ["all.js", "utils.js"];

export const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const files = fs.readdirSync(__dirname).filter((file) => {
    if (/^.*\.js$/.test(file) && !forbbidenFiles.includes(file)) return true;
    return false;
  });
  for (const file of files) {
    await require(`./${file}`).run;
  }
})();
