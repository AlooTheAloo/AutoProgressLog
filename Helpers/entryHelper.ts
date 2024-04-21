import { entry } from "../types/entry.js";
export function sumTime(entries:entry[]){
    return entries.reduce((sum, current) => sum + current.duration, 0)
}