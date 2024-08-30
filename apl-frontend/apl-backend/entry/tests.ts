import xwin, { openWindows, openWindowsAsync, subscribeActiveWindow, WindowInfo } from '@miniben90/x-win';
import electron, { shell } from 'electron';
import permissions from "node-mac-permissions";

export async function hasPerms(){
  return permissions.getAuthStatus("screen") == "authorized";
}


export async function readWindows(pids:number[]) {

  const windows = xwin.openWindows();
  return windows.filter(x => pids.includes(x.info.processId));
}

export async function macOSRequirePerms() {
  permissions.askForScreenCaptureAccess();
}