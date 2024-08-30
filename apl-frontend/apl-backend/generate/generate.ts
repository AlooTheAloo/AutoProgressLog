import { Tags, Toggl } from 'toggl-track';
import { entry } from '../types/entry.js';
import fs from "fs";
import dayjs, { Dayjs } from 'dayjs';
import { activity } from '../types/activity.js';
import duration from "dayjs/plugin/duration.js";
import { compareActivities } from '../Helpers/activityHelper.js';
import { sumTime } from '../Helpers/entryHelper.js';
import { getAnkiCardReviewCount, getMatureCards, getRetention } from "../anki/db.js";
import { buildMessage } from '../Helpers/buildMessage.js';
import { getConfig } from '../Helpers/getConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { CacheManager } from '../Helpers/cache.js';
import { HHMMSS } from '../consts/time.js';


dayjs.extend(duration)

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const toggl = new Toggl({
    auth: {
        token: getConfig().toggl.togglToken ?? "",
    },
});

const ignore = (tags:string[]) => ["aplignore", "ignore", "autoprogresslogignore"].some(x => tags.map(x => x.toLowerCase()).includes(x))

export async function runGeneration(){
    const startCache = CacheManager.peek()
    const lastGenerated = dayjs(startCache.lastGenerated);

    // Toggl stuff
    const entries:entry[] = await toggl.timeEntry.list();
    const entriesAfterLastGen = entries.filter(x => {
        const formattedTags = x.tags.map(x => (x as string).toLowerCase());
        
        if(ignore(formattedTags)) return false
        if(x.stop == null) return false;

        return dayjs(x.stop).isAfter(lastGenerated)
    })

    const uniqueEvents:string[] = [...new Set(entriesAfterLastGen.map(x => x.description))]
    const allEvents = uniqueEvents.map(function(evt) {
        const correspondingEntries = entriesAfterLastGen.filter(x => x.description == evt)
        const activityTime = sumTime(correspondingEntries)
        const ret:activity = {
            activityTitle: evt,
            activityDurationHR: dayjs.duration(activityTime, 'second').format(HHMMSS) + "",
            activitySeconds: activityTime
        }
        return ret;
    }).sort(compareActivities).reverse()


    let count:null|number = null;
    let mature:null|number = null;
    let retention:null|number = null;

    // Anki stuff
    const config = getConfig();
    count = await getAnkiCardReviewCount(lastGenerated, config.anki.ankiIntegration);
    mature = await getMatureCards(config.anki.ankiIntegration);
    retention = await getRetention(config.anki.options?.retentionMode, config.anki.ankiIntegration);
       
    const timeToAdd = sumTime(entriesAfterLastGen)

    // Build message
    const ans = buildMessage({
        reviewCount: count,
        matureCount: mature,
        retention: retention
    }, allEvents, startCache, timeToAdd);

    // Output
    CacheManager.push(ans.cache)
    // const outputPath = path.join(__dirname, "..", "output", `${(getConfig().outputOptions.outputFileName ?? "output")} #${startCache.reportNo + 1}.txt`)
    // fs.writeFileSync(outputPath , ans.message);
}