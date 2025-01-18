import { ipcMain } from "electron";
import { runGeneration } from "../../../apl-backend/generate/generate";
import { getConfig, getSyncProps, syncDataPath } from "../../../apl-backend/Helpers/getConfig";
import { isSyncing, runSync } from "../../../apl-backend/generate/sync";
import { CacheManager } from "../../../apl-backend/Helpers/cache";
import { DashboardDTO } from "./types/Dashboard";
import { GetImmersionSourcesSince, GetImmersionTimeBetween, GetImmersionTimeSince, GetLastEntry, GetSyncCount } from "../../../apl-backend/Helpers/DataBase/SearchDB";
import dayjs from "dayjs";
import { roundTo } from "round-to";
import { checkInternet, notifyNoInternet } from "../../../apl-backend/Helpers/Healthcheck/internetHelper";
import { hasSyncEnabled } from "../../../apl-backend/anki/db";
import { hasPerms, macOSRequirePerms } from "../../../apl-backend/Helpers/readWindows";
import { notifyNoPermissions } from "../../../apl-backend/Helpers/Healthcheck/permHelper";

export function DashboardListeners() {
    ipcMain.handle("isSyncing", async (event: any) => {
        return isSyncing();
    })
    
    ipcMain.handle("GenerateReport", async (event: any) => {
        if(await runChecks()){
            return await runGeneration();
        }
        
    });

    ipcMain.handle("Sync", async (event: any, alternative: boolean) => {
        if(await runChecks()){
            return await runSync(alternative, getSyncProps());
        }
    });

    ipcMain.handle("Get-Dashboard-DTO", async (event: any) => {
        return await CreateDTO();
    })
}

export async function runChecks():Promise<boolean>{
    const start = dayjs();
    const config = getConfig();
    if(!config) return false;
    if(await checkInternet()){

        if(!config.anki.enabled) return true;
        
        // MacOS and sync => we need perms
        if(await hasSyncEnabled(config.anki.ankiIntegration?.profile ?? "") && process.platform == "darwin"){
            if(!(await hasPerms())){
                notifyNoPermissions();
                macOSRequirePerms();
                return false;
            }
        }
        return true;
    }
    else {
        notifyNoInternet()
        return false;
    }
}

function getNextReportTime(){
    const config = getConfig();
    if(!config?.general?.autogen?.enabled) return "";
    const time = config.general.autogen.options.generationTime;
    const now = dayjs();

    // Create a dayjs instance for today with the given time
    let reportTime = now.hour(time.hours).minute(time.minutes).second(0);

    // If the time has already passed today, move to the next day
    if (reportTime.isBefore(now)) {
        reportTime = reportTime.add(1, 'day');
    }

    // Format the time as "MMM D, YYYY at h:mm A"
    return reportTime.format("MMM D, YYYY [at] h:mm A");
}


export async function CreateDTO(){
    const lastEntry = await GetLastEntry();
    const lastReport = await CacheManager.peek();
    const config = getConfig();
    if(config == undefined) return undefined;
    const thisMonth = await GetImmersionTimeSince(dayjs().startOf("month"));
    const lastMonth = await GetImmersionTimeBetween(dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month"));
    const DTO:DashboardDTO = {    
        userName: config.account.userName,
        lastSyncTime: dayjs(lastEntry?.generationTime).toISOString(),
        lastReportTime: lastReport.generationTime,
        ankiDTO: config.anki.enabled ? {
            retentionRate: lastEntry?.anki?.retention ?? 0,
            retentionRateDelta: roundTo(roundTo(lastEntry?.anki?.retention ?? 0, 2) - roundTo(lastReport.retention ?? 0, 2), 2),
    
            totalReviews: lastEntry?.anki?.totalCardsStudied ?? 0,
            reviewsDelta: (lastEntry?.anki?.totalCardsStudied ?? 0) - lastReport.totalCardsStudied,
        } : undefined,
        immersionDTO: {
            totalImmersion: lastEntry?.toggl?.totalSeconds ?? 0,
            immersionSinceLastReport: await GetImmersionTimeSince(dayjs(lastReport.generationTime)),
            monthlyImmersion: thisMonth,
            monthlyImmersionLastMonth: lastMonth,
            immersionSources: await GetImmersionSourcesSince(dayjs().subtract(1, "month")),
        },
        monthlyScore: 0,
        syncCount: await GetSyncCount(),
        nextReport: getNextReportTime()
    }
    return DTO;
}