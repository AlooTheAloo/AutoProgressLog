import { CacheManager } from "../Helpers/cache";
import { cache, cacheList } from "../types/cache"
import { writeRetry } from "../config/generateConfig";
import { getConfig } from "../Helpers/getConfig";
import { v1_0_0 } from "./1_0_0";

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