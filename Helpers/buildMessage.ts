import dayjs from "dayjs";
import { activity } from "../types/activity";
import { cache } from "../types/cache";
import { indicator } from "ordinal";

export function buildMessage(count:number|null, allEvents:activity[], cache:cache, timeToAdd:number) {
    let message = `**Progress report for ${dayjs().format("dddd MMMM DD") + indicator(dayjs().date())}**\n\nImmersion report :\n`

    if(allEvents.length == 0){
        message += "No Immersion today. Resetting streak.\n\n"
    }
    else{
        allEvents.forEach(element => {
            message += "- " + element.activityTitle + " - " + element.activityDurationHR + "\n";
        });
    
        message += "Total immersion time today : " + dayjs.duration(timeToAdd * 1000).format("HH:mm:ss")    
    }

    message += "\n\n";
    if(count == null){
        message += "Anki stats could not be loaded. Freezing streak for today."
    }
    else if (count == 0){
        message += `Anki not done today. Resetting streak.`
    }
    else{
        message += `${count} cards studied on anki`
    }

    const newCache:cache = {
        totalSeconds: cache.totalSeconds + timeToAdd,
        lastGenerated: dayjs().toISOString(),
        cardsStudied: cache.cardsStudied + (count ?? 0),
        ankiStreak: count == null ? cache.ankiStreak : (count == 0 ? 0 : cache.ankiStreak + 1),
        immersionStreak: allEvents.length == 0 ? 0 : cache.immersionStreak + 1
    }

    message += `\n\nAll time stats :\nTotal immersion time - Approx. ${Math.round(newCache.totalSeconds / 3600)} hours
Total cards reviewed - ${newCache.cardsStudied}
Anki Streak - ${ newCache.ankiStreak + " day" + (newCache.ankiStreak != 1 ? "s" : "") + (newCache.ankiStreak > 10 ? "🔥" : "") }
Immersion Streak - ${ newCache.immersionStreak + " day" + (newCache.immersionStreak != 1 ? "s" : "") + (newCache.immersionStreak > 10 ? "🔥" : "") }`

    message += "\n\n*ᴛʜɪs ᴘʀᴏɢʀᴇss ʀᴇᴘᴏʀᴛ ᴡᴀs ᴀᴜᴛᴏ-ɢᴇɴᴇʀᴀᴛᴇᴅ ʙʏ ᴀᴜᴛᴏᴘʀᴏɢʀᴇssʟᴏɢ. ɪ ᴡʟʟ ᴍᴀᴋᴇ ɪᴛ ᴏᴘᴇɴ sᴏᴜʀᴄᴇ ᴇᴠᴇɴᴛᴜᴀʟʟʏ ᴡʜᴇɴ ɪ ʜᴀᴠᴇ ᴛʜᴇ ᴛɪᴍᴇ*"
console.log(message);
    return {
        message: message,
        cache: newCache
    }  

}