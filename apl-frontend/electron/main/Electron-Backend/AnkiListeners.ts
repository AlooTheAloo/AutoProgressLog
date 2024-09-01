import { dialog, ipcMain } from "electron"
import { win } from "..";
import { ankiIntegration } from "../../../apl-backend/types/options";
import { getSetupAnkiIntegration, setAnkiIntegration } from "./SetupConfigBuilder";
import { getAnkiCardReviewCount, getMatureCards, getRetention } from "../../../apl-backend/anki/db";
import { roundTo } from "round-to";
import { hasPerms } from "../../../apl-backend/Helpers/readWindows";
import { createAnkiIntegration, getAnkiDBPaths, verifyAnkiPaths } from "../../../apl-backend/config/configAnkiIntegration";

export function ankiListeners() {

    ipcMain.handle("anki-read-data", async (event: any, arg: any) => {
        const retention = await getRetention(arg, getSetupAnkiIntegration());
        const matureCards = await getMatureCards(getSetupAnkiIntegration());
        return {
            retentionRate: roundTo(retention, 2),
            matureCardCount: matureCards 
        }
    });

    ipcMain.handle("anki-connect-start", async (event: any, arg: any) => {
        win.webContents.send("anki-connect-message", "Locating Anki Paths");
        const Paths = await getAnkiDBPaths();
        return await connectFromPaths(Paths);
    });


    ipcMain.handle("anki-manual-connect-start", async (event: any, appPath: string, dbPath: string) => {
        const Paths = {
            ankiDB: dbPath,
            ankiPath: appPath
        }
        return await connectFromPaths(Paths);
        
    });

    async function connectFromPaths(Paths:any){
        win.webContents.send("anki-connect-message", "Verifying validity of installation");
        const verified = await verifyAnkiPaths(Paths);
        if(!verified) return false;

        let ankiIntegration:ankiIntegration|false = false;
        if(process.platform == "darwin"){
            ankiIntegration = await macOSAnki(Paths);
        }
        else {
            return await createAnkiIntegration(Paths);
        }

        if(ankiIntegration){
            setAnkiIntegration(ankiIntegration);
        }

        return !!ankiIntegration;
    }



    ipcMain.handle("SelectAppPath", async (event: any, arg: any) => {
        const res = await dialog.showOpenDialog(
            {
                filters: [
                    {
                        name: "Anki App",
                        extensions: ["app", "exe"]
                    }
                ]
            }
        );

        if(res.canceled) return undefined;
        return res.filePaths[0];

    });

    ipcMain.handle("SelectDBPath", async (event: any, arg: any) => {
        const res = (await dialog.showOpenDialog(
            {
                filters: [
                    {
                        name: "Anki Database",
                        extensions: ["anki2"]
                    }
                ]
            }
        ));    

        if(res.canceled) return undefined;
        return res.filePaths[0];

    });
}

async function macOSAnki(paths:any){
    win.webContents.send("anki-connect-message", "Verifying permissions");        
    const perms = await hasPerms();
    if(perms){
        win.webContents.send("anki-connect-message", "Launching anki");
        return await createAnkiIntegration(paths);
    }
    else {
        return false;
    }
}