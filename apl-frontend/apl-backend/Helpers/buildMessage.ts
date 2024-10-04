import { activity, relativeActivity } from "../types/activity.js";
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
    width: 2000 * options.outputQuality,
    height: 1718,
    deviceScaleFactor: options.outputQuality
    })    
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

const MOVING_AVERAGE_SIZE = 7;

export function buildJSON(ankiData:ankiData, allEvents:relativeActivity[], lastCaches:cache[], timeToAdd:number):ReportData{
    const date = dayjs();
    const reportNo = lastCaches[0].reportNo + 1;

    const ankiStreak = lastCaches[0].ankiStreak + (ankiData.reviewCount == 0 ? (-lastCaches[0].ankiStreak) : 1);
    const immersionStreak = lastCaches[0].immersionStreak + (timeToAdd == 0 ? (-lastCaches[0].immersionStreak) : 1);


    let lastnElements = lastCaches.slice(0, MOVING_AVERAGE_SIZE);
    const oldAverage = lastnElements.reduce((a, b) => a + b.seconds, 0) / lastnElements.length

    const newSeven = [...lastCaches.slice(0, MOVING_AVERAGE_SIZE - 1).map(x => (x.seconds)), timeToAdd];
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
                    value: x.cardsStudied ?? 0,
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
                    value: x.seconds ?? 0,
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
        lastDaysPoints: cumulativeSum([
            TotalScore,
            ...lastCaches.slice(0, 9).filter(x => x.reportNo != 0).map(x => x.score)
        ].reverse())
    }
    return reportData;
}

function cumulativeSum<T extends number>(arr: T[]): T[] {
    return arr.reduce((acc: T[], curr: T, index: number) => {
        const sum = index === 0 ? curr : (acc[index - 1] + curr as T);
        acc.push(sum);
        return acc;
    }, []);
}

export function buildNewCache(reportData:ReportData, startCache:cache, timeToAdd:number){

    const newCache:cache = {
        totalSeconds: startCache.totalSeconds + timeToAdd,
        generationTime: dayjs().toISOString(),
        totalCardsStudied: reportData.totalReviews.current,
        ankiStreak: reportData.AnkiStreak.current,
        immersionStreak: reportData.ImmersionStreak.current,
        reportNo: reportData.reportNo,
        mature: reportData.matureCards[0].matureCardCount,
        retention : reportData.retentionRate.current,
        score: reportData.TotalScore,
        seconds: timeToAdd,
        cardsStudied: reportData.totalReviews.delta,
    }
    return newCache;
}