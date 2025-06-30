import { clipboard, ipcMain, ipcRenderer, nativeImage, shell } from "electron";
import { CacheManager } from "../../../apl-backend/Helpers/cache";
import dayjs from "dayjs";
import { existsSync, rm } from "fs";
import { promises as fsPromises } from "fs";
import sharp from "sharp";
import { deleteSyncs } from "../../../apl-backend/Helpers/DataBase/DeleteDB";
import { isGenerating } from "../../../apl-backend/generate/generate";
import { Logger } from "../../../apl-backend/Helpers/Log";

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
  ipcMain.handle("Get-Reports", async (event, args) => {
    try {
      const reports = await Promise.all(
        CacheManager.get()
          .list.filter((x) => x.reportNo != 0)
          .reverse()
          .map(async (x, i) => {
            const fileExists = await fsPromises
              .access(x.path)
              .then(() => true)
              .catch(() => false);

            // Create the report object
            const ret: ListReport = {
              id: x.reportNo,
              score: x.score,
              date: x.generationTime,
              fileExists: fileExists,
              revertable: i === 0,
            };
            return ret;
          })
      );

      return reports; // Return the list of reports with resized image data
    } catch (error) {
      console.error("Error in Get-Reports handler:", error);
      throw error; // Optionally rethrow or handle the error as needed
    }
  });

  ipcMain.handle("Get-Image", async (event, id: string) => {
    const report = CacheManager.get().list.find(
      (x) => x.reportNo.toString() == id
    );
    if (report) {
      const fileExists = await fsPromises
        .access(report.path)
        .then(() => true)
        .catch(() => false);
      let resizedBase64: string = "";
      if (fileExists) {
        // Read the image file
        const file = await fsPromises.readFile(report.path);
        const sharpFile = await sharp(file);
        // Resize the image using sharp and convert it to base64
        resizedBase64 = await sharpFile
          .toBuffer()
          .then((buffer) => buffer.toString("base64")) // Convert buffer to base64
          .catch((err) => {
            throw new Error("Error resizing image");
          });
      }
      return resizedBase64;
    }
  });

  ipcMain.handle("Open-Report", async (event, id: string) => {
    const report = CacheManager.get().list.find(
      (x) => x.reportNo.toString() == id
    );
    if (report) {
      shell.showItemInFolder(report.path);
    }
  });

  ipcMain.handle("Copy-Report", async (event, id: string) => {
    const report = CacheManager.get().list.find(
      (x) => x.reportNo.toString() == id
    );
    if (report) {
      clipboard.writeImage(nativeImage.createFromPath(report.path));
      return {
        worked: true,
        reportNo: report.reportNo.toString(),
      };
    } else {
      return {
        worked: false,
      };
    }
  });

  ipcMain.handle("loadReportsPage", async (evt) => {
    while (isGenerating) {
      await new Promise((res) => setTimeout(res, 50));
    }
    return true;
  });

  ipcMain.handle("Reverse-Report", async (event) => {
    const report = CacheManager.pop();
    if (report == undefined) return;
    if (existsSync(report.path)) rm(report.path, () => {});
    deleteSyncs(report.syncID);
  });

  ipcMain.handle("Get-Images", async (event, start, end) => {
    const startTime = dayjs();
    const scaleFactor = 0.05;
    const images = await Promise.all(
      CacheManager.get()
        .list.filter((x) => x.reportNo != 0)
        .reverse()
        .slice(start, end)
        .map(async (x, i) => {
          const fileExists = await fsPromises
            .access(x.path)
            .then(() => true)
            .catch(() => false);
          let resizedBase64: string = "";
          if (fileExists) {
            // Read the image file
            const file = await fsPromises.readFile(x.path);
            const sharpFile = await sharp(file);
            const metadata = await sharpFile.metadata();

            const height = Math.round((metadata.height ?? 0) * scaleFactor);
            const width = Math.round((metadata.width ?? 0) * scaleFactor);

            // Resize the image using sharp and convert it to base64
            resizedBase64 = await sharpFile
              .resize({ width: width, height: height }) // Resize
              .toBuffer()
              .then((buffer) => buffer.toString("base64")) // Convert buffer to base64
              .catch((err) => {
                throw new Error("Error resizing image");
              });
          }
          return resizedBase64;
        })
    );
    const endTime = dayjs();
    Logger.log(
      "Images took " + (endTime.diff(startTime, "ms") + " ms"),
      "Reports"
    );
    return {
      start: start,
      images: images,
    }; // Return the list of reports with resized image data
  });
}
