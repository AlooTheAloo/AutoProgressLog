import { Tags, Toggl } from 'toggl-track';
import { entry } from '../types/entry.js';
import dayjs, { Dayjs } from 'dayjs';
import { activity } from '../types/activity.js';
import duration from "dayjs/plugin/duration.js";
import { sumTime } from '../Helpers/entryHelper.js';
import { getAnkiCardReviewCount, getMatureCards, getRetention } from "../anki/db.js";
import { buildImage, buildJSON, buildLayout, buildNewCache } from '../Helpers/buildMessage.js';
import { getConfig, getSyncProps } from '../Helpers/getConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { CacheManager } from '../Helpers/cache.js';
import advancedFormat from 'dayjs/plugin/advancedFormat' 
import { writeFileSync } from 'fs';
import { GetImmersionSourcesSince, GetImmersionTimeSince } from '../Helpers/DataBase/SearchDB.js';
import { runSync } from './sync.js';

dayjs.extend(duration)
dayjs.extend(advancedFormat)

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);


export async function runGeneration(){

    await runSync(false, getSyncProps());
    
    const startCache = CacheManager.peek()
    const generationTime = dayjs(startCache.generationTime);


    // Toggl stuff
    const events = await GetImmersionSourcesSince(generationTime);

    let count:null|number = null;
    let mature:null|number = null;
    let retention:null|number = null;

    // Anki stuff
    const config = getConfig();

    if(config.anki.enabled){
        count = await getAnkiCardReviewCount(generationTime, config.anki.ankiIntegration);
        mature = await getMatureCards(config.anki.ankiIntegration);
        retention = await getRetention(config.anki.options.retentionMode, config.anki.ankiIntegration);
    }
       
    const timeToAdd = sumTime(events)
    const json = buildJSON(
    {
        reviewCount: count,
        matureCount: mature,
        retention: retention
    }, events, CacheManager.getLastN(30), timeToAdd);

    const layout = await buildLayout();
    console.log(layout);
    const p = path.join(__dirname, "..", "..", "apl-backend", "apl-visuals", "visuals");

    // Report Data
    const reportPath = path.join(p, "report-data.json")
    writeFileSync(reportPath, JSON.stringify(json));

    const layoutPath = path.join(p, "report-layout.json")
    writeFileSync(layoutPath, JSON.stringify(layout));
    
    buildImage(config.outputOptions, config.anki.enabled ? 1718 : 1300);

    // Output
    CacheManager.push(buildNewCache(json, startCache, timeToAdd));
    return await runSync(true, getSyncProps());
}