import schedule from 'node-schedule';
import { getConfig } from './Helpers/getConfig.js';
import { ankiGeneration } from './generate/ankiGeneration.js';
import dayjs from 'dayjs';


const config = getConfig()

if(config.type == "Server"){
    console.log(`Server started! Generation will happen at ${dayjs.duration({minutes: getConfig().serverOptions?.generationTime.minutes, hours: getConfig().serverOptions?.generationTime.hours}).format('HH:mm')}`);
    schedule.scheduleJob(`${config.serverOptions?.generationTime.minutes} ${config.serverOptions?.generationTime.hours} * * *`, () => {
        ankiGeneration()
    });    
}
else ankiGeneration();





