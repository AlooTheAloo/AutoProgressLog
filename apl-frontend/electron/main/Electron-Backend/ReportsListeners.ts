import { ipcMain } from "electron";
import { isGenerating } from "../../../apl-backend/generate/generate";

type ListReport = {
  id: number;
  score: number;
  date: string;
  fileExists: boolean;
  revertable?: boolean;
};

export type CopyReportToast = {
  worked: boolean;
  reportNo?: string;
};

export function reportsListeners() {
  // Handle the Get-Reports IPC request
  ipcMain.handle("Get-Reports", async (event, args) => {});

  ipcMain.handle("Get-Image", async (event, id: string) => {});

  ipcMain.handle("Open-Report", async (event, id: string) => {});

  ipcMain.handle("Copy-Report", async (event, id: string) => {});

  ipcMain.handle("loadReportsPage", async (evt) => {
    while (isGenerating) {
      await new Promise((res) => setTimeout(res, 50));
    }
    return true;
  });

  ipcMain.handle("Reverse-Report", async (event) => {});

  ipcMain.handle("Get-Images", async (event, start, end) => {});
}
