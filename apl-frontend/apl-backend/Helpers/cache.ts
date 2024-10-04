import dayjs from "dayjs";
import { ListOf, cache, cacheList, isList } from "../types/cache.js";
import fs from "fs";
import { SemVer, parse } from "semver";
import { Version, appVersion } from "../consts/versioning.js";
import path from "path"
import { fileURLToPath } from 'url';
import { app } from "electron";
import { cache_location } from "./getConfig.js";


export class CacheManager {

    static SemVer = () => {
        return new SemVer(this.get(false).version ?? "0.0.0");
    }

    static verifyVersion = () => { 
        return this.SemVer().compare(appVersion) == 0
    }


    static exists = fs.existsSync(cache_location)
    static init = () => {
        this.set({
            list: [
                {
                    seconds: 0,
                    totalSeconds: 0,
                    generationTime: dayjs().startOf("day").toISOString(),
                    totalCardsStudied: 0,
                    cardsStudied: 0,
                    ankiStreak: 0,
                    immersionStreak: 0,
                    reportNo: 0,
                    mature: 0,
                    retention: 0,
                    score: 0
                },
            ]
        })
    }

    static peek = () => {
        const top = this.get().list.at(-1)
        if (top == undefined) {
            throw new RangeError("Cache list is empty");
        }

        return top;
    }


    static getLastN = (n:number) => {
        const cacheList = this.get();
        return cacheList.list.slice(-n).reverse();
    }

    static pop = () => {
        const cacheList = this.get();
        const list = cacheList.list;
        const poppedValue = list.pop();
        this.set({list: list });
        return poppedValue;
    }

    static push = (items: cache | cacheList) => {
        const list = this.get().list;
        if (isList(items)) {
            list.push(...items.list);
        }
        else list.push(items)

        this.set({list: list})
    }

    public static set = (list: ListOf<cache>, version:Version = appVersion) => {
        const cacheList:cacheList = {
            list: list.list,
            version: version
        }
        fs.writeFileSync(cache_location, JSON.stringify(cacheList));
    }

    public static get = (createIfNull=true): cacheList => {
        if(!CacheManager.exists && createIfNull){
            CacheManager.init();
        }
        return JSON.parse(fs.readFileSync(cache_location).toString())
    }
}
