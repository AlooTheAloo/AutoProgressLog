import { ipcMain } from "electron"
import { TogglAccount } from "../../../apl-backend/entry/FindAccounts"
import { Tags, Toggl } from 'toggl-track';





const config:any = {}

export function setupListeners() {

    ipcMain.handle("toggl-api-key-set", (event: any, arg: any) => {
        config.toggl_api_key = arg;
    })

    ipcMain.handle("toggl-account-get", async (event: any, arg: any) => {
        const me = await new Toggl({
            auth: {
                token: config.toggl_api_key
            },
        }).me.get();
        
        console.log(me);
        if(typeof me !== "object"){
            return undefined;
        }

        return {
            id: me.id,
            name: me.fullname,
            pfp_url: me.image_url,
            api_token: config.toggl_api_key
        } as TogglAccount

    })
}