import { electronAppUniversalProtocolClient } from "electron-app-universal-protocol-client";
import { createWindow, win } from "..";
import { app } from "electron";
import { FocusApp } from "./appBackend";

export async function initializeDeepLink() {
  const isDev = process.env.NODE_ENV === "development";

  if (process.argv.length >= 2) {
    await electronAppUniversalProtocolClient.initialize({
      protocol: "apl",
      mode: isDev ? "development" : "production", // Make sure to use 'production' when script is executed in bundled app
    });
  }
  electronAppUniversalProtocolClient.on("request", async (requestUrl) => {
    if (requestUrl.startsWith("apl://")) {
      await FocusApp();
      win?.webContents.send("open-url", requestUrl);
    }
  });
}
