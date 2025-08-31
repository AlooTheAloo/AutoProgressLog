import dayjs from "dayjs";
import { ListOf, cache, cacheList, isList } from "../types/cache.js";
import fs from "fs";
import { SemVer, parse } from "semver";
import { Version, appVersion } from "../consts/versioning.js";
import { cache_location } from "./getConfig.js";
import { Logger } from "./Log.js";

// TODO: THIS ENTIRE THING GOTTA GO
export class CacheManager {
  static setVersion = (version: string) => {
    this.set(
      {
        list: this.get().list,
      },
      version
    );
  };

  static SemVer = () => {
    return new SemVer(this.get(false).version ?? "0.0.0");
  };

  static verifyVersion = () => {
    return this.SemVer().compare(appVersion) == 0;
  };

  static exists = fs.existsSync(cache_location);
  static init = (time: number, cards: number) => {
    Logger.log(`Initializing cache manager`);
    this.set({
      list: [
        {
          seconds: time,
          totalSeconds: time,
          generationTime: dayjs().startOf("day").toISOString(),
          totalCardsStudied: cards,
          cardsStudied: cards,
          ankiStreak: 0,
          immersionStreak: 0,
          reportNo: 0,
          mature: 0,
          retention: 0,
          score: 0,
          syncID: 0,
          path: "",
          bestSeconds: 0,
        },
      ],
    });
  };

  static peek = () => {
    const top = this.get().list.at(-1);
    if (top == undefined) {
      throw new RangeError("Cache list is empty");
    }

    return top;
  };

  static getLastN = (n: number) => {
    const cacheList = this.get();
    return cacheList.list.slice(-n).reverse();
  };

  static pop = () => {
    const cacheList = this.get();
    const list = cacheList.list;
    const poppedValue = list.pop();
    this.set({ list: list });
    return poppedValue;
  };

  static push = (items: cache | cacheList) => {
    const list = this.get().list;
    if (isList(items)) {
      list.push(...items.list);
    } else list.push(items);

    this.set({ list: list });
  };

  public static set = (list: ListOf<cache>, version: Version = appVersion) => {
    const cacheList: cacheList = {
      list: list.list,
      version: version,
    };
    fs.writeFileSync(cache_location, JSON.stringify(cacheList));
  };

  public static get = (createIfNull = true): cacheList => {
    if (!fs.existsSync(cache_location))
      return { list: [], version: appVersion };
    return JSON.parse(fs.readFileSync(cache_location).toString());
  };
}
