import { Toggl } from 'toggl-track';
import { entry } from '../types/entry';
import fs from "fs";
import { cache } from '../types/cache';
import dayjs, { Dayjs } from 'dayjs';
import { activity } from '../types/activity';
import duration from "dayjs/plugin/duration";
import { compareActivities } from '../Helpers/activityHelper';
import { sumTime } from '../Helpers/entryHelper';
import { Client, TextChannel } from 'discord.js-selfbot-v13';
import { getAnkiCardReviewCount } from "../anki/db";
import { buildMessage } from '../Helpers/buildMessage';

export const cache_location:string = "./cache/cache.json";

export const toggl = new Toggl({
    auth: {
        token: process.env.TOGGL_TRACK_API_TOKEN ?? "",
    },
});

export async function runGeneration(isDev = true){
    fs.writeFileSync("./lolux.txt", process.argv[2] + "Started running program but never finished...");
    dayjs.extend(duration)
    const startCache:cache = JSON.parse(fs.readFileSync(cache_location).toString())
    const lastGenerated = dayjs(startCache.lastGenerated);

    // Toggl stuff
    const entries:entry[] = await toggl.timeEntry.list();
    const entriesAfterLastGen = entries.filter(x => dayjs(x.start).isAfter(lastGenerated))

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


    // Anki stuff
    const count = await getAnkiCardReviewCount(lastGenerated);
    const client = new Client();
    const timeToAdd = sumTime(entriesAfterLastGen)

    // Build message
    const ans = buildMessage(count, allEvents, startCache, timeToAdd);

    // Output
    if(!isDev){
        client.on('ready', async () => {
            (client.channels.cache.get("1051583420955897967") as TextChannel).send(ans.message)
            console.log(`Sent message!`);
        })

        client.login(process.env.DISCORD_TOKEN);
        //fs.writeFileSync(cache_location, JSON.stringify(ans.cache))
    }
    else{
        fs.writeFileSync("./lolux.txt", process.argv[2] + "Generated at " + dayjs().toString() + "\n\n" + ans.message);
    }

}