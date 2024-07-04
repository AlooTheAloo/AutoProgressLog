import { semver } from "bun";
import { CacheManager } from "../Helpers/cache.ts";
import { cache, cacheList } from "../types/cache.ts"
import { SemVer } from "semver";
import { writeRetry } from "../config/generateConfig.ts";
import { getConfig } from "../Helpers/getConfig.ts";
import { v1_0_0 } from "./1_0_0.ts";

export const v1_0_1 = async (cacheList:cacheList) => {
    // Assert that version is below
    if(cacheList.version != "1.0.0"){
        v1_0_0(cacheList);
    }

    // Edit App
    let cache = CacheManager.get()
    cache.list = cache.list.map(x => {
        const newCache:cache = {
            reportNo: x.reportNo,
            totalSeconds: x.totalSeconds,
            lastGenerated: x.lastGenerated,
            cardsStudied: x.cardsStudied,
            ankiStreak: x.ankiStreak,
            immersionStreak: x.immersionStreak,
            mature: null,      
            retention:null
        }

        return newCache;
    })

    CacheManager.set({
        list: cache.list
    }, "1.0.1");


    writeRetry(getConfig().runtime);

    //Notify upgrade
    console.log("Upgraded to version 1.0.1".blue);

}