import schedule from 'node-schedule';
import { exec} from 'child_process';
import proc from 'find-process';
import { runGeneration } from './generate/generate.js';

console.log("running...");
schedule.scheduleJob("55 23 * * *", () => {
     console.log("Starting anki for sync...")
     console.log(process.env.ANKI_APP_PATH)
     exec(process.env.ANKI_APP_PATH ?? "");
     setTimeout(async () => {
         console.log("Generating message..");
         const prog = await proc("name", "Anki")
         process.kill(prog.filter(x => x.name.toLowerCase() == "anki.exe")[0].pid); 
         runGeneration(false);
     }, 20000);
});





