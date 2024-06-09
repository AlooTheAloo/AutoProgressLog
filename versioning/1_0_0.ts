import { semver } from "bun";
import { CacheManager } from "../Helpers/cache.ts";
import { cache, cacheList } from "../types/cache.ts"
import { SemVer } from "semver";

export const v1_0_0 = async (cacheList:cacheList) => {
    // Assert that version is below
    if(cacheList.version != undefined){
        return cacheList;
    }

    //Edit Cachelist
    CacheManager.set({
        list: [
            CacheManager.get() as any as cache
        ]
    }, "1.0.0");

    //Notify upgrade
    console.log("Upgraded to version 1.0.0".blue);

}