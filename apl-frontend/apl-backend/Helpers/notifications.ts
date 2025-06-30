import { powerMonitor } from "electron";
import { win } from "../../../apl-frontend/electron/main";

export class NotificationManager {
  static isTurnedOn = true;
  static init() {
    powerMonitor.on("resume", () => {
      this.isTurnedOn = true;
    });
    powerMonitor.on("suspend", () => {
      this.isTurnedOn = false;
    });
    powerMonitor.on("lock-screen", () => {
      this.isTurnedOn = false;
    });
  }

  static async notify(notification: { header: string; content: string }) {
    if (!this.isTurnedOn) return;
    win?.webContents.send("ShowDialog", {
      header: notification.header,
      content: notification.content,
    });
  }
}
