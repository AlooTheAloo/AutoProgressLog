import dayjs from "dayjs";
import { activity } from "../types/activity.js";
import { cache } from "../types/cache.js";
import { getConfig } from "./getConfig.js";
import { abbreviateNumber } from "js-abbreviation-number";
import { HHMMSS, roundSecondsToHours } from "../consts/time.js";
import { addS } from "./stringHelper.js";

const fire_streak = 100;
const fire = (time:number) => time > fire_streak ?  '🔥' : ''

export function buildMessage(count:number|null, allEvents:activity[], cache:cache, timeToAdd:number) {
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
        else if (count == 0){
            message += `Anki not done since last report. Resetting streak.`
        }
        else{
            message += `Anki done ✅`
        }
    }
    

    const newCache:cache = {
        totalSeconds: cache.totalSeconds + timeToAdd,
        lastGenerated: dayjs().toISOString(),
        cardsStudied: cache.cardsStudied + (count ?? 0),
        ankiStreak: count == null ? cache.ankiStreak : (count == 0 ? 0 : cache.ankiStreak + 1),
        immersionStreak: allEvents.length == 0 ? 0 : cache.immersionStreak + 1,
        reportNo: cache.reportNo + 1
    }

    message += [
        `\n\nAll time stats :`,
        `\nTotal immersion time - Approx. ${addS(roundSecondsToHours(newCache.totalSeconds), 'hour')}`,
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