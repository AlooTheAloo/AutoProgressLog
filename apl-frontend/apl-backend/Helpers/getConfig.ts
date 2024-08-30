import { options } from "../types/options.js";
import fs from "fs";
import path from "path"
import {fileURLToPath} from "url"
import { configPath } from "../config/generateConfig.js";

let config:options|null = null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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