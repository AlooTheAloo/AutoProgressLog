import xwin, { openWindows, openWindowsAsync, subscribeActiveWindow, WindowInfo } from '@miniben90/x-win';
import electron, { shell } from 'electron';
export async function hasPerms(){
  // @ts-ignore
  return (await import("node-mac-permissions")).getAuthStatus("screen") == "authorized";
}


export async function readWindows(pids:number[]) {

  const windows = xwin.openWindows();
  return windows.filter(x => pids.includes(x.info.processId));
}

export async function macOSRequirePerms() {
  // @ts-ignore
  return (await import("node-mac-permissions")).askForScreenCaptureAccess();
}