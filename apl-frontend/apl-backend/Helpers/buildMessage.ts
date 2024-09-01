import { activity } from "../types/activity.js";
import { cache } from "../types/cache.js";
import path from "path"
import puppeteer from 'puppeteer';  
import { fileURLToPath } from "url";
import { ReportData } from "../types/reportdata.js";
import dayjs from "dayjs";

interface ankiData {
    reviewCount:number|null,
    matureCount:number|null,
    retention:number|null
}

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export async function buildImage(){
    const browser = await puppeteer.launch({
    headless: true,
    devtools: true,
    args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials'
    ]
    });
    const page = await browser.newPage();
    page.setViewport({
    width: 2000,
    height: 1718,
    deviceScaleFactor: 1
    })    
    page
        .on('console', message =>
        console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()} ${JSON.stringify(message.stackTrace())}`))
        .on('pageerror', ({ message }) => console.log(message))
        .on('response', response =>
        console.log(`${response.status()} ${response.url()}`))

    await page.goto(`file:${path.join(__dirname, "..", "apl-visuals", "dist", "index.html")}`);
    await page.waitForNetworkIdle();

    await page.screenshot({
    path: 'report.png',
    type: "png",
    clip: {
        width: 1586,
        height: 1718,
        x : 0,
        y : 0
    }
    });    
    await browser.close();    
}

export function buildJSON(count:ankiData, allEvents:activity[], lastCaches:cache[], timeToAdd:number):ReportData{
    const date = dayjs();
    console.log(lastCaches);
    const reportData:ReportData = {
        reportNo: lastCaches[0].reportNo + 1,
        time: `Generated on the ${date.format('Do')} of ${date.format('MMMM').toLowerCase()} ${date.format('YYYY')} at ${date.format('h:mm')}`,
        matureCards: [],
        retentionRate: {
            current: 0,
            delta: 0
        },
        totalReviews: {
            current: 0,
            delta: 0
        },
        AnkiStreak: {
            current: 0,
            delta: 0
        },
        AnkiData: [],
        ImmersionTime: {
            current: 0,
            delta: 0
        },
        AverageImmersionTime: {
            current: 0,
            delta: 0
        },
        ImmersionLog: [],
        ImmersionData: [],
        ImmersionScore: 0,
        AnkiScore: 0,
        StreakMultiplier: 0,
        TotalScore: 0,
        UserRanking: "",
        lastDaysPoints: []
    }

    return reportData;
}


export function buildMessage(count:ankiData, allEvents:activity[], cache:cache, timeToAdd:number) {
    return "when mom find the poop socks";
    // let message = `**Progress report #${cache.reportNo + 1}**\n\n\`\`\``

    // if(allEvents.length == 0){
    //     message += "No Immersion since last report. Resetting streak."
    // }
    // else{
    //     message += "Immersion report :\n";
    //     allEvents.forEach(element => {
    //         message += "- " + element.activityTitle + " - " + element.activityDurationHR + "\n";
    //     });
    
    //     message += "Total immersion time since last report : " + dayjs.duration(timeToAdd * 1000).format(HHMMSS)    
    // }

    // if(getConfig().anki.enabled){
    //     message += "\n\n";
    //     if(count == null){
    //         message += "Anki stats could not be loaded. Freezing streak for now."
    //     }
    //     else if (count.reviewCount == 0){
    //         message += `Anki not done since last report. Resetting streak.`
    //     }
    //     else{
    //         message += `Anki done ✅`
    //     }
    // }
    

    // const newCache:cache = {
    //     totalSeconds: cache.totalSeconds + timeToAdd,
    //     generationTime: dayjs().toString(),
    //     cardsStudied: cache.cardsStudied + (count.reviewCount ?? 0),
    //     ankiStreak: count == null ? cache.ankiStreak : (count.reviewCount == 0 ? 0 : cache.ankiStreak + 1),
    //     immersionStreak: allEvents.length == 0 ? 0 : cache.immersionStreak + 1,
    //     reportNo: cache.reportNo + 1,
    //     mature: count.matureCount ?? cache.mature,
    //     retention : count.retention ?? cache.retention
    // }
    // const hoursNew = roundSecondsToHours(newCache.totalSeconds);
    // const hoursOld = roundSecondsToHours(cache.totalSeconds);
    // message += [
    //     `\n\nAll time stats :`,
    //     `\nTotal immersion time - Approx. ${addS(hoursNew, 'hour')} ${Math.floor(hoursNew / 100) > Math.floor(hoursOld / 100) ? `🎉 (${Math.floor(hoursNew / 100) * 100} hour milestone ! )` : ''}`,
    //     `\nImmersion Streak - ${addS(newCache.immersionStreak, "report")}`
    // ].join("");
    
    // if(getConfig().anki.enabled){
    //     message += [
    //         `\nTotal cards reviewed - ${abbreviateNumber(newCache.cardsStudied, 2)}`,
    //         `\nAnki Streak - ${addS(newCache.ankiStreak, "report")}`
    //     ].join("");
    // }
    // message += "```"
    // return {
    //     message: message,
    //     cache: newCache
    // }  

}