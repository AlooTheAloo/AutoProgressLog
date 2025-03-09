import * as path from "path";
import { fileURLToPath } from "url";
export const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, "../");
const wmctrl = require("node-gyp-build")(root);

export interface TypeDesc {
  flag: string;
  number: number;
}

export interface Geometry {
  x: number;
  y: number;
  abs_x: number;
  abs_y: number;
  width: number;
  height: number;
}

export interface Aspect {
  x: number /* numerator */;
  y: number /* denominator */;
}

export interface XSizeHints {
  //Based on Xutils.h
  flags: number /* marks which fields in this structure are defined */;
  x: number;
  y: number /* obsolete for new window mgrs, but clients */;
  width: number;
  height: number /* should set so old wm's don't mess up */;
  min_width: number;
  min_height: number;
  max_width: number;
  max_height: number;
  width_inc: number;
  height_inc: number;
  min_aspect: Aspect;
  max_aspect: Aspect;
  base_width: number;
  base_height: number;
  win_gravity: number;
}

export interface FrameExtents {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface Window {
  win_id: number;
  win_pid: number;
  win_client_machine: string;
  win_class: string;
  win_types: TypeDesc[];
  win_actions: TypeDesc[];
  win_states: TypeDesc[];
  win_name: string;
  win_visible_name: string;
  win_icon_name: string;
  win_visible_icon_name: string;
  win_geometry: Geometry | undefined;

