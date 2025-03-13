import { relativeActivity } from "../types/activity.js";
import { entry } from "../types/entry.js";

export function sumTime(entries: relativeActivity[]): number;
export function sumTime(entries: entry[]): number;
export function sumTime(entries: relativeActivity[] | entry[]): number {
  return entries.reduce(
    (sum, current) =>
      sum +
      ("relativeValue" in current ? current.relativeValue : current.duration),
    0,
  );
}
