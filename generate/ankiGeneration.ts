import { exec} from 'child_process';
import proc from 'find-process';
import { runGeneration } from './generate.js';
import { getConfig } from '../Helpers/getConfig.js';

export function ankiGeneration(){

    if(getConfig().anki.enabled){
        exec((process.platform == "darwin" ? "open " : "") + getConfig().anki.ankiPath);
        setTimeout(async () => {
            const prog = await proc("name", "Anki")
            process.kill(prog.filter(x => (x as any).bin.toLowerCase() == getConfig().anki.ankiProgramBinaryName?.toLowerCase())[0].pid); 
            await new Promise((res, rej) => {
                setTimeout(() => {
                    res(null);
                }, 2000);
            })
            runGeneration();
        }, 5000);
    }
    else{
        runGeneration();
    }
    
}

