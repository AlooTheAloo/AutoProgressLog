import { runGeneration } from "../../../../apl-backend/generate/generate";
import { setSyncing } from "../../../../apl-backend/generate/sync";
import { getConfig } from "../../../../apl-backend/Helpers/getConfig";
import nodeScheduler, { Job } from "node-schedule";
import { runChecks } from "../dashboardListeners";
import { onConfigChange } from "../settingsListeners";
import { Options } from "../../../../apl-backend/types/options";
import { powerSaveBlocker } from "electron";

let id: number | null = null;
let currentJob: Job | null = null;

export async function createAutoReport() {
  createJob();

  onConfigChange.on(
    "config-change",
    async (oldConfig: Options, newConfig: Options) => {
      if (oldConfig.general.autogen != newConfig.general.autogen) {
        if (newConfig.general.autogen.enabled) {
          await createJob();
        } else {
          currentJob?.cancel();
          currentJob = null;
        }
      }
    }
  );
}

async function createJob() {
  const config = getConfig();
  if (config == undefined) return;

  if (!config.general.autogen.enabled)
    // If autogen is disabled, don't do anything
    return;

  if (currentJob != null) {
    if (id != null) {
      powerSaveBlocker.stop(id);
      id = null;
    }
    currentJob.cancel();
  }

  id = powerSaveBlocker.start("prevent-app-suspension");
  console.log("id is " + id);
  currentJob = nodeScheduler.scheduleJob(
    `0 ${config.general.autogen.options?.generationTime.minutes} ${config.general.autogen.options?.generationTime.hours} * * *`,
    async () => {
      if (await runChecks()) {
        return await runGeneration();
      }
    }
  );
}
