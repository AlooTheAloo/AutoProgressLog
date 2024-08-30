import { ipcMain } from "electron"
import { TogglAccount } from "../../../apl-backend/entry/FindAccounts"
import { Tags, Toggl } from 'toggl-track';
import { ankiIntegration, ServerOptions } from "../../../apl-backend/types/options";




let account:TogglAccount = undefined;
const config:any = {}


export function setAnkiIntegration(anki:ankiIntegration){
    config.anki = anki;
}

export function setupListeners() {

    ipcMain.handle("toggl-api-key-set", (event: any, arg: any) => {
        config.toggl_api_key = arg;
    })

    ipcMain.handle("set-server-options", (event: any, arg: ServerOptions) => {
        config.server_options = arg;
    })
    

    ipcMain.handle("toggl-account-get", async (event: any, arg: any) => {

        if(account !== undefined){
            return account;
        }

        const me = await new Toggl({
            auth: {
                token: config.toggl_api_key
            },
        }).me.get();
        
        if(typeof me !== "object"){
            return undefined;
        }

        account = {
            id: me.id,
            name: me.fullname,
            pfp_url: me.image_url,
            api_token: config.toggl_api_key
        } as TogglAccount

        return account;
    })
}