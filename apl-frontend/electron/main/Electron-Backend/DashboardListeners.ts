import { ipcMain } from "electron";
import { runGeneration } from "../../../apl-backend/generate/generate";

export function DashboardListeners() {
    ipcMain.handle("GenerateReport", async (event: any) => {
        
        runGeneration();
    });
}