import { relativeActivity } from "../types/activity.js";
import { cache } from "../types/cache.js";
import path from "path";
import puppeteer, { BoundingBox, Page, Puppeteer } from "puppeteer";
import { fileURLToPath } from "url";
import { ReportData, TPlusDelta } from "../types/reportdata.js";
import dayjs from "dayjs";
import { outputOptions, ReportExtension } from "../types/options.js";
import { arithmeticWeightedMean } from "./util.js";
import { getConfig } from "./getConfig.js";
import color from "color";
import { Layout } from "../apl-visuals/src/types/report-data.js";
import { Browser, getInstalledBrowsers } from "@puppeteer/browsers";
import { app } from "electron";

declare global {
  interface Window {
    apl_ReportData: ReportData;
    apl_ReportLayout: Layout;
  }
}

interface ankiData {
  reviewCount: number;
  matureCount: number;
  retention: number;
}

const MATURE_HISTORY = 6;
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export async function getChromiumExecPath() {
  const cachedir = path.join(app.getPath("home"), ".cache", "puppeteer");
  const browsers = await getInstalledBrowsers({
    cacheDir: cachedir,
  });
  return browsers.filter((x) => x.browser == Browser.CHROME).at(0)
    ?.executablePath;
}

export async function buildImage(
  options: outputOptions,
  height: number = 1775,
  reportData: ReportData,
  reportLayout: Layout
) {
  const outputPath = `${options.outputFile.path}${path.sep}${options.outputFile.name} ${reportData.reportNo}${options.outputFile.extension}`;

  const execpath = await getChromiumExecPath();
  console.log("execpath is " + execpath);
  console.log(11.1);
  const browser = await puppeteer.launch({
    headless: true,
    devtools: true,
    args: [
      "--disable-web-security",
      "--disable-features=IsolateOrigins",
      "--disable-site-isolation-trials",
    ],
    executablePath: execpath,
  });

  console.log(11.2);
  const page = await browser.newPage();
  console.log(11.3);

  await page.evaluateOnNewDocument(
    (data, layout) => {
      window.apl_ReportData = data;
      window.apl_ReportLayout = layout;
    },
    reportData,
    reportLayout
  );

  console.log(11.4);

  page.setViewport({
    width: (2000 * options.outputQuality) / 2,
    height: 5000,
    deviceScaleFactor: options.outputQuality / 2,
  });
  console.log(11.5);

  const isDev = process.env.NODE_ENV === "development";

  const visualsPath = isDev
    ? path.join(
        __dirname,
        "..",
        "..",
        "apl-backend",
        "apl-visuals",
        "visuals",
        "index.html"
      )
    : path.join(
        process.resourcesPath,
        "app.asar.unpacked",
        "apl-backend",
        "apl-visuals",
        "visuals",
        "index.html"
      );

  await page.goto(`file:${visualsPath}`);

  console.log(11.6);

  await page.waitForNetworkIdle();
  console.log(11.7);

  await tryScreenshot(
    page,
    outputPath,
    {
      width: 1586,
      height,
      x: 0,
      y: 0,
    },
    extensionToType(options.outputFile.extension)
  );

  console.log(11.8);

  await browser.close();
  console.log(11.9);

  return outputPath;
}
async function tryScreenshot(
  page: Page,
  path: string,
  clip: BoundingBox,
  type: "png" | "jpeg" | "webp" | undefined,
  maxRetries = 3,
  timeoutMs = 5000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await Promise.race([
        page.screenshot({ path, type, clip }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Screenshot timed out")), timeoutMs)
        ),
      ]);
      return; // success
    } catch (err) {
      console.warn(`Screenshot attempt ${i + 1} failed:`, err);
      if (i === maxRetries - 1) throw err;
      await new Promise((res) => setTimeout(res, 1000)); // wait 1 second before retry
    }
  }
}

const extensionToType = (ext: ReportExtension) => {
  if (ext == ".png") return "png";
  if (ext == ".jpg") return "jpeg";
  if (ext == ".jpeg") return "jpeg";
  if (ext == ".webp") return "webp";
};

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
  const options = getConfig();
  if (options == undefined) throw new Error("No config found");

  const date = dayjs();
  const lastCache = lastCaches[0];
  const reportNo = lastCache.reportNo + 1;

  let ankiDelta = 0;
  let ankiStreak = 0;
  let ankiScore = 0;

  if (options.anki.enabled) {
    ankiDelta = ankiData.reviewCount - lastCache.totalCardsStudied;
    ankiStreak =
      lastCache.ankiStreak + (ankiDelta == 0 ? -lastCache.ankiStreak : 1);
    ankiScore =
      ankiDelta +
      (lastCache.mature == 0 || reportNo == 1
        ? 0
        : Math.max(ankiData.matureCount - (lastCache.mature ?? 0), 0) * 100);
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
  const TotalScore = ImmersionScore + (ankiScore ?? 0);

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
            matureCardCount: x.mature ?? 0,
          };
        }),
    ],
    retentionRate: {
      current: ankiData.retention,
      delta: ankiData.retention - (lastCache.retention ?? 0),
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
  ["moreimmersiondata", "immersionstreak"],
];

export type layout = {
  layout: string[][];
  gradient: string[];
};

export async function buildLayout(): Promise<layout | undefined> {
  const config = getConfig();
  if (config == undefined) return;

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

  if (config.anki.enabled) {
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
