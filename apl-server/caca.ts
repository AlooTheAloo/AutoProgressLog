import { writeFileSync } from "fs";
import { fullSyncTogglData } from "./src/services/toggl/syncService";

(async () => {
  const caca = await fullSyncTogglData(4);
  console.log(caca)
})();
