import { LaunchAnki } from "../config/configAnkiIntegration";
import { GetLastEntry } from "../Helpers/DataBase/SearchDB";
import { getConfig } from "../Helpers/getConfig";
import { getTimeEntries } from "../toggl/toggl-service";

export async function runSync(){    
    // Anki stuff
    await LaunchAnki(getConfig().anki.ankiIntegration);
    const startSync = await GetLastEntry();
    console.log(startSync);

    // Toggl stuff
    getTimeEntries(startSync.generationTime);

    


}


