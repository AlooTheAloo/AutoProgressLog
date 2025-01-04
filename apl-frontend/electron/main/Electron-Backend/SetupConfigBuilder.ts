import { app, dialog, ipcMain } from "electron"
import { TogglAccount } from "../../../apl-backend/entry/FindAccounts"
import { Tags, Toggl } from 'toggl-track';
import { ankiIntegration, ankiOptions, options, RetentionMode, ServerOptions } from "../../../apl-backend/types/options";
import { writeFileSync } from "fs";
import { configPath, syncDataPath } from "../../../apl-backend/Helpers/getConfig";
import sqlite3 from "sqlite3";
import { CreateDB } from "../../../apl-backend/Helpers/DataBase/CreateDB";
import { win } from "..";

let account:TogglAccount = undefined;
const config:Partial<options> = {}

export function setAnkiIntegration(anki:ankiIntegration|false){
    if(!anki){
        config.anki = {
            enabled: false
        }
        return;
    }

    config.anki = {
        enabled: true,
        ankiIntegration: anki,
        options: { 
            trackedDecks: [],
            retentionMode: "true_retention"
        }
    }
}

export function getSetupAnkiIntegration():ankiIntegration{
    return config.anki.ankiIntegration;
}

export function getSetupAnki():ankiOptions{
    return config.anki;
}


export function setupListeners() {

    ipcMain.handle("anki-deck-select", async (event: any, arg: number[]) => {        
        config.anki.options.trackedDecks = arg;
    });

    ipcMain.handle("SaveConfig", (event: any, arg: any) => {
        writeFileSync(configPath, JSON.stringify(config));
        let db = new sqlite3.Database(syncDataPath, 
            sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
            (err) => { 
                CreateDB(db);
            });
        
    })

    ipcMain.handle("SetOutputFile", (event: any, arg: any) => {
        config.outputOptions = {
            outputFile: arg,
            outputQuality: 3
        }
    })

    ipcMain.handle("GetPath", (evt, pathType) => {
        return app.getPath(pathType);
    })

    ipcMain.handle("OpenPathDialog", (evt, openAt) => {
        return dialog.showOpenDialogSync(win, {
            properties: ["openDirectory", "createDirectory"],
            defaultPath: openAt
        })
    })

    

    ipcMain.handle("SetDeviceType", (event: any, arg: boolean) => {
        config.general.autogen.enabled = arg;

        if(!config.general.autogen.enabled){
            config.general.autogen.options = undefined;
        }
    })

    ipcMain.handle("toggl-api-key-set", async (event: any, arg: any) => {
        const me = await new Toggl({
            auth: {
                token: arg
            },
        }).me.get();
        
        config.toggl = {
            togglToken: arg,
        }
        config.account = {
            userName: me.fullname
        }
    })

    ipcMain.handle("set-server-options", (event: any, arg: ServerOptions) => {
        config.general.autogen.options = arg;
    })

    ipcMain.handle("SetRetentionMode", (event: any, arg: RetentionMode) => {
        config.anki.options.retentionMode = arg;
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