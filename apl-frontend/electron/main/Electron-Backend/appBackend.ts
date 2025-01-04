import { app, Menu, nativeImage, Notification, shell, Tray } from "electron"
import path from "node:path"
import { fileURLToPath } from "node:url";
import { runChecks } from "./DashboardListeners";
import { runGeneration } from "../../../apl-backend/generate/generate";
import { hasPerms } from "../../../apl-backend/Helpers/readWindows";
import { createWindow, win } from "..";
import { setSyncing } from "../../../apl-backend/generate/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let tray:Tray;


export async function buildContextMenu(){
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open AutoProgressLog', enabled: true, type: "normal", click: async () => {
                if(process.platform == "darwin"){
                    app.dock.show();
                }
                else if(process.platform == "win32"){
                    win.setSkipTaskbar(false);
                }
                if(win.isDestroyed()) await createWindow();
                if(win.isMinimized()) win.restore()
                win.focus();
                buildContextMenu();
            }
        },
        { label: 'Generate report', enabled: true, type: "normal", click: async () => {
            if(await runChecks()){
                setSyncing(true);
                return await runGeneration();
            }
        }},
        { 
            label: 'Hide Window', type: "normal",
            enabled: !win.isDestroyed(),
            click: () => {
                win.destroy() 
            }
        },
        {
            type: "separator"
        },
        { 
            label: 'Quit AutoProgressLog', type: "normal", click: () => app.quit()
        },
    ])

    tray.setContextMenu(contextMenu)
   
}



export async function createAppBackend(){

    const iconPath = path.resolve(__dirname, "../../src/assets/Logo.png"); 
    let trayIcon = nativeImage.createFromPath(iconPath);

    if (trayIcon.isEmpty()) {
        console.error("Failed to load icon. Ensure the path is correct and the icon is compatible.");
        return;
    }
    trayIcon = trayIcon.resize({ width: 16, height: 16 });

    tray = new Tray(trayIcon);
    tray.setToolTip('APL');

    buildContextMenu();
}