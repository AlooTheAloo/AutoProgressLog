import { dialog, ipcMain } from "electron"
import { win } from "..";
import { ankiIntegration, Options } from "../../../apl-backend/types/options";
import { getSetupAnkiIntegration, setAnkiIntegration } from "./SetupConfigBuilder";
import { DeleteAnkiData, getAnkiCardReviewCount, getMatureCards, getRetention, hasSyncEnabled } from "../../../apl-backend/anki/db";
import { roundTo } from "round-to";
import { hasPerms } from "../../../apl-backend/Helpers/readWindows";
import { ankiPaths, createAnkiIntegration, getAnkiDBPaths, getAnkiProfileCount, getAnkiProfiles, getDecks, getDecksCards, getProfileDecks, LaunchAnki, sleep, verifyAnkiPaths } from "../../../apl-backend/config/configAnkiIntegration";
import path, { basename, join } from "path";
import { onConfigChange } from "./SettingsListeners";

export function ankiListeners() {

    ipcMain.handle("test-anki-connection", async (event: any, arg: Options) => {
        const no = {worked: false, decks: []};

        try{
            console.log('1');
            const int = arg.anki.ankiIntegration
            if(int == undefined) return no;
            console.log('2');
            if(arg.anki.ankiIntegration?.profile == undefined) return no;
            console.log('3');
            const hse = await hasSyncEnabled(arg.anki.ankiIntegration?.profile) 
            if(hse == null) return no;
            console.log('4');
            const worked = await LaunchAnki(int);
            if(!worked[0]) return no;
            const retention = await getRetention("true_retention", int);
            if(retention == undefined) return no;
            const matureCards = await getMatureCards(int);
            if(matureCards == undefined) return no;
            const obj = {
                worked: true, 
                decks: await getDecksCards(arg.anki.ankiIntegration?.ankiDB)
            }            
            return obj;
        }
        catch(e){
            return no;
        }
        
    });

    ipcMain.handle("anki-read-data", async (event: any, arg: any) => {
        const int = getSetupAnkiIntegration() 
        if(int == undefined) return undefined;
        const retention = await getRetention(arg, int);
        if(retention == undefined) return undefined;
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
        win?.webContents.send("anki-connect-message", "Locating Anki Paths");
        await sleep(500)
        const profileCount = await getAnkiProfileCount();

        if(profileCount == 0)
        {
            return false;
        }
        else if(profileCount > 1)
        {
            const profiles = await getProfileDecks();
            if(profiles == false) return false;
            win?.webContents.send("anki-multiple-profiles-detected", profiles);
            return null;
        }
        else 
        {
            const Paths = await getAnkiDBPaths((await getAnkiProfiles() ?? [])[0].name);
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
        win?.webContents.send("anki-connect-message", "Verifying validity of installation");
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


    onConfigChange.on("config-change", async (oldConfig:Options, newConfig:Options) => {
        if(oldConfig.anki.enabled && !newConfig.anki.enabled){
            await DeleteAnkiData();
        }
    });

}

async function macOSAnki(paths:any){
    win?.webContents.send("anki-connect-message", "Verifying permissions");        
    const perms = await hasPerms();
    if(perms){
        win?.webContents.send("anki-connect-message", "Launching anki");
        return await createAnkiIntegration(paths);
    }
    else {
        return false;
    }
}