import { options } from "../types/options.js";
import fs from "fs";
import path from "path"
import {fileURLToPath} from "url"
import electron from "electron";

let config:options|null = null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environment:"electron"|"node" = electron.app != null ? "electron" : "node";
console.log(environment);
export const configPath = environment == "electron" ? path.join(electron.app.getPath("userData"), "config.json"): process.env.CONFIG_PATH; //
export const syncDataPath = "cock" //path.join(electron.app.getPath("userData"), "syncData.db") 
console.log(process.env);

export function getConfig():options|null{
    if(config == null){
        if(!fs.existsSync(configPath)) {
            return null;
        }
    
        config = JSON.parse(fs.readFileSync(configPath).toString());
    }

    if(config == null){
        throw new Error("Unable to load config.");
    }

    return config;
}