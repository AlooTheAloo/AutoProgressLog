import Elysia, { t } from "elysia";
import { TokenType, AnkiRetentionMode, AutoGenConfig, Prisma } from "@prisma/client";
import { Database } from "bun:sqlite";
import prisma from "../../db/client";
import { authGuard } from "../../middlewares/authGuard";
import { Toggl } from "toggl-track";
import AnkiStorage from "../../services/anki/AnkiStorage";
import { DEFAULT_ANKI_URL } from "../../services/anki/AnkiHTTPClient";
import { syncTogglData } from "../../services/toggl/syncService";
import createWebhook from "../../integrations/toggl/createWebhook";
import { arithmeticWeightedMean } from "../../services/reports/buildReport";

function fromEpochMaybeMs(x: number): Date {
  return new Date(x < 1_000_000_000_000 ? x * 1000 : x);
}

function toAutoGenTime(
  hours = 0,
  minutes = 0,
  tz: string = "America/Toronto"
): Omit<AutoGenConfig, "id" | "userConfigId"> | undefined {
  return {
    secondsSinceMidnight: hours * 60 * 60 + minutes * 60,
    timezone: tz,
  };
}

function toTimeOnlyDate(hours = 0, minutes = 0): Date {
  const d = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
  return d;
}

function toRetentionMode(raw: unknown): AnkiRetentionMode {
  if (!raw) return AnkiRetentionMode.ANKI_DEFAULT;
  const s = String(raw).toUpperCase().replace(/[-\s]/g, "_");
  return s === "TRUE_RETENTION"
    ? AnkiRetentionMode.TRUE_RETENTION
    : AnkiRetentionMode.ANKI_DEFAULT;
}

