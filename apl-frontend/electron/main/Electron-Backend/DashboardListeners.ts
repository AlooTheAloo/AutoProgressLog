import { ipcMain } from "electron";
import { runGeneration } from "../../../apl-backend/generate/generate";
import sqlite3 from "sqlite3";
import { CreateDB } from "../../../apl-backend/Helpers/DataBase/CreateDB";
import { syncDataPath } from "../../../apl-backend/Helpers/getConfig";
import { runSync } from "../../../apl-backend/generate/sync";

export function DashboardListeners() {
    ipcMain.handle("GenerateReport", async (event: any) => {
        
        runGeneration();
    });

    ipcMain.handle("Sync", async (event: any) => {
        runSync();
    });
}