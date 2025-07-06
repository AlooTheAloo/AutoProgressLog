import dayjs from "dayjs";
import prisma from "../../db/client";
import { Graves } from "./AnkiHTTPClient";
import { CardEntry, Chunk, RevlogEntry } from "./NormalSyncer";

interface ReviewsRow {
  reviews: number;
}

interface MatureRow {
  mature: number;
}

interface RetentionStats {
  PASSED: number;
  FLUNKED: number;
}

type UserAnkiSettings = Awaited<
  ReturnType<typeof AnkiStorage.getUserAnkiSettings>
>;

const REVIEW_THRESHOLD = 21;
const TRUE_RETENTION_DAYS = 30;
const DEFAULT_RETENTION_DAYS = 29;

/**
 * AnkiStorage handles sync and analytics operations with a remote Anki DB.
 */
export default class AnkiStorage {
  private static storage_url: string;

  /**
   * Initialize storage URL
   */
  public static init(storage_url: string) {
    AnkiStorage.storage_url = storage_url;
  }

  /**
   * Get user-specific Anki settings.
   */
  static async getUserAnkiSettings(userID: number) {
    return (
      await prisma.userConfig.findUniqueOrThrow({
        where: { userId: userID },
        include: { ankiConfig: true },
      })
    ).ankiConfig;
  }

  /**
   * Generate SQL JOIN clause based on tracked decks.
   */
  static JoinTrackedDecks(
    settings: UserAnkiSettings,
    tablePrimaryKey: string = "revlog.cid"
  ) {
    if (!settings) return "";

    if (!/^[a-zA-Z_][a-zA-Z0-9._]*$/.test(tablePrimaryKey)) {
      throw new Error("Invalid table primary key");
    }

    const trackedDecks = settings.trackedDecks.filter(
      (id): id is number => typeof id === "number" && Number.isFinite(id)
    );

    return `JOIN cards c ON c.id = ${tablePrimaryKey} WHERE c.did IN (${trackedDecks.join(",")})`;
  }

