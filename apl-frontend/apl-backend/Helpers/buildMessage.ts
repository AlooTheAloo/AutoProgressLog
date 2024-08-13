import dayjs from "dayjs";
import { activity } from "../types/activity.js";
import { cache } from "../types/cache.js";
import { getConfig } from "./getConfig.js";
import { abbreviateNumber } from "js-abbreviation-number";
import { HHMMSS, roundSecondsToHours } from "../consts/time.js";
import { addS } from "./stringHelper.js";

interface ankiData {
    reviewCount:number|null,
    matureCount:number|null,
    retention:number|null
}


const fire_streak = 100;
const fire = (time:number) => time > fire_streak ?  '🔥' : ''

export function buildMessage(count:ankiData, allEvents:activity[], cache:cache, timeToAdd:number) {
    let message = `**Progress report #${cache.reportNo + 1}**\n\n\`\`\``

    if(allEvents.length == 0){
        message += "No Immersion since last report. Resetting streak."
    }
    else{
        message += "Immersion report :\n";
        allEvents.forEach(element => {
            message += "- " + element.activityTitle + " - " + element.activityDurationHR + "\n";
        });
    
        message += "Total immersion time since last report : " + dayjs.duration(timeToAdd * 1000).format(HHMMSS)    
    }

    if(getConfig().anki.enabled){
        message += "\n\n";
        if(count == null){
            message += "Anki stats could not be loaded. Freezing streak for now."
        }
        else if (count.reviewCount == 0){
            message += `Anki not done since last report. Resetting streak.`
        }
        else{
            message += `Anki done ✅`
        }
    }
    

    const newCache:cache = {
        totalSeconds: cache.totalSeconds + timeToAdd,
        lastGenerated: dayjs().toString(),
        cardsStudied: cache.cardsStudied + (count.reviewCount ?? 0),
        ankiStreak: count == null ? cache.ankiStreak : (count.reviewCount == 0 ? 0 : cache.ankiStreak + 1),
        immersionStreak: allEvents.length == 0 ? 0 : cache.immersionStreak + 1,
        reportNo: cache.reportNo + 1,
        mature: count.matureCount ?? cache.mature,
        retention : count.retention ?? cache.retention
    }
    const hoursNew = roundSecondsToHours(newCache.totalSeconds);
    const hoursOld = roundSecondsToHours(cache.totalSeconds);
    message += [
        `\n\nAll time stats :`,
        `\nTotal immersion time - Approx. ${addS(hoursNew, 'hour')} ${Math.floor(hoursNew / 100) > Math.floor(hoursOld / 100) ? `🎉 (${Math.floor(hoursNew / 100) * 100} hour milestone ! )` : ''}`,
        `\nImmersion Streak - ${addS(newCache.immersionStreak, "report")} ${fire(newCache.immersionStreak)}`
    ].join("");
    
    if(getConfig().anki.enabled){
        message += [
            `\nTotal cards reviewed - ${abbreviateNumber(newCache.cardsStudied, 2)}`,
            `\nAnki Streak - ${addS(newCache.ankiStreak, "report")} ${fire(newCache.ankiStreak)}`
        ].join("");
    }
    message += "```"
    return {
        message: message,
        cache: newCache
    }  

}