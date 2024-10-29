import { ipcMain } from "electron";
import { runGeneration } from "../../../apl-backend/generate/generate";
import sqlite3 from "sqlite3";
import { CreateDB } from "../../../apl-backend/Helpers/DataBase/CreateDB";
import { getConfig, syncDataPath } from "../../../apl-backend/Helpers/getConfig";
import { runSync } from "../../../apl-backend/generate/sync";
import { CacheManager } from "../../../apl-backend/Helpers/cache";
import { DashboardDTO } from "./types/Dashboard";
import { GetImmersionSourcesSince, GetImmersionTimeBetween, GetImmersionTimeSince, GetLastEntry } from "../../../apl-backend/Helpers/DataBase/SearchDB";
import dayjs from "dayjs";
import { roundTo } from "round-to";

export function DashboardListeners() {
    ipcMain.handle("GenerateReport", async (event: any) => {
        return await runGeneration();
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

    const thisMonth = await GetImmersionTimeSince(dayjs().startOf("month"));
    const lastMonth = await GetImmersionTimeBetween(dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month"));

    const DTO:DashboardDTO = {    
        userName: getConfig().toggl.userName,
        lastSyncTime: dayjs(lastEntry.generationTime).toISOString(),
        lastReportTime: lastReport.generationTime,
        ankiDTO: getConfig().anki.enabled ? {
            retentionRate: lastEntry.anki.retention,
            retentionRateDelta: roundTo(roundTo(lastEntry.anki.retention, 2) - roundTo(lastReport.retention, 2), 2),
    
            totalReviews: lastEntry.anki.totalCardsStudied,
            reviewsDelta: lastEntry.anki.totalCardsStudied - lastReport.totalCardsStudied,
        } : undefined,
        immersionDTO: {
            totalImmersion: lastEntry.toggl.totalSeconds,
            immersionSinceLastReport: await GetImmersionTimeSince(dayjs(lastReport.generationTime)),
            monthlyImmersion: thisMonth,
            monthlyImmersionLastMonth: lastMonth,
            immersionSources: await GetImmersionSourcesSince(dayjs().subtract(1, "month")),
        },
        monthlyScore: 0,
    }

    console.log(DTO);
    return DTO;
}

