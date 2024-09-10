import { activity } from "../types/activity.js";
import { cache } from "../types/cache.js";
import path from "path"
import puppeteer from 'puppeteer';  
import { fileURLToPath } from "url";
import { ReportData } from "../types/reportdata.js";
import dayjs from "dayjs";
import { roundTo } from "round-to";
import { outputOptions } from "../types/options.js";

interface ankiData {
    reviewCount:number,
    matureCount:number,
    retention:number
}

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export async function buildImage(options:outputOptions){
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

    await page.goto(`file:${path.join(__dirname, "..", "..", "apl-backend", "apl-visuals", "visuals", "index.html")}`);
    await page.waitForNetworkIdle();

    await page.screenshot({
    path: `${options.outputFile.name}${options.outputFile.extension}`,
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

export function buildJSON(ankiData:ankiData, allEvents:activity[], lastCaches:cache[], timeToAdd:number):ReportData{
    const date = dayjs();
    const reportNo = lastCaches[0].reportNo + 1;

    const ankiStreak = lastCaches[0].ankiStreak + (ankiData.reviewCount == 0 ? (-lastCaches[0].ankiStreak) : 1);
    const immersionStreak = lastCaches[0].immersionStreak + (timeToAdd == 0 ? (-lastCaches[0].ankiStreak) : 1);


    const lastSeven = lastCaches.slice(0, 7);
    const oldAverage = lastSeven.reduce((a, b) => a + b.seconds, 0) / lastSeven.length
    const newSeven = [...lastCaches.slice(0, 6).map(x => x.seconds), timeToAdd];
    const newAverage = newSeven.reduce((a, b) => a + b, 0) / newSeven.length;

    const ImmersionScore = timeToAdd;
    const AnkiScore = ankiData.reviewCount;
    const TotalScore = (timeToAdd + ankiData.reviewCount);


    const reportData:ReportData = {
        reportNo: reportNo,
        time: `Generated on the ${date.format('Do')} of ${date.format('MMMM').toLowerCase()} ${date.format('YYYY')} at ${date.format('HH:mm')}`,
        matureCards: [
            {
                reportNo: reportNo,
                matureCardCount: ankiData.matureCount
            },
            ...lastCaches.slice(0, 4).filter(x => x.reportNo != 0).map(x => {
                return {
                    reportNo: x.reportNo,
                    matureCardCount: x.mature
                }
            })
        ],
        retentionRate: {
            current: ankiData.retention,
            delta: ankiData.retention - lastCaches[0].retention
        },
        totalReviews: {
            current: ankiData.reviewCount + lastCaches[0].totalCardsStudied,
            delta: ankiData.reviewCount
        },
        AnkiStreak: {
            current: ankiStreak,
            delta: ankiStreak - lastCaches[0].ankiStreak
        },
        AnkiData: [
            {
                reportNo: reportNo,
                value: ankiData.reviewCount
            },
            ...lastCaches.slice(0, 24).filter(x => x.reportNo != 0).map(x => {
                return {
                    reportNo: x.reportNo,
                    value: x.cardsStudied,
                }
            }),
        ],
        ImmersionTime: {
            current: Math.floor((timeToAdd + lastCaches[0].totalSeconds) / 3600),
            delta: Math.floor((timeToAdd + lastCaches[0].totalSeconds) / 3600) - Math.floor(lastCaches[0].totalSeconds / 3600)
        },
        AverageImmersionTime: {
            current: newAverage,
            delta: newAverage - oldAverage
        },
        ImmersionLog: allEvents,
        ImmersionData: [
            {
                reportNo: reportNo,
                value: timeToAdd
            },
            ...lastCaches.slice(0, 24).filter(x => x.reportNo != 0).map(x => {
                return {
                    reportNo: x.reportNo,
                    value: x.seconds,
                }
            })  
        ],
        ImmersionStreak: {
            current: immersionStreak,
            delta: immersionStreak - lastCaches[0].immersionStreak
        },
        ImmersionScore: ImmersionScore,
        AnkiScore: AnkiScore,
        TotalScore: TotalScore,
        UserRanking: "",
        lastDaysPoints: [
            TotalScore,
            ...lastCaches.slice(0, 9).filter(x => x.reportNo != 0).map(x => x.score)
        ]
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
    //     totalCardsStudied: cache.totalCardsStudied + (count.reviewCount ?? 0),
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
    //         `\nTotal cards reviewed - ${abbreviateNumber(newCache.totalCardsStudied, 2)}`,
    //         `\nAnki Streak - ${addS(newCache.ankiStreak, "report")}`
    //     ].join("");
    // }
    // message += "```"
    // return {
    //     message: message,
    //     cache: newCache
    // }  

}