export const importLegacyRoute = new Elysia({ name: "import-legacy" })
  .use(authGuard)
  .post(
    "/import-legacy",
    async ({ user, body, set }) => {
      // --- 1) Auth ---
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      const userId = user.id;

      // --- 2) Parse uploads ---
      // --- 2) Parse uploads ---
      const configFile = body.config as File | undefined;
      const cacheFile = body.cache as File | undefined;
      const syncdbFile = body.syncdb as File | undefined;

      // START CONFIG MIGRATION
      if (configFile) {
          let cfg: any;
          try {
            cfg = JSON.parse(await configFile.text());
          } catch (e) {
            set.status = 400;
            console.log("Error parsing config.json", e);
            // We can choose to return error or just skip. safely returning error for now if file exists but is bad.
            return { error: "config is not valid JSON" };
          }

          // --- 4) Migrate configuration ---

          const autogenEnabled = !!cfg?.general?.autogen?.enabled;
          const genH = Number(
            cfg?.general?.autogen?.options?.generationTime?.hours ?? 0
          );
          const genM = Number(
            cfg?.general?.autogen?.options?.generationTime?.minutes ?? 0
          );
          const autoGenTime = autogenEnabled
            ? toAutoGenTime(genH, genM)
            : undefined;

          let togglToken = cfg?.toggl?.togglToken ?? null;
          const userName = cfg?.account?.userName ?? null;

          const ankiEnabled = !!cfg?.anki?.enabled;
          const ankiUrl =
            cfg?.anki?.ankiIntegration?.url ?? "https://sync.ankiweb.net/";
          const ankiToken = cfg?.anki?.ankiIntegration?.key ?? null;
          const trackedDecksRaw = cfg?.anki?.options?.trackedDecks ?? [];
          const trackedDecks: string[] = Array.isArray(trackedDecksRaw)
            ? trackedDecksRaw.map((x: any) => String(x))
            : [];
          const retentionMode = toRetentionMode(cfg?.anki?.options?.retentionMode);

          console.log("togglToken present? " + !!togglToken);
          let TOGGL_UID: string | undefined;

          if (togglToken) {
            try {
              const me = await new Toggl({
                auth: {
                  token: togglToken,
                },
              }).me.get();
              TOGGL_UID = me.id.toString();
              console.log("TOGGL_UID is " + TOGGL_UID);
            } catch (e) {
              console.log("Failed to fetch Toggl UID", e);
              // reset to null so we don't try to use invalid token
              togglToken = null;
            }
          }

          try {
            const existingCfg = await prisma.userConfig.findUnique({
              where: { userId },
            });

            const ankiConfigCreate =
              ankiEnabled && ankiToken
                ? {
                    create: {
                      url: ankiUrl,
                      ankiToken,
                      retentionMode,
                      trackedDecks,
                    },
                  }
                : undefined;

            const ankiConfigUpsert =
              ankiEnabled && ankiToken
                ? {
                    upsert: {
                      create: {
                        url: ankiUrl,
                        ankiToken,
                        retentionMode,
                        trackedDecks,
                      },
                      update: {
                        url: ankiUrl,
                        ankiToken,
                        retentionMode,
                        trackedDecks,
                      },
                    },
                  }
                : undefined;

            if (!existingCfg) {
              await prisma.userConfig.create({
                data: {
                  userId,
                  togglToken: togglToken ?? "", // must be non-null per schema
                  togglUserId: TOGGL_UID ?? "",
                  autoGenTime:
                    autoGenTime == undefined
                      ? undefined
                      : {
                          create: autoGenTime,
                        },
                  ankiConfig: ankiConfigCreate,
                },
              });
            } else {
              const togglUpdate =
                togglToken && TOGGL_UID
                  ? {
                      togglToken,
                      togglUserId: TOGGL_UID,
                    }
                  : {};

              await prisma.userConfig.update({
                where: { userId },
                data: {
                  ...togglUpdate,
                  autoGenTime:
                    autoGenTime == undefined
                      ? undefined
                      : {
                          upsert: {
                            create: autoGenTime,
                            update: autoGenTime,
                          },
                        },
                  ankiConfig: ankiConfigUpsert,
                },
              });
            }

            if (ankiEnabled) {
              if (ankiToken) {
                await AnkiStorage.requestAnkiDBDownload(
                  user.id,
                  ankiToken,
                  ankiUrl ?? DEFAULT_ANKI_URL
                );
              } else {
                 console.log("Anki enabled but no token provided, skipping download");
              }
            }

            // --- 8) Backfill & Webhook ---
            // If we have a toggl token, backfill and hook
            if (togglToken) {
              console.log("Backfilling last 3 months data...");
              await syncTogglData(userId, true);
              console.log("Creating webhook...");
              await createWebhook(-1, togglToken);
            }
          } catch (e) {
            console.log("Error during config migration: ", e);
            // don't fail the whole request
          }

          // Upsert user profile fields
          await prisma.user.update({
            where: { id: userId },
            data: {
                userName: userName ?? undefined,
            },
          });
      }

      // START SYNC DATA MIGRATION
      let createdSync = 0;
      let createdActivities = 0;
      let legacyIdToNewSyncId = new Map<number, number>();

      if (syncdbFile) {
        // Persist SQLite file to a temp path Bun can open
        const tmpPath = `/tmp/apl-sync-${crypto.randomUUID()}.db`;
        try {
          const syncBuf = new Uint8Array(await syncdbFile.arrayBuffer());
          await Bun.write(tmpPath, syncBuf);

          // --- 3) Read legacy SQLite ---
          const sqlite = new Database(tmpPath, { readonly: true });

          try {
            const syncRows = sqlite
              .query(
                `SELECT id,
                    generationTime,
                    totalSeconds,
                    totalCardsStudied,
                    cardsStudied,
                    mature,
                    retention
            FROM syncData`
              )
              .all() as Array<{
              id: number;
              generationTime: number;
              totalSeconds: number;
              totalCardsStudied: number;
              cardsStudied: number;
              mature: number;
              retention: number;
            }>;

            const activityRows = sqlite
              .query(
                `SELECT id, time, seconds, activityName
            FROM immersionActivity`
              )
              .all() as Array<{
              id: number;
              time: number;
              seconds: number;
              activityName: string;
            }>;

            // --- 5) Migrate SyncData (+AnkiData) ---
            for (const row of syncRows) {
              try {
                const created = await prisma.syncData.create({
                  data: {
                    userId,
                    generationTime: fromEpochMaybeMs(row.generationTime),
                    totalImmersionTime: row.totalSeconds,
                    ankiData: {
                      create: {
                        totalCardsStudied: row.totalCardsStudied,
                        cardsStudied: row.cardsStudied,
                        mature: row.mature,
                        retention: row.retention,
                      },
                    },
                  },
                });
                legacyIdToNewSyncId.set(row.id, created.id);
                createdSync++;
              } catch (error) {
                if (
                  error instanceof Prisma.PrismaClientKnownRequestError &&
                  error.code === "P2002"
                ) {
                  // Unique constraint violation - find the existing record
                  const existing = await prisma.syncData.findFirst({
                    where: {
                      userId,
                      generationTime: fromEpochMaybeMs(row.generationTime),
                    },
                  });
                  if (existing) {
                    legacyIdToNewSyncId.set(row.id, existing.id);
                    console.log(`Skipping duplicate syncData for generationTime: ${row.generationTime}`);
                  }
                } else {
                  throw error;
                }
              }
            }

            // --- 6) Migrate ImmersionActivity ---
            let skippedDuplicates = 0;

            for (const a of activityRows) {
              try {
                await prisma.immersionActivity.create({
                  data: {
                    userId,
                    createdAt: fromEpochMaybeMs(a.time),
                    seconds: a.seconds,
                    activityName: a.activityName,
                    activityTogglId: a.id.toString(),
                  },
                });
                createdActivities++;
              } catch (error: any) {
                // Skip duplicates (unique constraint violations)
                if (error.code === "P2002") {
                  console.log(`Skipping duplicate activityTogglId: ${a.id}`);
                  skippedDuplicates++;
                } else {
                  // Re-throw other errors
                  throw error;
                }
              }
            }
          } finally {
            sqlite.close();
          }
        } finally {
            Bun.file(tmpPath).unlink().catch(()=>{});
        }
      }

      // START CACHE/REPORTS MIGRATION
      let upsertedReports = 0;
      if (cacheFile) {
           let cacheJson: any;
           try {
            cacheJson = JSON.parse(await cacheFile.text());
          } catch (e) {
             console.log("Cache file invalid json", e);
             // allow continuing if cache missing/bad
          }

          if(cacheJson) {
            // --- 7) Migrate Reports (+Streak) from cache.json ---
            const keys = Object.keys(cacheJson || {});
            console.log("Cachejson keys: " + keys.join(", "));
            
            const listLen = Array.isArray(cacheJson?.list) ? cacheJson.list.length : 0;
            console.log("Cachejson.list length: " + listLen);

            const items: any[] = Array.isArray(cacheJson?.list) ? cacheJson.list : [];
            
            // Log a small sample or summary instead of full dump
            const summary = items.length > 0 ? JSON.stringify(items[0]).slice(0, 100) + "..." : "empty";
            console.log(`items summary (count ${items.length}, first item preview): ${summary}`);
            let i = 0;
            for (const item of items) {
                const reportNo = Number(item.reportNo);
                const score = Number(item.score ?? 0);
                const ankiStreak = Number(item.ankiStreak ?? 0);
                const immersionStreak = Number(item.immersionStreak ?? 0);

                // Determine syncData to attach:
                // Prefer mapping by legacy syncID from cache; otherwise create a new SyncData from the cache row.
                let syncDataId = legacyIdToNewSyncId.get(Number(item.syncID));
                if (!syncDataId) {
                  const generationTime = item.generationTime
                    ? new Date(item.generationTime)
                    : new Date();
                  try {
                    const created = await prisma.syncData.create({
                      data: {
                        userId,
                        generationTime,
                        totalImmersionTime: Number(item.totalSeconds ?? 0),
                        ankiData: {
                          create: {
                            totalCardsStudied: Number(item.totalCardsStudied ?? 0),
                            cardsStudied: Number(item.cardsStudied ?? 0),
                            mature: Number(item.mature ?? 0),
                            retention: Number(item.retention ?? 0),
                          },
                        },
                      },
                    });
                    syncDataId = created.id;
                  } catch (error) {
                    if (
                      error instanceof Prisma.PrismaClientKnownRequestError &&
                      error.code === "P2002"
                    ) {
                      // Unique constraint violation - find the existing record
                      const existing = await prisma.syncData.findFirst({
                        where: {
                          userId,
                          generationTime,
                        },
                      });
                      if (existing) {
                        syncDataId = existing.id;
                        console.log(`Using existing syncData for generationTime: ${generationTime}`);
                      }
                    } else {
                      throw error;
                    }
                  }
                }

                // Skip if we couldn't get a syncDataId (no creation and no existing found)
                if (!syncDataId) {
                  console.log(`Skipping report for item without syncDataId`);
                  continue;
                }

                await prisma.report.upsert({
                where: {
                    reportNo_userId: { reportNo, userId },
                },
                create: {
                    reportNo,
                    score: {
                    create: {
                        immersionScore: item.seconds ?? 0,
                        ankiScore: (item.score ?? 0) - (item.seconds ?? 0), // total = a + b <=> b = total - a
                        totalScore: item.score ?? 0,
                    },
                    },
                    averageImmersionTime: arithmeticWeightedMean(
                    items
                        .slice(Math.max(0, i - 9), i + 1)
                        .map((x) => x.seconds)
                        .reverse()
                    ),
                    bestImmersionTime: item.bestSeconds ?? 0,
                    userId,
                    syncDataId,
                    streak: {
                    create: {
                        ankiStreak,
                        immersionStreak,
                    },
                    },
                },
                update: {
                    score: {
                    upsert: {
                        create: {
                            immersionScore: item.seconds ?? 0,
                            ankiScore: (item.score ?? 0) - (item.seconds ?? 0),
                            totalScore: item.score ?? 0,
                        },
                        update: {
                            immersionScore: item.seconds ?? 0,
                            ankiScore: (item.score ?? 0) - (item.seconds ?? 0),
                            totalScore: item.score ?? 0,
                        },
                    },
                    },
                    syncDataId,
                    streak: {
                    upsert: {
                        create: { ankiStreak, immersionStreak },
                        update: { ankiStreak, immersionStreak },
                    },
                    },
                },
                });
                i++;
                upsertedReports++;
            }
          }
      }

      // --- 9) Done ---
      return {
        ok: true,
        migrated: {
          syncData: createdSync,
          immersionActivities: createdActivities,
          reports: upsertedReports,
        },
      };
    },
    {
      detail: {
        summary: "Transfer all legacy data to new database",
        tags: ["User"],
        description:
          "Transfer all config, syncdatas, immersionActivities and reports from legacy database to new database.",
      },
      body: t.Object({
        config: t.Optional(t.File()),
        cache: t.Optional(t.File()),
        syncdb: t.Optional(t.File()),
      }),
    }
  );
