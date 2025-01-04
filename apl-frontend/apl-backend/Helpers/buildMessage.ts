import { activity, relativeActivity } from "../types/activity.js";
import { cache } from "../types/cache.js";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { ReportData, TPlusDelta } from "../types/reportdata.js";
import dayjs from "dayjs";
import { roundTo } from "round-to";
import { outputOptions } from "../types/options.js";
import { arithmeticWeightedMean } from "./util.js";
import { getConfig } from "./getConfig.js";
import color from "color";
import { GetImmersionTimeSince } from "./DataBase/SearchDB.js";

interface ankiData {
  reviewCount: number;
  matureCount: number;
  retention: number;
}

const MATURE_HISTORY = 6;
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export async function buildImage(
  options: outputOptions,
  height: number = 1775,
  reportNo: number
) {
  const outputPath = `${options.outputFile.path}${path.sep}${options.outputFile.name} ${reportNo}${options.outputFile.extension}`;
  const browser = await puppeteer.launch({
    headless: true,
    devtools: true,
    args: [
      "--disable-web-security",
      "--disable-features=IsolateOrigins",
      "--disable-site-isolation-trials",
    ],
  });
  const page = await browser.newPage();
  page.setViewport({
    width: 2000 * options.outputQuality,
    height: 5000,
    deviceScaleFactor: options.outputQuality,
  });
  await page.goto(
    `file:${path.join(
      __dirname,
      "..",
      "..",
      "apl-backend",
      "apl-visuals",
      "visuals",
      "index.html"
    )}`
  );
  await page.waitForNetworkIdle();

  await page.screenshot({
    path: outputPath,
    type: "png",
    clip: {
      width: 1586,
      height: height,
      x: 0,
      y: 0,
    },
  });
  await browser.close();
  return outputPath;
}

const MOVING_AVERAGE_SIZE = 7;

interface builderDTO {
  timeToAdd: number;
  monthTime: number;
  bestSeconds: TPlusDelta<number>;
}

export function buildJSON(
  ankiData: ankiData,
  allEvents: relativeActivity[],
  lastCaches: cache[],
  builderDTO: builderDTO
): ReportData {
  const date = dayjs();
  const lastCache = lastCaches[0];
  const reportNo = lastCache.reportNo + 1;

  let ankiDelta: number;
  let ankiStreak: number;
  let ankiScore: number;

  if (getConfig().anki.enabled) {
    ankiDelta = ankiData.reviewCount - lastCache.totalCardsStudied;
    ankiStreak =
      lastCache.ankiStreak + (ankiDelta == 0 ? -lastCache.ankiStreak : 1);
    ankiScore =
      ankiDelta +
      (reportNo == 1
        ? 0
        : Math.max(ankiData.matureCount - lastCache.mature, 0) * 100);
  }

  const immersionStreak =
    lastCache.immersionStreak +
    (builderDTO.timeToAdd == 0 ? -lastCache.immersionStreak : 1);

  let lastnElements = lastCaches
    .slice(0, MOVING_AVERAGE_SIZE)
    .map((x) => x.seconds);
  const oldAverage = arithmeticWeightedMean(lastnElements);

  const newnElements = [
    builderDTO.timeToAdd,
    ...lastnElements.slice(0, lastnElements.length - 1),
  ];
  const newAverage = arithmeticWeightedMean(newnElements);

  const ImmersionScore = builderDTO.timeToAdd;
  const TotalScore = ImmersionScore + ankiScore;

  const reportData: ReportData = {
    reportNo: reportNo,
    time: `Generated on the ${date.format("Do")} of ${date
      .format("MMMM")
      .toLowerCase()} ${date.format("YYYY")} at ${date.format("HH:mm")}`,
    matureCards: [
      {
        reportNo: reportNo,
        matureCardCount: ankiData.matureCount,
      },
      ...lastCaches
        .slice(0, MATURE_HISTORY - 1)
        .filter((x) => x.reportNo != 0)
        .map((x) => {
          return {
            reportNo: x.reportNo,
            matureCardCount: x.mature,
          };
        }),
    ],
    retentionRate: {
      current: ankiData.retention,
      delta: ankiData.retention - lastCache.retention,
    },
    totalReviews: {
      current: ankiData.reviewCount,
      delta: ankiDelta,
    },
    AnkiStreak: {
      current: ankiStreak,
      delta: ankiStreak - lastCache.ankiStreak,
    },
    AnkiData: [
      {
        reportNo: reportNo,
        value: ankiDelta,
      },
      ...lastCaches
        .slice(0, 24)
        .filter((x) => x.reportNo != 0)
        .map((x) => {
          return {
            reportNo: x.reportNo,
            value: x.cardsStudied ?? 0,
          };
        }),
    ],
    ImmersionTime: {
      current: Math.floor(
        (builderDTO.timeToAdd + lastCache.totalSeconds) / 3600
      ),
      delta:
        Math.floor((builderDTO.timeToAdd + lastCache.totalSeconds) / 3600) -
        Math.floor(lastCache.totalSeconds / 3600),
    },
    AverageImmersionTime: {
      current: newAverage,
      delta: newAverage - oldAverage,
    },
    MonthlyImmersion: builderDTO.monthTime,
    BestImmersion: builderDTO.bestSeconds,
    ImmersionLog: allEvents,
    ImmersionData: [
      {
        reportNo: reportNo,
        value: builderDTO.timeToAdd,
      },
      ...lastCaches
        .slice(0, 24)
        .filter((x) => x.reportNo != 0)
        .map((x) => {
          return {
            reportNo: x.reportNo,
            value: x.seconds ?? 0,
          };
        }),
    ],
    ImmersionStreak: {
      current: immersionStreak,
      delta: immersionStreak - lastCache.immersionStreak,
    },
    ImmersionScore: ImmersionScore,
    AnkiScore: ankiScore,
    TotalScore: TotalScore,
    lastDaysPoints: cumulativeSum(
      [
        TotalScore,
        ...lastCaches
          .slice(0, 9)
          .filter((x) => x.reportNo != 0)
          .map((x) => x.score),
      ].reverse()
    ),
  };
  return reportData;
}

