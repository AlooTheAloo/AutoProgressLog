import { options } from "../types/options.js";
import fs from "fs";
import path from "path"
import {fileURLToPath} from "url"

let config:options|null = null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export function getConfig():options{
    if(config == null){
        const configPath = path.join(__dirname, "../config/config.json");
        if(!fs.existsSync(configPath)) {
            console.log("No configuration could be found! Please run 'npm run config' or 'bun run config' to get started!");
            process.exit();
        }
    
        config = JSON.parse(fs.readFileSync(configPath).toString());
    }

    if(config == null){
        throw new Error("Unable to load config.");
    }

    return config;
}