  wm_normal_hints_supplied: number;
  WM_NORMAL_HINTS: XSizeHints | undefined;
  WM_HINTS: XSizeHints | undefined;
  desktop_number: number;
  showing_desktop: number;
  frame_extents: FrameExtents | undefined;
}

export interface Screen {
  backing_store: number;
  black_pixel: number;
  cmap: number;
  height: number;
  max_maps: number;
  mheight: number;
  min_maps: number;
  mwidth: number;
  ndepths: number;
  root_depth: number;
  root_input_mask: number;
  save_unders: number;
  white_pixel: number;
  width: number;
}

function expectParam(fnName: string, argName: string, arg: any, type: string) {
  if (typeof arg !== type)
    throw new Error(
      `[${fnName}] expect a type [${type}] for param [${argName}]`
    );

  if (type === "number" && isNaN(arg))
    throw new Error(
      `[${fnName}] expect a type [${type}] for param [${argName}] received NaN value`
    );
}

export function getScreenSync(): Screen {
  return wmctrl.getScreenSync();
}

export function getScreen(): Promise<Screen> {
  return wmctrl.getScreenAsync();
}

export function getWindowListSync(): Window[] {
  const windows = wmctrl.getWindowListSync();
  return !windows ? [] : windows;
}

export function getWindowList(): Promise<Window[]> {
  return wmctrl.getWindowListAsync();
}

export function getWindowByIdSync(win_id: number): Window {
  expectParam("getWindowById", "win_id", win_id, "number");
  return wmctrl.getWindowByIdSync(win_id);
}

export async function getWindowById(win_id: number): Promise<Window> {
  expectParam("getWindowById", "win_id", win_id, "number");
  return await wmctrl.getWindowByIdAsync(win_id);
}

export function getActiveWindowSync(): Window {
  return wmctrl.getActiveWindowSync();
}

export function getActiveWindow(): Promise<Window> {
  return wmctrl.getActiveWindowAsync();
}

export function getWindowsByPidSync(win_pid: number): Window[] {
  expectParam("getWindowsByPid", "win_pid", win_pid, "number");
  const windows = wmctrl.getWindowsByPidSync(win_pid);
  return !windows ? [] : windows;
}

export async function getWindowsByPid(win_pid: number): Promise<Window[]> {
  expectParam("getWindowsByPid", "win_pid", win_pid, "number");
  return await wmctrl.getWindowsByPidAsync(win_pid);
}

export function getWindowsByClassNameSync(win_class_name: string): Window[] {
  expectParam(
    "getWindowsByClassName",
    "win_class_name",
    win_class_name,
    "string"
  );
  const windows = wmctrl.getWindowsByClassNameSync(win_class_name);
  return !windows ? [] : windows;
}

export async function getWindowsByClassName(
  win_class_name: string
): Promise<Window[]> {
  expectParam(
    "getWindowsByClassName",
    "win_class_name",
    win_class_name,
    "string"
  );
  return wmctrl.getWindowsByClassNameAsync(win_class_name);
}

export function activeWindowByIdSync(win_id: number): boolean {
  expectParam("activeWindowById", "win_id", win_id, "number");
  return wmctrl.activeWindowByIdSync(win_id);
}

export async function activeWindowById(win_id: number): Promise<boolean> {
  expectParam("activeWindowById", "win_id", win_id, "number");
  return await wmctrl.activeWindowByIdAsync(win_id);
}

export function activeWindowsByClassNameSync(win_class_name: string): boolean {
  expectParam(
    "activeWindowsByClassName",
    "win_class_name",
    win_class_name,
    "string"
  );
  return wmctrl.activeWindowsByClassNameSync(win_class_name);
}

export async function activeWindowsByClassName(
  win_class_name: string
): Promise<boolean> {
  expectParam(
    "activeWindowsByClassName",
    "win_class_name",
    win_class_name,
    "string"
  );
  return await wmctrl.activeWindowsByClassNameAsync(win_class_name);
}

export function activeWindowsByPidSync(win_pid: number): boolean {
  expectParam("activeWindowsByPid", "win_pid", win_pid, "number");
  return wmctrl.activeWindowsByPidSync(win_pid);
}

export async function activeWindowsByPid(win_pid: number): Promise<boolean> {
  expectParam("activeWindowsByPid", "win_pid", win_pid, "number");
  return await wmctrl.activeWindowsByPidAsync(win_pid);
}

export function closeWindowByIdSync(win_id: number): boolean {
  expectParam("closeWindowById", "win_id", win_id, "number");
  return wmctrl.closeWindowByIdSync(win_id);
}

export async function closeWindowById(win_id: number): Promise<boolean> {
  expectParam("closeWindowById", "win_id", win_id, "number");
  return await wmctrl.closeWindowByIdAsync(win_id);
}

export function closeWindowsByClassNameSync(win_class_name: string): boolean {
  expectParam(
    "closeWindowsByClassName",
    "win_class_name",
    win_class_name,
    "string"
  );
  return wmctrl.closeWindowsByClassNameSync(win_class_name);
}

export async function closeWindowsByClassName(
  win_class_name: string
): Promise<boolean> {
  expectParam(
    "closeWindowsByClassName",
    "win_class_name",
    win_class_name,
    "string"
  );
  return await wmctrl.closeWindowsByClassNameAsync(win_class_name);
}

export function closeWindowsByPidSync(win_pid: number): boolean {
  expectParam("closeWindowsByPid", "win_pid", win_pid, "number");
  return wmctrl.closeWindowsByPidSync(win_pid);
}

export async function closeWindowsByPid(win_pid: number): Promise<boolean> {
  expectParam("closeWindowsByPid", "win_pid", win_pid, "number");
  return await wmctrl.closeWindowsByPidAsync(win_pid);
}

export function windowMoveResizeSync(
  win_id: number,
  win_gravity: number,
  win_x: number,
  win_y: number,
  win_width: number,
  win_height: number
): boolean {
  expectParam("windowMoveResize", "win_id", win_id, "number");
  expectParam("windowMoveResize", "win_gravity", win_gravity, "number");
  expectParam("windowMoveResize", "win_x", win_x, "number");
  expectParam("windowMoveResize", "win_y", win_y, "number");
  expectParam("windowMoveResize", "win_width", win_width, "number");
  expectParam("windowMoveResize", "win_height", win_height, "number");
  return wmctrl.windowMoveResizeSync(
    win_id,
    win_gravity,
    win_x,
    win_y,
    win_width,
    win_height
  );
}

export async function windowMoveResize(
  win_id: number,
  win_gravity: number,
  win_x: number,
  win_y: number,
  win_width: number,
  win_height: number
): Promise<boolean> {
  expectParam("windowMoveResize", "win_id", win_id, "number");
  expectParam("windowMoveResize", "win_gravity", win_gravity, "number");
  expectParam("windowMoveResize", "win_x", win_x, "number");
  expectParam("windowMoveResize", "win_y", win_y, "number");
  expectParam("windowMoveResize", "win_width", win_width, "number");
  expectParam("windowMoveResize", "win_height", win_height, "number");
  return await wmctrl.windowMoveResizeAsync(
    win_id,
    win_gravity,
    win_x,
    win_y,
    win_width,
    win_height
  );
}

export async function windowMoveResizeTransition(
  win_id: number,
  win_gravity: number,
  win_x: number,
  win_y: number,
  win_width: number,
  win_height: number,
  await_time: number = 1,
  pad: number = 1
) {
  expectParam("windowMoveResizeTransition", "win_id", win_id, "number");
  expectParam(
    "windowMoveResizeTransition",
    "win_gravity",
    win_gravity,
    "number"
  );
  expectParam("windowMoveResizeTransition", "win_x", win_x, "number");
  expectParam("windowMoveResizeTransition", "win_y", win_y, "number");
  expectParam("windowMoveResizeTransition", "win_width", win_width, "number");
  expectParam("windowMoveResizeTransition", "win_height", win_height, "number");
  expectParam("windowMoveResizeTransition", "await_time", await_time, "number");
  expectParam("windowMoveResizeTransition", "pad", pad, "number");

  return await wmctrl.windowMoveResizeTransitionAsync(
    win_id,
    win_gravity,
    win_x,
    win_y,
    win_width,
    win_height,
    await_time,
    pad
  );
}

const enabledActions = ["REMOVE", "ADD", "TOGGLE"];
const enabledProperties = [
  "modal",
  "sticky",
  "maximized_vert",
  "maximized_horz",
  "shaded",
  "skip_taskbar",
  "skip_pager",
  "hidden",
  "fullscreen",
  "above",
  "below",
];
export function windowStateSync(
  win_id: number,
  action: string,
  prop1: string,
  prop2?: string
) {
  expectParam("windowState", "win_id", win_id, "number");
  expectParam("windowState", "action", action, "string");
  expectParam("windowState", "prop1", prop1, "string");
  action = action.toUpperCase();
  if (!enabledActions.includes(action))
    throw new Error(
      `[windowState] only actions [${enabledActions.join(
        ","
      )}] are enabled note (${action})`
    );

  prop1 = prop1.toLowerCase();
  if (!enabledProperties.includes(prop1))
    throw new Error(
      `[windowState] property prop1 (${prop1}) is not an enabled property ${enabledActions.join(
        ","
      )}`
    );

  if (prop2) {
    expectParam("windowState", "prop2", prop2, "string");
    prop2 = prop2.toLowerCase();
    if (!enabledProperties.includes(prop2))
      throw new Error(
        `[windowState] property prop2 (${prop2}) is not an enabled property ${enabledActions.join(
          ","
        )}`
      );
  } else prop2 = "";

  return wmctrl.windowStateSync(win_id, action, prop1, prop2);
}

export async function windowState(
  win_id: number,
  action: string,
  prop1: string,
  prop2?: string
): Promise<boolean> {
  expectParam("windowState", "win_id", win_id, "number");
  expectParam("windowState", "action", action, "string");
  expectParam("windowState", "prop1", prop1, "string");
  action = action.toUpperCase();
  if (!enabledActions.includes(action))
    throw new Error(
      `[windowState] only actions [${enabledActions.join(
        ","
      )}] are enabled note (${action})`
    );

  prop1 = prop1.toLowerCase();
  if (!enabledProperties.includes(prop1))
    throw new Error(
      `[windowState] property prop1 (${prop1}) is not an enabled property ${enabledActions.join(
        ","
      )}`
    );

  if (prop2) {
    expectParam("windowState", "prop2", prop2, "string");
    prop2 = prop2.toLowerCase();
    if (!enabledProperties.includes(prop2))
      throw new Error(
        `[windowState] property prop2 (${prop2}) is not an enabled property ${enabledActions.join(
          ","
        )}`
      );
  } else prop2 = "";

  return await wmctrl.windowStateAsync(win_id, action, prop1, prop2);
}

export function windowMinimizeSync(win_id: number): boolean {
  expectParam("windowMinimize", "win_id", win_id, "number");
  return wmctrl.windowMinimizeSync(win_id);
}

export async function windowMinimize(win_id: number): Promise<boolean> {
  expectParam("windowMinimize", "win_id", win_id, "number");
  return await wmctrl.windowMinimizeAsync(win_id);
}

export function windowAllowAllSizesSync(win_id: number): boolean {
  expectParam("windowAllowAllSizes", "win_id", win_id, "number");
  return wmctrl.windowAllowAllSizesSync(win_id);
}

export async function windowAllowAllSizes(win_id: number): Promise<boolean> {
  expectParam("windowAllowAllSizes", "win_id", win_id, "number");
  return await wmctrl.windowAllowAllSizesAsync(win_id);
}

export function windowRaiseSync(win_id: number): boolean {
  expectParam("windowRaise", "win_id", win_id, "number");
  return wmctrl.windowRaiseSync(win_id);
}

export async function windowRaise(win_id: number): Promise<boolean> {
  expectParam("windowRaise", "win_id", win_id, "number");
  return await wmctrl.windowRaiseAsync(win_id);
}
