import { ipcMain } from "electron";
import { getConfig } from "../../../apl-backend/Helpers/getConfig";
import { appUpgrade } from "../../../apl-backend/entry/upgrade";
import { CacheManager } from "../../../apl-backend/Helpers/cache";
import { shell } from "electron";
import permissions from "node-mac-permissions";
import { hasPerms } from "../../../apl-backend/Helpers/readWindows";

export function routeListeners(){

    ipcMain.handle("request-permissions", async (event, args) => {
        permissions.askForScreenCaptureAccess();
    });

    ipcMain.handle("find-next-page-permissions", async (event, args) => {
        if(process.platform == "darwin"){
            const perms = await hasPerms();
            if(perms){
                return "/setup/client-server-selection";
            }
            else {
                return "/setup/macos-permissions";
            }
        }
        else {
            return "/setup/client-server-selection";
        }
    });


    ipcMain.handle("PageSelect", (event, args) => {
        if(getConfig() === null){
            return "/setup/index";
        }
        else{
            const ver = CacheManager.verifyVersion();
            if(!ver){
                appUpgrade(CacheManager.get(false));
            }
            
            return "/app/dashboard";
        }
     });

     ipcMain.handle("OpenExternal", (event, args) => {
        shell.openExternal(args);
     });
     
}


