import { ipcMain } from "electron"
import { createAnkiIntegration, getAnkiDBPaths, verifyAnkiPaths } from "../../../apl-backend/config/configAnkiIntegration";
import { win } from "..";
import { hasPerms, macOSRequirePerms } from "../../../apl-backend/entry/tests";
import { ankiIntegration } from "../../../apl-backend/types/options";
import { setAnkiIntegration } from "./SetupConfigBuilder";

export function ankiListeners() {
    ipcMain.handle("anki-connect-start", async (event: any, arg: any) => {
        win.webContents.send("anki-connect-message", "Locating Anki Paths");
        const Paths = await getAnkiDBPaths();

        win.webContents.send("anki-connect-message", "Verifying validity of installation");
        const verified = await verifyAnkiPaths(Paths);

        let ankiIntegration:ankiIntegration|false = false;
        if(process.platform == "darwin"){
            ankiIntegration = await macOSAnki(Paths);
        }
        else {

        }

        if(ankiIntegration){
            setAnkiIntegration(ankiIntegration);
        }

        return ankiIntegration

    });
}

async function macOSAnki(paths:any){
    win.webContents.send("anki-connect-message", "Verifying permissions");        
    const perms = await hasPerms();
    console.log("has perms is " + perms);
    if(perms){
        win.webContents.send("anki-connect-message", "Launching anki");
        return await createAnkiIntegration(paths);
    }
    else {
        return false;
    }
}