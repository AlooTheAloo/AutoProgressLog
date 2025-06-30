import dayjs from "dayjs";
import { win } from "../../../../apl-frontend/electron/main";
import nodeScheduler from "node-schedule";
import { NotificationManager } from "../notifications";

let hasInternet = false;

export async function setInternet(value: boolean) {
  hasInternet = value;
}

export async function checkInternet() {
  try {
    await fetch("https://google.com");
    return true;
  } catch (e) {
    return false;
  }
}

export function notifyNoInternet() {
  NotificationManager.notify({
    header: "No internet connection!",
    content:
      "APL is unable to connect to the internet. Make sure you are connected and try again.",
  });
}
