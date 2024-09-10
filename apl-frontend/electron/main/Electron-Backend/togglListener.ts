import { ipcMain } from "electron";
import { getAccounts } from "../../../apl-backend/entry/FindAccounts";

export function togglListeners(){
    ipcMain.handle("Toggl-Connect", async (event, args) => {
        return await getAccounts();
    });
}