import { options } from "../types/options.js";
import fs from "fs";
import path from "path"
import {fileURLToPath} from "url"
import electron from "electron";

let config:options|null = null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const getFileInAPLData = (file:string) => path.join(environment == "electron" ? electron.app.getPath("userData") : process.env.APL_DATA_PATH, file);


const environment:"electron"|"node" = electron.app != null ? "electron" : "node";
export const configPath = getFileInAPLData("config.json"); 
export const syncDataPath = getFileInAPLData("syncData.db");
export const cache_location= getFileInAPLData("cache.json");



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