import { ipcMain } from "electron";
import { isGenerating } from "../../../apl-backend/generate/generate";
import { writeFileSync } from "fs";

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

  ipcMain.handle("Export-Image", async (event, Image: string) => {
    console.log("caca");
    const base64 = Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");
    await writeFileSync(
      "/Users/philipanthony-davis/Desktop/School/Automne 2025/caca.png",
      buffer
    );
  });

  ipcMain.handle("loadReportsPage", async (evt) => {
    while (isGenerating) {
      await new Promise((res) => setTimeout(res, 50));
    }
    return true;
  });

  ipcMain.handle("Reverse-Report", async (event) => {});

  ipcMain.handle("Get-Images", async (event, start, end) => {});
}
