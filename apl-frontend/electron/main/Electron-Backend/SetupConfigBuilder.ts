import { ipcMain } from "electron"
import { TogglAccount } from "../../../apl-backend/entry/FindAccounts"
import { Tags, Toggl } from 'toggl-track';
import { ankiIntegration, options, RetentionMode, ServerOptions, TimeInterval } from "../../../apl-backend/types/options";
import { writeFileSync } from "fs";
import { configPath } from "../../../apl-backend/Helpers/getConfig";

let account:TogglAccount = undefined;
const config:Partial<options> = {}

export function setAnkiIntegration(anki:ankiIntegration){
    config.anki = {
        ankiIntegration: anki,
    }
}

export function getSetupAnkiIntegration():ankiIntegration{
    return config.anki.ankiIntegration;
}


export function setupListeners() {

    ipcMain.handle("SaveConfig", (event: any, arg: any) => {
        console.log(configPath)
        writeFileSync(configPath, JSON.stringify(config));
    })

    ipcMain.handle("SetOutputFile", (event: any, arg: any) => {
        config.outputOptions = {
            outputFile: arg
        }
    })

    ipcMain.handle("SetDeviceType", (event: any, arg: "Server" | "Client") => {
        config.type = arg;

        if(config.type == "Client"){
            config.serverOptions = undefined;
        }
    })

    ipcMain.handle("toggl-api-key-set", (event: any, arg: any) => {
        config.toggl = {
            togglToken: arg
        }
    })

    ipcMain.handle("set-server-options", (event: any, arg: ServerOptions) => {
        config.serverOptions = arg;
        console.log(JSON.stringify(config))
    })

    ipcMain.handle("SetRetentionMode", (event: any, arg: RetentionMode) => {
        config.anki.options = {
            retentionMode: arg
        }
    })

    ipcMain.handle("toggl-account-get", async (event: any, arg: any) => {

        if(account !== undefined){
            return account;
        }

        const me = await new Toggl({
            auth: {
                token: config.toggl.togglToken
            },
        }).me.get();
        
        if(typeof me !== "object"){
            return undefined;
        }

        account = {
            id: me.id,
            name: me.fullname,
            pfp_url: me.image_url,
            api_token: config.toggl.togglToken
        } as TogglAccount

        return account;
    })
}