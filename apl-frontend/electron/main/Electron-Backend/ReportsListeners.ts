import { clipboard, ipcMain, nativeImage, NativeImage } from "electron";
import { isGenerating } from "../../../apl-backend/generate/generate";
import { writeFileSync } from "fs";
import { getConfig } from "../../../apl-backend/Helpers/getConfig";
import path from "path";

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

import { EdenClient } from "./api/ApiManager";
import { APLStorage } from "./util/auth";
import { ReportData } from "../../../apl-backend/types/reportdata";

export function reportsListeners() {
  // Handle the Get-Reports IPC request
  ipcMain.handle("Get-Reports", async (event, page, pagesize) => {

    const token = await APLStorage.get("token");
    console.log("Getting reports...");

    const { data, error } = await EdenClient.user.reports.get({
        headers: { authorization: `Bearer ${token}` },
        query: {
          page: page,
          pageSize: pagesize,
        }
    });
    console.log("GOT " + JSON.stringify(data));
    if (error) {
      console.error("Error fetching reports:", error);
      return [];
    }
    console.log("Reports fetched successfully");
    return data;
  });

  ipcMain.handle("Get-Image", async (event, id: string) => {});

  ipcMain.handle("Copy-Report", async (event, id: string) => {});

  ipcMain.handle("Open-Report", async (event, id: string) => {});

  ipcMain.handle("Export-Image", async (event, Image: string, reportNo: number, toclipboard: boolean) => {
    try {
      const base64 = Image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64, "base64");
      const config = await getConfig();
      const f = config?.localOptions.outputOptions.outputFile;
      
      if (!f) {
        console.error("Output file configuration missing");
        return { success: false, error: "Configuration missing" };
      }

      if(!toclipboard){
        // Ensure path ends with separator or use path.join if f.path is a directory
        const fileName = `${f.name} ${reportNo}${f.extension}`;
        const filePath = path.join(f.path, fileName);
        await writeFileSync(filePath, buffer);
        console.log("Image saved to:", filePath);
        return { success: true, path: filePath };
      }
      else {
        let image:NativeImage = nativeImage.createFromBuffer(buffer);
        clipboard.writeImage(image);
        return { success: true };
      }


      
      
    } catch (error) {
      console.error("Error saving image:", error);
      return { success: false, error: error };
    }
  });

  ipcMain.handle("loadReportsPage", async (evt) => {
    while (isGenerating) {
      await new Promise((res) => setTimeout(res, 50));
    }
    return true;
  });

  ipcMain.handle("Get-Report-Details", async (event, id: string) => {
    const token = await APLStorage.get("token");
    const { data, error } = await EdenClient.user.report({ id }).get({
      headers: { authorization: `Bearer ${token}` },
    });
    if (error) {
      console.error("Error fetching report details:", error);
      return null;
    }

    console.log("Report : " + JSON.stringify(data));
    
    return data as ReportData;
  });

  ipcMain.handle("Reverse-Report", async (event) => {});

  ipcMain.handle("Get-Images", async (event, start, end) => {});
}
