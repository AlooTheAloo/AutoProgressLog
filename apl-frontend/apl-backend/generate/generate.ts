import { Tags, Toggl } from 'toggl-track';
import { entry } from '../types/entry.js';
import dayjs, { Dayjs } from 'dayjs';
import { activity } from '../types/activity.js';
import duration from "dayjs/plugin/duration.js";
import { sumTime } from '../Helpers/entryHelper.js';
import { getAnkiCardReviewCount, getMatureCards, getRetention } from "../anki/db.js";
import { buildImage, buildJSON, buildMessage } from '../Helpers/buildMessage.js';
import { getConfig } from '../Helpers/getConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { CacheManager } from '../Helpers/cache.js';
import { HHMMSS } from '../consts/time.js';
import { exec } from 'child_process';
import proc from 'find-process';
import advancedFormat from 'dayjs/plugin/advancedFormat' 
import { LaunchAnki } from '../config/configAnkiIntegration.js';
import { writeFileSync } from 'fs';
import { getTimeEntries } from '../toggl/toggl-service.js';

dayjs.extend(duration)
dayjs.extend(advancedFormat)

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);


export async function runGeneration(){


    
    // Anki stuff
    await LaunchAnki(getConfig().anki.ankiIntegration);
    
    const startCache = CacheManager.peek()
    const generationTime = dayjs(startCache.generationTime);

    // Toggl stuff
    const { entriesAfterLastGen, allEvents } = await getTimeEntries(startCache.generationTime);

    let count:null|number = null;
    let mature:null|number = null;
    let retention:null|number = null;

    // Anki stuff
    const config = getConfig();
    count = await getAnkiCardReviewCount(generationTime, config.anki.ankiIntegration);
    mature = await getMatureCards(config.anki.ankiIntegration);
    retention = await getRetention(config.anki.options?.retentionMode, config.anki.ankiIntegration);
       
    const timeToAdd = sumTime(entriesAfterLastGen)

    const json = buildJSON(
    {
        reviewCount: count,
        matureCount: mature,
        retention: retention
    }, allEvents, CacheManager.getLastN(30), timeToAdd);

    const p = path.join(__dirname, "..", "..", "apl-backend", "apl-visuals", "visuals", "report-data.json")
    
    writeFileSync(p, JSON.stringify(json));
    console.log(config.outputOptions)
    buildImage(config.outputOptions);

    // Output
    // CacheManager.push(ans.cache)
    // const outputPath = path.join(__dirname, "..", "output", `${(getConfig().outputOptions.outputFileName ?? "output")} #${startCache.reportNo + 1}.txt`)
    // fs.writeFileSync(outputPath , ans.message);
}