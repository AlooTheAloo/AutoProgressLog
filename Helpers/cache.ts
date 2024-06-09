import dayjs from "dayjs";
import { ListOf, cache, cacheList, isList } from "../types/cache.js";
import fs from "fs";
import { SemVer, parse } from "semver";
import { Version, appVersion } from "../consts/versioning.js";
import path from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const appData = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")


export const cache_location: string = path.join(appData, "/AutoProgressLog/cache.json");

export class CacheManager {

    static SemVer = () => {
        return new SemVer(this.get().version ?? "0.0.0");
    }

    static verifyVersion = () => { 
        return this.SemVer().compare(appVersion) == 0
    }


    static exists = fs.existsSync(cache_location)
    static init = () => {
        this.set({
            list: [
                {
                    totalSeconds: 0,
                    lastGenerated: dayjs().startOf("day").toISOString(),
                    cardsStudied: 0,
                    ankiStreak: 0,
                    immersionStreak: 0,
                    reportNo: 0
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

    public static get = (): cacheList => {
        if(!CacheManager.exists){
            CacheManager.init();
        }


        return JSON.parse(fs.readFileSync(cache_location).toString())
    }
}
