import { Version } from "../consts/versioning.ts"

export interface cache {
    totalSeconds:number,
    lastGenerated:string,
    cardsStudied:number,
    ankiStreak:number
    immersionStreak:number,

    //Useless for now but will use later
    mature:number|null,
    retention:number|null,


    reportNo:number,
}

export type versionInfo = { version: Version }

export type cacheList = ListOf<cache> & versionInfo

export type ListOf<T extends {}> = {
    list:Array<T>
}

export function isList<T extends {}>(obj:T|ListOf<T>):obj is ListOf<T>{
    return 'list' in obj
}