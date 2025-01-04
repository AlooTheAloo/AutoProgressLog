import { runGeneration } from "../../../../apl-backend/generate/generate";
import { setSyncing } from "../../../../apl-backend/generate/sync";
import { getConfig } from "../../../../apl-backend/Helpers/getConfig";
import { deleteAllListeners, listenForTime } from "../../../../apl-backend/Helpers/timer";
import { runChecks } from "../DashboardListeners";

export async function createAutoReport() {
    const config = getConfig();

    if(!config.general.autogen.enabled) // If autogen is disabled, don't do anything
        return;
    
    deleteAllListeners();
    listenForTime(config.general.autogen.options.generationTime, async () => {
        if(await runChecks()){
            setSyncing(true);
            return await runGeneration();
        }
    })

}