import { Version } from "../consts/versioning";

export interface cache {
  reportNo: number;
  generationTime: string;
  syncID: number;
  path: string;

  seconds: number;
  totalSeconds: number;
  bestSeconds: number;

  cardsStudied: number;
  totalCardsStudied: number;
  mature: number | null;
  retention: number | null;

  ankiStreak: number;
  immersionStreak: number;

  score: number;
}

export type versionInfo = { version: Version };

export type cacheList = ListOf<cache> & versionInfo;

export type ListOf<T extends {}> = {
  list: Array<T>;
};

export function isList<T extends {}>(obj: T | ListOf<T>): obj is ListOf<T> {
  return "list" in obj;
}
