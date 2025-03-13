import { App, BrowserWindow, Menu, ipcMain } from "electron";
import { indexHtml, VITE_DEV_SERVER_URL, win } from "..";
import { getConfig } from "../../../apl-backend/Helpers/getConfig";
import { shell } from "electron";

export function buildMenu(app: App) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name, // This will automatically use "Autoprogresslog" as the name
      submenu: [
        {
          label: "About APL",
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 400,
              height: 300,
              resizable: false,
              webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
              },
            });
            if (VITE_DEV_SERVER_URL) {
              // #298
              aboutWindow.loadURL(VITE_DEV_SERVER_URL);
              // Open devTool if the app is not packaged
            } else {
              aboutWindow.loadFile(indexHtml);
            }
            aboutWindow.webContents.on("did-finish-load", () => {
              aboutWindow?.webContents.send("router-push", "/about");
            });
          },
        }, // About menu item
        { type: "separator" },
        {
          label: "Settings",
          accelerator: "CmdOrCtrl+,",
          enabled: getConfig() != null,
          click: () => {
            win?.webContents.send("router-push", "/app/settings");
          },
        },
        { type: "separator" },
        { role: "services" }, // Mac-specific Services menu
        { type: "separator" },
        { role: "hide" }, // Hide menu item
        { role: "unhide" }, // Unhide menu item
        { type: "separator" },
        { role: "quit" }, // Quit menu item
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        { role: "close" },
        { type: "separator" },
        { role: "front" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Learn More",
          click: async () => {
            await shell.openExternal("https://aplapp.dev");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
