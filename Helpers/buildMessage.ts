import dayjs from "dayjs";
import { activity } from "../types/activity.js";import { cache } from "../types/cache.js";
import { getConfig } from "./getConfig.js";
import { abbreviateNumber } from "js-abbreviation-number";

const fire_streak = 10;

export function buildMessage(count:number|null, allEvents:activity[], cache:cache, timeToAdd:number) {
    let message = `**Progress report #${cache.reportNo}**\n\n`

    if(allEvents.length == 0){
        message += "No Immersion since last report. Resetting streak."
    }
    else{
        message += "Immersion report :\n";
        allEvents.forEach(element => {
            message += "- " + element.activityTitle + " - " + element.activityDurationHR + "\n";
        });
    
        message += "Total immersion time since last report : " + dayjs.duration(timeToAdd * 1000).format("HH:mm:ss")    
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

    message += `\n\nAll time stats :\nTotal immersion time - Approx. ${Math.round(newCache.totalSeconds / 3600)} hours
Immersion Streak - ${ newCache.immersionStreak + " report" + (newCache.immersionStreak != 1 ? "s" : "") + (newCache.immersionStreak > fire_streak ? "🔥" : "") }`
    
    if(getConfig().anki.enabled){
        message += `\nTotal cards reviewed - ${abbreviateNumber(newCache.cardsStudied)}
Anki Streak - ${ newCache.ankiStreak + " report" + (newCache.ankiStreak != 1 ? "s" : "") + (newCache.ankiStreak > fire_streak ? "🔥" : "") }`
    }

    message += "\n\n*ᴛʜɪs ᴘʀᴏɢʀᴇss ʀᴇᴘᴏʀᴛ ᴡᴀs ᴀᴜᴛᴏ-ɢᴇɴᴇʀᴀᴛᴇᴅ ʙʏ ᴀᴜᴛᴏᴘʀᴏɢʀᴇssʟᴏɢ. ɪ ᴡʟʟ ᴍᴀᴋᴇ ɪᴛ ᴏᴘᴇɴ sᴏᴜʀᴄᴇ ᴇᴠᴇɴᴛᴜᴀʟʟʏ ᴡʜᴇɴ ɪ ʜᴀᴠᴇ ᴛʜᴇ ᴛɪᴍᴇ*"
    return {
        message: message,
        cache: newCache
    }  

}