const LAYOUT_FULL = [
  ["mature", "ankidata", "ankistreak"],
  ["immersiondata", "immersionlog", "immersionstreak"],
];

const LAYOUT_ANKILESS = [
  ["immersionlog", "immersiondata"],
  ["immersiondata", "immersionstreak"],
];

export async function buildLayout() {
  let gradient: string[] = [];
  try {
    const seedList = [
      [255, 0, 0],
      [97, 250, 151],
      [116, 180, 255],
      [0, 0, 255],
      [12, 255, 15],
      [0, 100, 200],
      [0, 255, 0],
      [255, 165, 0],
    ];
    const r = Math.random() * seedList.length;
    const seed = Math.floor(r);
    const input = [seedList[seed], "N", "N"];
    const ans = await fetch("http://colormind.io/api/", {
      method: "POST",
      body: JSON.stringify({
        model: "ui",
        input: input,
      }),
    });
    const colors: number[][] = (await ans.json()).result;
    gradient = colors.map((x) => color(x).hex()).slice(0, 3);
  } catch (err) {
    console.log(err);
    gradient = ["#FF0000", "#D57AFF", "#74B4FF"];
  }

  if (getConfig().anki.enabled) {
    return {
      layout: LAYOUT_FULL,
      gradient: gradient,
    };
  } else {
    return {
      layout: LAYOUT_ANKILESS,
      gradient: gradient,
    };
  }
}

function cumulativeSum<T extends number>(arr: T[]): T[] {
  return arr.reduce((acc: T[], curr: T, index: number) => {
    const sum = index === 0 ? curr : ((acc[index - 1] + curr) as T);
    acc.push(sum);
    return acc;
  }, []);
}

export function buildNewCache(
  reportData: ReportData,
  startCache: cache,
  timeToAdd: number,
  syncID: number,
  path: string,
  bestSeconds: number
) {
  const newCache: cache = {
    totalSeconds: startCache.totalSeconds + timeToAdd,
    generationTime: dayjs().toISOString(),
    totalCardsStudied: reportData.totalReviews.current,
    ankiStreak: reportData.AnkiStreak.current,
    immersionStreak: reportData.ImmersionStreak.current,
    reportNo: reportData.reportNo,
    mature: reportData.matureCards[0].matureCardCount,
    retention: reportData.retentionRate.current,
    score: reportData.TotalScore,
    seconds: timeToAdd,
    bestSeconds: bestSeconds,
    cardsStudied: reportData.totalReviews.delta,
    syncID: syncID,
    path: path,
  };
  return newCache;
}
