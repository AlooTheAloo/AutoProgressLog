import { join } from "path";
import { CacheManager, cache_location } from "../Helpers/cache.ts";
import { appVersion } from "../consts/versioning.ts";
import { cacheList } from "../types/cache.ts";
import { v1_0_0 } from "../versioning/1_0_0.ts";
import colors from "colors" 
import fs from "fs"

export const appUpgrade = async (cacheList:cacheList) => {
    if(CacheManager.SemVer().compare(appVersion) == 0){
        console.log("Already up to date !".green)
        process.exit(0)
    }

    await v1_0_0(cacheList);
    console.log(colors.green(`Upgrade complete! `))

} 


if(!CacheManager.exists){
    if(!fs.existsSync(join(cache_location, ".."))){
        fs.mkdirSync(join(cache_location, ".."));
    }
    
    console.log(colors.red(`No cache to upgrade found.`));
    console.log("If it's your first time using AutoProgressLog use 'npm run config' or 'bun run config'");
    console.log(`If you're coming from the pre-1.0.0 version, place the 'cache.json' file found in the 'cache' folder in your AppData path (${join(cache_location, "..")})\n`);
    process.exit(0);
}

appUpgrade(CacheManager.get())