import dayjs from 'dayjs';
import duration from "dayjs/plugin/duration.js";
import { sumTime } from '../Helpers/entryHelper.js';
import { getMatureCards, getRetention } from "../anki/db.js";
import { buildImage, buildJSON, buildLayout, buildNewCache } from '../Helpers/buildMessage.js';
import { getConfig, getSyncProps } from '../Helpers/getConfig.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { CacheManager } from '../Helpers/cache.js';
import advancedFormat from 'dayjs/plugin/advancedFormat' 
import { writeFileSync } from 'fs';
import { GetImmersionSourcesSince, GetImmersionTimeSince, GetLastEntry } from '../Helpers/DataBase/SearchDB.js';
import { runSync, setSyncing } from './sync.js';
import { Notification, shell } from 'electron';
import { get } from 'http';
import { TPlusDelta } from '../types/reportdata.js';

dayjs.extend(duration)
dayjs.extend(advancedFormat)

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);


export async function runGeneration(){


    await runSync(false, getSyncProps(), false);
    setSyncing(true);
    const sync = await GetLastEntry("Full");
    if(sync == undefined) return;
    const syncID = sync.id;
    

    const startCache = CacheManager.peek()
    const generationTime = dayjs(startCache.generationTime);

    // Toggl stuff
    const events = await GetImmersionSourcesSince(generationTime);

    let count:null|number = null;
    let mature:null|number = null;
    let retention:null|number = null;

    // Anki stuff
    const config = getConfig();

    if(config == undefined) return;

    if(config.anki.enabled && config.anki.ankiIntegration && sync.anki && config.anki.options){
        count = sync.anki.totalCardsStudied
        mature = await getMatureCards(config.anki.ankiIntegration);
        retention = await getRetention(config.anki.options.retentionMode, config.anki.ankiIntegration);
    }

    const timeToAdd = sumTime(events)
    const monthTime = await GetImmersionTimeSince(dayjs().startOf("month"));
    const oldBest = startCache.bestSeconds;
    const newBest = Math.max(timeToAdd, oldBest);
    const bestObject:TPlusDelta<number> = { 
        current: newBest,
        delta: newBest - oldBest
    }

    const json = buildJSON(
    {
        reviewCount: count ?? 0,
        matureCount: mature ?? 0,
        retention: retention ?? 0
    }, events, CacheManager.getLastN(30), {
        timeToAdd: timeToAdd,
        monthTime: monthTime,
        bestSeconds: bestObject
    });

    const layout = await buildLayout();
    const p = path.join(__dirname, "..", "..", "apl-backend", "apl-visuals", "visuals");

    // Report Data
    const reportPath = path.join(p, "report-data.json")
    writeFileSync(reportPath, JSON.stringify(json));

    const layoutPath = path.join(p, "report-layout.json")
    writeFileSync(layoutPath, JSON.stringify(layout));
    
    const imagePath = await buildImage(config.outputOptions, config.anki.enabled ? 1775 : 1375, json.reportNo);



    const notification = new Notification({title: `Report #${json.reportNo} generated!`,
        body: `Click here to open it in ${process.platform == "darwin" ? "Finder" : "File Explorer"}`});

    notification.on('click', () => {
        shell.showItemInFolder(imagePath);
    })

    notification.show()

    // Output
    CacheManager.push(buildNewCache(json, startCache, timeToAdd, syncID, imagePath, newBest));

    const DTO = await runSync(true, getSyncProps(true));
    setSyncing(false);
    return DTO;
}



