import { ipcMain } from "electron";
import { win } from "../../../electron/main";

export async function checkInternet(){
    try{
        await fetch("https://google.com")
        return true;
    }
    catch(e){
        return false
    }
    
}

export function notifyNoInternet(){
    win?.webContents.send("ShowDialog", {
        header: "No internet connection!",
        content: "APL is unable to connect to the internet. Make sure you are connected and try again.",
    })
}