import xwin, { openWindows, openWindowsAsync, subscribeActiveWindow, WindowInfo } from '@miniben90/x-win';
import electron, { shell } from 'electron';
import permissions from 'node-mac-permissions';

let nodeMacPermissions = undefined;

export async function hasPerms(){
  // @ts-ignore
  nodeMacPermissions = nodeMacPermissions ?? (await import("node-mac-permissions")).default;
  return nodeMacPermissions.getAuthStatus("screen") == "authorized";
}


export async function readWindows(pids:number[]) {

  const windows = xwin.openWindows();
  return windows.filter(x => pids.includes(x.info.processId));
}

export async function macOSRequirePerms() {
  // @ts-ignore
  nodeMacPermissions = nodeMacPermissions ?? (await import("node-mac-permissions")).default;
  return await nodeMacPermissions.askForScreenCaptureAccess();
}