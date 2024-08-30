import { exec} from 'child_process';
import proc from 'find-process';
import { runGeneration } from './generate.js';
import { getConfig } from '../Helpers/getConfig.js';

export function ankiGeneration(){
    exec((process.platform == "darwin" ? "open " : "") + getConfig().anki.ankiIntegration.ankiPath);
    setTimeout(async () => {
        const ankiProcesses = (await proc("name", "Anki")).filter(x => (x as any as {bin:string}).bin.toLowerCase() == getConfig().anki.ankiIntegration.ankiProgramBinaryName?.toLowerCase())
        if(ankiProcesses.length > 0){
            process.kill(ankiProcesses[0].pid); 
        }

        await new Promise((res, rej) => {
            setTimeout(() => {
                res(null);
            }, 5000);
        })
        runGeneration();
    }, getConfig().type == "Server" ? 20000 : 5000);
   
    
}

