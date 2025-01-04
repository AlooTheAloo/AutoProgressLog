import { win } from "../../../electron/main";

export function notifyNoPermissions(){
    if(!win) return;
    win?.webContents.send("ShowDialog", {
        header: "No screen permissions!",
        content: "APL is unable to read your screen to fetch anki data. Please give us screen permissions and restart the app.",
    })
}