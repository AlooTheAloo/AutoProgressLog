import { ipcMain } from "electron";

export function togglListeners() {
  ipcMain.handle("Toggl-Connect", async (event, args) => {
    return await [];
  });
}
