import path, { join } from "path";
import { CacheManager } from "../Helpers/cache";
import { appVersion } from "../consts/versioning";
import { cacheList } from "../types/cache";
import colors from "colors" 
import fs from "fs"
import { fileURLToPath } from "url";
import { registerRuntimeCompiler } from "vue";
import { cache_location } from "../Helpers/getConfig";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const appUpgrade = async (cacheList:cacheList) => {
    if(CacheManager.SemVer().compare(appVersion) == 0){
        console.log("Already up to date !".green)
        return;
    }

    console.log(colors.green(`Upgrade complete! `))
} 


if(!CacheManager.exists){
    if(!fs.existsSync(join(cache_location, ".."))){
        fs.mkdirSync(join(cache_location, ".."));
    }

    CacheManager.init();
}

//appUpgrade(CacheManager.get(false))