  /**
   * Fetch total and per-deck review counts from remote DB.
   */
  static async getAnkiCardReviewCount(userID: number) {
    const response = await fetch(
      `${AnkiStorage.storage_url}/ankidb/count_reviews/${userID}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    return (await response.json()) as {
      count: { did: number; count: number }[];
      totalCount: number;
    };
  }

  /**
   * Remove all Anki data associated with the user.
   */
  public static async DeleteAnkiData(userID: number) {
    await prisma.ankiData.deleteMany({
      where: { syncData: { userId: userID } },
    });
  }

  /**
   * Calculate retention percentage for a user.
   */
  public static async getRetention(userID: number) {
    const settings = await AnkiStorage.getUserAnkiSettings(userID);
    if (!settings) return undefined;

    const daysAgo =
      settings.retentionMode === "TRUE_RETENTION"
        ? TRUE_RETENTION_DAYS
        : DEFAULT_RETENTION_DAYS;

    const since =
      dayjs().startOf("day").subtract(daysAgo, "days").unix() * 1000;

    if (settings.retentionMode === "ANKI_DEFAULT") {
      const totalReviews = await this.executeFetch<number, ReviewsRow[]>(
        this.storage_url,
        userID,
        `SELECT COUNT(*) as "reviews" FROM revlog ${this.JoinTrackedDecks(
          settings
        )} AND revlog.lastIvl >= ${REVIEW_THRESHOLD} AND revlog.id > ?`,
        [since]
      );

      if ("error" in totalReviews) throw totalReviews.error;

      const passedReviews = await this.executeFetch<number, ReviewsRow[]>(
        this.storage_url,
        userID,
        `SELECT COUNT(*) as "reviews" FROM revlog r ${this.JoinTrackedDecks(
          settings,
          "r.cid"
        )} AND r.lastIvl >= ${REVIEW_THRESHOLD} AND r.id > ? AND ((r.type = 1 AND r.ease >= 2))`,
        [since]
      );

      if ("error" in passedReviews) throw passedReviews.error;

      const percentage =
        (passedReviews.response[0].reviews / totalReviews.response[0].reviews) *
        100;
      return Number.isNaN(percentage) ? 0 : percentage;
    }

    if (settings.retentionMode === "TRUE_RETENTION") {
      const result = await this.executeFetch<number, RetentionStats[]>(
        this.storage_url,
        userID,
        `SELECT
          sum(case when ease = 1 and revlog.type == 1 then 1 else 0 end) as "FLUNKED",
          sum(case when ease > 1 and revlog.type == 1 then 1 else 0 end) as "PASSED"
         FROM revlog ${this.JoinTrackedDecks(settings)} AND revlog.id > ?`,
        [since]
      );

      if ("error" in result) throw result.error;

      const { PASSED, FLUNKED } = result.response[0];
      const percentage = (PASSED / (PASSED + FLUNKED)) * 100;
      return Number.isNaN(percentage) ? 0 : percentage;
    }
  }

  /**
   * Count mature cards (interval >= 21 days)
   */
  public static async getMatureCards(userID: number) {
    const settings = await AnkiStorage.getUserAnkiSettings(userID);
    if (!settings) return null;

    const result = await this.executeFetch<number, MatureRow[]>(
      this.storage_url,
      userID,
      `SELECT COUNT(*) as "mature" FROM cards ${this.JoinTrackedDecks(
        settings,
        "cards.id"
      )} AND cards.ivl >= ${REVIEW_THRESHOLD}`
    );

    if ("error" in result) throw result.error;

    return result.response[0].mature;
  }

  public static async applyChunk(chunk: Chunk, userID: number) {
    await this.mergeRevlog(chunk.revlog ?? [], userID);
    await this.mergeCards(chunk.cards ?? [], userID);
  }

  public static apply_graves(graves: Graves, userID: number) {
    for (const cid in graves.cards) {
      this.remove_card(cid, userID);
      this.remove_deck(cid, userID);
    }
  }

  public static async getUsn(userID: number): Promise<number> {
    const result = await this.executeFetch<number, { usn: number }[]>(
      this.storage_url,
      userID,
      `SELECT usn FROM col`
    );
    if ("error" in result) throw new Error(result.error);
    return result.response[0]?.usn ?? 0;
  }

  public static async setUsn(usn: number, userID: number): Promise<void> {
    const result = await this.executeModify(
      this.storage_url,
      userID,
      `UPDATE col SET usn = ?`,
      [usn]
    );
    if ("error" in result) throw new Error(result.error);
  }

  private static async mergeRevlog(
    entries: RevlogEntry[],
    userID: number
  ): Promise<void[]> {
    return Promise.all(entries.map((e) => this.addRevlogEntry(e, userID)));
  }

  private static async mergeCards(
    entries: CardEntry[],
    userID: number
  ): Promise<void[]> {
    return Promise.all(
      entries.map((e) => this.addOrUpdateCardIfNewer(e, userID))
    );
  }

  private static async addRevlogEntry(entry: RevlogEntry, userID: number) {
    const result = await this.executeModify(
      this.storage_url,
      userID,
      `INSERT OR IGNORE INTO revlog (id, cid, usn, ease, ivl, lastIvl, factor, time, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      entry
    );
    if ("error" in result) throw new Error(result.error);
  }

  private static async addOrUpdateCardIfNewer(
    entry: CardEntry,
    userID: number
  ) {
    const result = await this.executeModify(
      this.storage_url,
      userID,
      `INSERT OR REPLACE INTO cards (id, did, usn, ivl) VALUES (?, ?, ?, ?)`,
      [entry[0], entry[2], entry[6], entry[9]]
    );
    if ("error" in result) throw new Error(result.error);
  }

  private static async remove_card(cid: string, userID: number) {
    const result = await this.executeModify(
      this.storage_url,
      userID,
      `DELETE FROM cards WHERE id = ?`,
      [cid]
    );
    if ("error" in result) throw new Error(result.error);
  }

  private static async remove_deck(did: string, userID: number) {
    const result = await this.executeModify(
      this.storage_url,
      userID,
      `DELETE FROM decks WHERE id = ?`,
      [did]
    );
    if ("error" in result) throw new Error(result.error);
  }

  private static async executeFetch<Params, Response extends any[]>(
    url: string,
    userID: number,
    sql: string,
    params: Params[] = []
  ) {
    return this.execute<
      { message: string; response: Response } | { error: string }
    >("POST", `${url}/ankidb/query`, userID, sql, params);
  }

  private static async executeModify(
    url: string,
    userID: number,
    sql: string,
    params: any[] = []
  ) {
    return this.execute<
      { message: string; lastID: number } | { error: string }
    >("PATCH", url, userID, sql, params);
  }

  private static async execute<T>(
    method: "POST" | "PATCH",
    url: string,
    userID: number,
    sql: string,
    params: any[] = []
  ): Promise<T> {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userID, query: sql, queryParams: params }),
    });
    return response.json() as Promise<T>;
  }
}
