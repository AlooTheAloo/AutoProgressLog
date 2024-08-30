import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import electron from "electron"
const cdIntoDir = process.platform != "win32" ?
`SCRIPT_DIR=$( cd -- "$( dirname -- "\${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR 
` :
`@echo off
cd %CD%
`  



const yesno = [
    {
        input: "Y",
        returnVal: true,
        default: false
    },
    {
        input: "N",
        returnVal: false,
        default: true
    }
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const configPath = path.join(electron.app.getPath("userData"), "config.json") 
console.log(configPath)

export const writeRun = (runtime:string) => writeAndPerms(buildScriptPath('run'), buildContent(`start:${runtime}`));
export const writeRetry = (runtime:string) => writeAndPerms(buildScriptPath('retry'), buildContent('retry'));


function buildContent(funcName:string){
    return `\n${cdIntoDir}
    npm run --silent ${funcName}`
}

function buildScriptPath(filename:string){
    const scriptPath = path.join(__dirname, "..", process.platform == "win32" ? `${filename}.bat` : `${filename}.sh`);
    return scriptPath;
}

function writeAndPerms(path:string, content:string){
    fs.writeFileSync(path, content);
    if (process.platform != "win32") {
        fs.chmodSync(path, 0o777);
    }
}