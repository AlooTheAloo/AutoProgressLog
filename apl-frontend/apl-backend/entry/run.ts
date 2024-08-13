import schedule from 'node-schedule';
import { getConfig } from '../Helpers/getConfig.js';
import { ankiGeneration } from '../generate/ankiGeneration.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
import { HHMM } from '../consts/time.js';
import { CacheManager } from '../Helpers/cache.js';


dayjs.extend(duration)


const config = getConfig()

if(config.type == "Server"){
    console.log(`Server started! Generation will happen at ${dayjs.duration({minutes: getConfig().serverOptions?.generationTime.minutes, hours: getConfig().serverOptions?.generationTime.hours}).format(HHMM)}`);
    schedule.scheduleJob(`${config.serverOptions?.generationTime.minutes} ${config.serverOptions?.generationTime.hours} * * *`, () => {
        ankiGeneration()
    });    
}
else ankiGeneration();





