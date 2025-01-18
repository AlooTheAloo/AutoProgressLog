
import { runGeneration } from "../../../../apl-backend/generate/generate";
import { setSyncing } from "../../../../apl-backend/generate/sync";
import { getConfig } from "../../../../apl-backend/Helpers/getConfig";
import nodeScheduler, { Job } from "node-schedule"
import { runChecks } from "../DashboardListeners";
import { onConfigChange } from "../SettingsListeners";
import { Options } from "../../../../apl-backend/types/options";

let currentJob:Job|null = null; 

export async function createAutoReport() {
    createJob();

    onConfigChange.on("config-change", async (oldConfig:Options, newConfig:Options) => {
        if(oldConfig.general.autogen != newConfig.general.autogen){
            if(newConfig.general.autogen.enabled){
                await createJob();
            }
            else {
                currentJob?.cancel();
                currentJob = null;
            }
        }
    })


}

async function createJob(){
    const config = getConfig();
    if(config == undefined) return;

    if(!config.general.autogen.enabled) // If autogen is disabled, don't do anything
        return;
    
    if(currentJob != null){
        currentJob.cancel();
    }

    currentJob = nodeScheduler.scheduleJob(`0 ${config.general.autogen.options?.generationTime.minutes} ${config.general.autogen.options?.generationTime.hours} * * *`, async () => {
        if(await runChecks()){
            setSyncing(true);
            return await runGeneration();
        }
    })
}