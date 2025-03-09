import xwin from "@miniben90/x-win";
import electron, { Notification, shell } from "electron";
let nodeMacPermissions: any = undefined;

export async function hasPerms() {
  // @ts-ignore
  nodeMacPermissions =
    nodeMacPermissions ?? (await import("node-mac-permissions")).default;
  return nodeMacPermissions.getAuthStatus("screen") == "authorized";
}

export async function hasNotifPerms() {
  // @ts-ignore
  nodeMacPermissions =
    nodeMacPermissions ?? (await import("node-mac-permissions")).default;
  return nodeMacPermissions.getAuthStatus("") == "authorized";
}

export async function readWindows(pids: number[]) {
  if (process.platform == "linux") {
    let wmctrl = await import("./Linux/wmctrljs-master/src");
    return new Promise<any>((resolve, reject) => {
      try {
        const promises = pids.map((pid) => wmctrl.getWindowsByPid(pid));
        Promise.all(promises)
          .then((results) => resolve(results.flat()))
          .catch((error) => reject(error));
      } catch (error) {
        reject(error);
      }
    });
  } else {
    const windows = xwin.openWindows();
    return windows.filter((x) => pids.includes(x.info.processId));
  }
}

export async function macOSRequirePerms() {
  // @ts-ignore
  nodeMacPermissions =
    nodeMacPermissions ?? (await import("node-mac-permissions")).default;

  return await nodeMacPermissions.askForScreenCaptureAccess();
}
export async function macOSRequireNotification() {
  new Notification({
    title: "Notification Permissions",
    body: "Please grant notification permissions to continue.",
  });
}
