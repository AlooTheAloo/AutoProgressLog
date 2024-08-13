import path, { join } from "path";
import { APLData, CacheManager, cache_location } from "../Helpers/cache";
import { appVersion } from "../consts/versioning";
import { cacheList } from "../types/cache";
import colors from "colors" 
import fs from "fs"
import { v1_0_1 } from "../versioning/1_0_1";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const appUpgrade = async (cacheList:cacheList) => {
    if(CacheManager.SemVer().compare(appVersion) == 0){
        console.log("Already up to date !".green)
    }

    await v1_0_1(cacheList);
    console.log(colors.green(`Upgrade complete! `))
} 


if(!CacheManager.exists){
    if(!fs.existsSync(join(cache_location, ".."))){
        fs.mkdirSync(join(cache_location, ".."));
    }
    
    const cacheLoc = join(__dirname, "../cache/cache.json");
    const configLoc = join(__dirname, "../config/config.json");

    if(fs.existsSync(cacheLoc) && fs.existsSync(configLoc)){
        fs.cpSync(cacheLoc, join(APLData, "cache.json"));
        fs.cpSync(configLoc, join(APLData, "config.json"));

        fs.rmSync(configLoc); 
        fs.rmSync(join(cacheLoc, ".."), {recursive: true});
    }
    else{
        console.log(colors.red(`No cache to upgrade found.`));
        console.log("If it's your first time using AutoProgressLog use 'npm run config' or 'bun run config'");
        process.exit(0);
    }
    
}

appUpgrade(CacheManager.get(false))