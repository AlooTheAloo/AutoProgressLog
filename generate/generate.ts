import { Toggl } from 'toggl-track';
import { entry } from '../types/entry.js';import fs from "fs";
import { cache } from '../types/cache.js';import dayjs, { Dayjs } from 'dayjs';
import { activity } from '../types/activity.js';
import duration from "dayjs/plugin/duration.js";
import { compareActivities } from '../Helpers/activityHelper.js';
import { sumTime } from '../Helpers/entryHelper.js';
import { getAnkiCardReviewCount } from "../anki/db.js";
import { buildMessage } from '../Helpers/buildMessage.js';
import { getConfig } from '../Helpers/getConfig.js';
export const cache_location:string = "./cache/cache.json";
import path from 'path';
import { fileURLToPath } from 'url';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);


export const toggl = new Toggl({
    auth: {
        token: getConfig().toggl.togglToken ?? "",
    },
});

export async function runGeneration(){
    dayjs.extend(duration)


    if(!fs.existsSync(cache_location)){
        const cache:cache = {
            totalSeconds:0,
            lastGenerated:dayjs().startOf("day").toISOString(),
            cardsStudied:0,
            ankiStreak:0,
            immersionStreak:0,
            reportNo:1
        }
        fs.writeFileSync(cache_location, JSON.stringify(cache));
    }

    const startCache:cache = JSON.parse(fs.readFileSync(cache_location).toString())
    const lastGenerated = dayjs(startCache.lastGenerated);

    // Toggl stuff
    const entries:entry[] = await toggl.timeEntry.list();
    const entriesAfterLastGen = entries.filter(x => {
        if(x.stop == null){ 
            return false;
        }
        return dayjs(x.start).isAfter(lastGenerated)
    })

    const uniqueEvents:string[] = [...new Set(entriesAfterLastGen.map(x => x.description))]
    const allEvents = uniqueEvents.map(function(evt) {
        const correspondingEntries = entriesAfterLastGen.filter(x => x.description == evt)
        const activityTime = sumTime(correspondingEntries)
        const ret:activity = {
            activityTitle: evt,
            activityDurationHR: dayjs.duration(activityTime * 1000).format("HH:mm:ss") + "",
            activitySeconds: activityTime
        }
        return ret;
    }).sort(compareActivities).reverse()


    let count:null|number = null;

    if(getConfig().anki.enabled){
        // Anki stuff
        count = await getAnkiCardReviewCount(lastGenerated);
    }    
       
    const timeToAdd = sumTime(entriesAfterLastGen)

    // Build message
    const ans = buildMessage(count, allEvents, startCache, timeToAdd);

    // Output
    fs.writeFileSync(cache_location, JSON.stringify(ans.cache))
    
    if(getConfig().outputOptions.enabled){
        const outputPath = path.join(__dirname, "..", "output", `${(getConfig().outputOptions.outputFileName ?? "output")} #${startCache.reportNo}.txt`)
        fs.writeFileSync(outputPath , ans.message);
    }
    console.log(ans.message);
}