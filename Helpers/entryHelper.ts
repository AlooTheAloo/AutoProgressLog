import { entry } from "../types/entry";

export function sumTime(entries:entry[]){
    return entries.reduce((sum, current) => sum + current.duration, 0)
}