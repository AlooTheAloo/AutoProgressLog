import { win } from "../../../electron/main";
import nodeScheduler from "node-schedule";

let hasInternet = false;

export async function setInternet(value: boolean) {
  hasInternet = value;
}

export async function checkInternet() {
  return hasInternet;
}

export function notifyNoInternet() {
  win?.webContents.send("ShowDialog", {
    header: "No internet connection!",
    content:
      "APL is unable to connect to the internet. Make sure you are connected and try again.",
  });
}
