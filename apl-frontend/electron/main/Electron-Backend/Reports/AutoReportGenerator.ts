
import { runGeneration } from "../../../../apl-backend/generate/generate";
import { setSyncing } from "../../../../apl-backend/generate/sync";
import { getConfig } from "../../../../apl-backend/Helpers/getConfig";
import nodeScheduler, { Job } from "node-schedule"
import { runChecks } from "../DashboardListeners";

let currentJob:Job|null = null; 

export async function createAutoReport() {

    if(currentJob != null){
        currentJob.cancel();
    }

    const config = getConfig();
    if(config == undefined) return;

    if(!config.general.autogen.enabled) // If autogen is disabled, don't do anything
        return;
    
    currentJob = nodeScheduler.scheduleJob(`0 ${config.general.autogen.options?.generationTime.minutes} ${config.general.autogen.options?.generationTime.hours} * * *`, async () => {
        console.log("Starting job");
        if(await runChecks()){
            setSyncing(true);
            return await runGeneration();
        }
    })


}