import { getAnswer } from '../Helpers/configHelper.js';
import colors from "colors";
import { Time, ankiIntegration, options } from '../types/options.js';
import { Toggl } from 'toggl-track';
import { join } from "path";
import fs from "fs";
import { createAnkiIntegration } from './configAnkiIntegration.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { cache_location } from '../Helpers/cache.js';

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

export async function runConfig() {
    console.log("Make sure to read the README.md file before going through the setup process".yellow.bold)
    
    // General stuff
    const runtime: "Bun" | "Node" = await getAnswer<"Bun" | "Node">({
        question: "What JS Runtime are you using?" + "(if you don't know just press enter)".yellow.bold,
        options: [{
            input: "Node",
            returnVal: "Node",
            default: true
        },
        {
            input: "Bun",
            returnVal: "Bun",
            default: false
        }
        ]
    });

    const manualWarn = colors.bold.yellow("(Manual mode strongly recommended)")
    const runType = await getAnswer<"Server" | "Manual">({
        question: "How do you plan on using the logger? " + manualWarn,
        options: [{
            input: "Manual",
            returnVal: "Manual",
            default: true
        },
        {
            input: "Server",
            returnVal: "Server",
            default: false
        }
        ]
    });

    let time: Time | null = null;
    if (runType == "Server") {
        let timeStr = await getAnswer({
            question: "At what time should the generation happen? [HH:MM] (default : 23:55)", verifFunc: (ans) => {
                if (ans == "")
                    return true;

                const regex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
                return regex.test(ans);
            }
        });
        if (timeStr == "") timeStr = "23:55";
        time = parseTime(timeStr);
    }

    // Toggl
    let togglAPIKey = "";
    while (true) {
        togglAPIKey = await getAnswer({
            question: "Please provide your Toggl API key. Instructions to find it are in the README. ",
            verifFunc: (ans) => {
                return ans.length >= 10
            }
        });


        const toggl = new Toggl({
            auth: {
                token: togglAPIKey,
            },
        });
        try {
            const user = await toggl.me.get()
            if (user?.fullname == null) {
                console.log("There was an error logging you in. Please try again".red);
            }
            else {
                console.log(`Logged in as ${user.fullname}`.blue)
                break;
            }
        }
        catch (e: any) {
            console.log(`There was an error logging you in. Please try again. Error log can be found in ${join(__dirname, "../log.txt")}`.red);
            fs.writeFileSync("../log.txt", e.toString());
        }
    }

    // Anki
    const ankiIntegrationEnabled = await getAnswer({
        question: "Do you want to enable Anki integration?",
        options: yesno
    });

    if (ankiIntegrationEnabled && !(process.platform == "win32" || process.platform == "darwin")) {
        console.log("Anki integration is not guaranteed to work on all Gnu/Linux systems. If you have any issues, don't hesitate to open an issue on GitHub.".red.bold)
    }

    let anki: ankiIntegration | {} = {}
    if (ankiIntegrationEnabled) {
        anki = await createAnkiIntegration();
    }

    const outputEnabled = await getAnswer({ question: "Do you want to also log the output to a file?", options: yesno });
    let outputFile = "";
    if (outputEnabled) {
        outputFile = await getAnswer({
            question: "Please enter the filename (without extension) for the output (default : output) ", verifFunc: () => {
                return true;
            }
        })
        if (outputFile == "") {
            outputFile = "output";
        }
    }

    const config: options = {
        runtime: runtime,
        type: runType,
        toggl: {
            togglToken: togglAPIKey
        },
        serverOptions: (runType == "Server" && time != null) ? { 
            generationTime: time
        } : undefined
        ,
        anki: (!isAnkiIntegration(anki)) ? {
            enabled: false
        } : anki,
        outputOptions: {
            enabled: outputEnabled,
            outputFileName: outputFile
        }
    }

    fs.writeFileSync(path.join(__dirname, "config.json"), JSON.stringify(config));
    const outDir = join(__dirname, "..", "output");

    if (outputEnabled && !fs.existsSync(outDir)) {
        fs.mkdirSync(outDir)
    }


    
    if(!fs.existsSync(join(cache_location, ".."))){
        fs.mkdirSync(join(cache_location, ".."));
    }

    writeRun(runtime);
    writeRetry(runtime);

    process.exit();
}

function isAnkiIntegration(ankiIntegration: ankiIntegration | {}): ankiIntegration is ankiIntegration {
    return "enabled" in ankiIntegration
}

function parseTime(ans: string): Time | null {
    const regex = /^(?:([01]?\d|2[0-3]):([0-5]\d))$/;
    const match = ans.match(regex);

    if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);

        return { hours, minutes };
    } else {
        return null;
    }
}

function writeRun(runtime:string){
    if (process.platform != "win32") {
        const pathRun = path.join(__dirname, "..", "run.sh");
        fs.writeFileSync(pathRun, `cd ${__dirname} 
npm run --silent start:${runtime.toLowerCase()}`);
        fs.chmodSync(pathRun, 0o777);
        console.log("Configuration created! Run the 'run.sh' file to run the generator!".blue);
    }
    else {
        const pathRun = path.join(__dirname, "..", "run.bat");
        fs.writeFileSync(pathRun, `@echo off
cd /d ${__dirname}
npm run --silent start:${runtime.toLowerCase()}`);
        console.log("Configuration created! Run the 'run.bat' file to run the generator!".blue);
    }
}

function writeRetry(runtime:string){
    const pathRetry = path.join(__dirname, "..", process.platform == "win32" ? "run.bat" : "run.sh");
    let content = "";
    if (process.platform != "win32") {
        content = `cd ${__dirname} 
        npm run --silent retry`;
        fs.chmodSync(pathRetry, 0o777);
    }
    else {
        content = `@echo off
        cd /d ${__dirname}
        npm run --silent retry`
    }

    fs.writeFileSync(pathRetry, content);
}

