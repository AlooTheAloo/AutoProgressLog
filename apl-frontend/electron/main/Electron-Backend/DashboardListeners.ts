import { ipcMain } from "electron";
import { runGeneration } from "../../../apl-backend/generate/generate";
import sqlite3 from "sqlite3";
import { CreateDB } from "../../../apl-backend/Helpers/DataBase/CreateDB";
import { getConfig, syncDataPath } from "../../../apl-backend/Helpers/getConfig";
import { runSync } from "../../../apl-backend/generate/sync";
import { CacheManager } from "../../../apl-backend/Helpers/cache";
import { DashboardDTO } from "./types/Dashboard";
import { GetImmersionSourcesSince, GetImmersionTimeSince, GetLastEntry } from "../../../apl-backend/Helpers/DataBase/SearchDB";
import dayjs from "dayjs";

export function DashboardListeners() {
    ipcMain.handle("GenerateReport", async (event: any) => {
        
        runGeneration();
    });

    ipcMain.handle("Sync", async (event: any) => {
        return await runSync();
    });

    ipcMain.handle("Get-Dashboard-DTO", async (event: any) => {
        return await CreateDTO();
    })

}

export async function CreateDTO(){

    const lastEntry = await GetLastEntry();
    const lastReport = await CacheManager.peek();

    console.log(lastEntry);
    const DTO:DashboardDTO = {
        userName: getConfig().toggl.userName,
        lastSyncTime: dayjs(lastEntry.generationTime).toISOString(),
        lastReportTime: lastReport.generationTime,
        immersionSinceLastReport: await GetImmersionTimeSince(dayjs(lastReport.generationTime)),
        totalImmersion: lastEntry.totalSeconds,
        retentionRate: lastEntry.retention,
        totalReviews: lastEntry.totalCardsStudied,
        immersionSources: await GetImmersionSourcesSince(dayjs().subtract(1, "month")),
        monthlyScore: 0
    }

    return DTO;
}

