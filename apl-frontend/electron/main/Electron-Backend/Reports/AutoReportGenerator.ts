import { runGeneration } from "../../../../apl-backend/generate/generate";
import { setSyncing } from "../../../../apl-backend/generate/sync";
import { getConfig } from "../../../../apl-backend/Helpers/getConfig";
import { runChecks } from "../dashboardListeners";
import nodeScheduler, { Job } from "node-schedule";

let currentJob: Job = null;

export async function createAutoReport() {
  console.log("Creating job");
  if (currentJob != null) {
    currentJob.cancel();
  }

  const config = getConfig();
  if (!config.general.autogen.enabled)
    // If autogen is disabled, don't do anything
    return;

  currentJob = nodeScheduler.scheduleJob(
    `0 ${config.general.autogen.options.generationTime.minutes} ${config.general.autogen.options.generationTime.hours} * * *`,
    async () => {
      console.log("Starting job");
      if (await runChecks()) {
        setSyncing(true);
        return await runGeneration();
      }
    }
  );

  console.log(
    "Scheduled job as " +
      `0 ${config.general.autogen.options.generationTime.minutes} ${config.general.autogen.options.generationTime.hours} * * *`
  );

  console.log("Current job + " + currentJob);
}
