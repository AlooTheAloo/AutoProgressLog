import { ipcMain } from "electron";
import { runGeneration } from "../../../apl-backend/generate/generate";
import {
  isSyncing,
  runSync,
  setSyncing,
} from "../../../apl-backend/generate/sync";
import {
  checkInternet,
  notifyNoInternet,
} from "../../../apl-backend/Helpers/Healthcheck/internetHelper";
import { APLStorage } from "./util/auth";
import { DashboardDTO } from "./types/Dashboard";
import { win } from "..";

export function dashboardListeners() {
  ipcMain.handle("isSyncing", async (event: any) => {
    return isSyncing();
  });

  ipcMain.handle("GenerateReport", async (event: any) => {
    if (await runChecks()) {
      return await runGeneration();
    }
  });

  ipcMain.handle("Sync", async (event: any) => {
    return await runSync();
  });

  ipcMain.handle("Get-Dashboard-DTO", async (event: any) => {
    return await CreateDTO();
  });
}

export async function runChecks(): Promise<boolean> {
  if (await checkInternet()) {
    return true;
  } else {
    notifyNoInternet();
    return false;
  }
}

export async function CreateDTO(): Promise<Partial<DashboardDTO> | null> {
  console.log("Creating dto :3");
  const dto = (await APLStorage.get<DashboardDTO>(
    "Cached_DTO"
  )) as DashboardDTO;

  if (dto) return dto;
  else {
    win?.webContents.send("ShowWelcomeMessage");
    win?.webContents.send("set-sidebar-state", true);
    await runSync();
    return CreateDTO();
  }
}

async function createPfpBuffer(path: string) {}
