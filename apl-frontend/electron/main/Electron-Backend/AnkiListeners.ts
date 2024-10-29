import { dialog, ipcMain } from "electron"
import { win } from "..";
import { ankiIntegration } from "../../../apl-backend/types/options";
import { getSetupAnkiIntegration, setAnkiIntegration } from "./SetupConfigBuilder";
import { getAnkiCardReviewCount, getMatureCards, getRetention } from "../../../apl-backend/anki/db";
import { roundTo } from "round-to";
import { hasPerms } from "../../../apl-backend/Helpers/readWindows";
import { ankiPaths, createAnkiIntegration, getAnkiDBPaths, getAnkiProfileCount, getAnkiProfiles, getDecks, getDecksCards, getProfileDecks, sleep, verifyAnkiPaths } from "../../../apl-backend/config/configAnkiIntegration";
import path, { basename, join } from "path";

export function ankiListeners() {

    ipcMain.handle("anki-read-data", async (event: any, arg: any) => {
        const int = getSetupAnkiIntegration() 
        const retention = await getRetention(arg, int);
        const matureCards = await getMatureCards(int);
        return {
            retentionRate: roundTo(retention, 2),
            matureCardCount: matureCards 
        }
    });

    ipcMain.handle("SkipAnki", async (event: any, arg: any) => {
        setAnkiIntegration(false);
    });
    
    ipcMain.handle("anki-decks-list", async (event: any, arg: any) => {
        const decksCards = await getDecksCards();
        return decksCards;
    });
    


    ipcMain.handle("anki-profile-select", async (event: any, profile: string) => {
        const Paths = await getAnkiDBPaths(profile);
        return await connectFromPaths(Paths);
    });

    ipcMain.handle("anki-connect-start", async (event: any, arg: any) => {
        win.webContents.send("anki-connect-message", "Locating Anki Paths");
        await sleep(500)
        const profileCount = await getAnkiProfileCount();

        if(profileCount == 0)
        {
            return false;
        }
        else if(profileCount > 1)
        {
            const profiles = await getProfileDecks();
            win.webContents.send("anki-multiple-profiles-detected", profiles);
            return null;
        }
        else 
        {
            const Paths = await getAnkiDBPaths((await getAnkiProfiles())[0].name);
            return await connectFromPaths(Paths);
        }
    });


    ipcMain.handle("anki-manual-connect-start", async (event: any, appPath: string, dbPath: string) => {
        const Paths:ankiPaths = {
            ankiDB: dbPath,
            ankiPath: appPath,
            profile: path.basename(path.join(dbPath, ".."))
        }
        return await connectFromPaths(Paths);
        
    });

    async function connectFromPaths(Paths:ankiPaths){
        win.webContents.send("anki-connect-message", "Verifying validity of installation");
        const verified = await verifyAnkiPaths(Paths);
        if(!verified) return false;

        let ankiIntegration:ankiIntegration|false = false;
        if(process.platform == "darwin"){
            ankiIntegration = await macOSAnki(Paths);
        }
        else {
            ankiIntegration = await createAnkiIntegration(Paths);
            if(ankiIntegration != false){
                setAnkiIntegration(ankiIntegration);
            }
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