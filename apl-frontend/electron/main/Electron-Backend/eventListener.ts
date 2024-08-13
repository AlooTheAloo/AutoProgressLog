import { ipcMain } from "electron";
import { getConfig } from "../../../apl-backend/Helpers/getConfig";
import { RouteLocationRaw } from "vue-router";
import { appUpgrade } from "../../../apl-backend/entry/upgrade";
import { CacheManager } from "../../../apl-backend/Helpers/cache";


export function routeListeners(){
    ipcMain.handle("PageSelect", (event, args) => {
        if(getConfig() != null){
            return "/setup/index";
        }
        else{
            const ver = CacheManager.verifyVersion();
            if(!ver){
                appUpgrade(CacheManager.get(false));
            }
             return "page2";
        }
     });
}
