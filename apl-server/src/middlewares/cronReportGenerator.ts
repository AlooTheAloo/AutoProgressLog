import { Elysia, t } from "elysia";
import cron, { ScheduledTask } from "node-cron";
import type { PrismaClient, Prisma } from "@prisma/client";

/** Row shape used from Prisma (typed) */
type UserConfigRow = Prisma.UserConfigGetPayload<{
  select: {
    userId: true;
    autoGenTime: {
      select: { secondsSinceMidnight: true; timezone: true };
    };
  };
}>;

interface ReportCronOptions {
  prisma: PrismaClient;
  /** Called when it's time to run the user's report */
  buildReport: (userId: number) => Promise<void> | void;

  /** How often to poll DB to reconcile (cron). Default: every minute. */
  reconcilePattern?: string;

  /**
   * Optional per-user timezone (IANA). If provided, it overrides the DB tz.
   * Return e.g. "America/Toronto".
   */
  timezoneForUser?: (
    userId: number
  ) => string | undefined | Promise<string | undefined>;

  /** Optional logger */
  logger?: Pick<Console, "info" | "warn" | "error">;
}

interface ScheduleMeta {
  task: ScheduledTask;
  cronExpr: string;
  timezone?: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toHMS(secondsSinceMidnight: number) {
  // normalize to [0, 86399]
  const sNorm = ((Math.floor(secondsSinceMidnight) % 86400) + 86400) % 86400;
  const h = Math.floor(sNorm / 3600);
  const m = Math.floor((sNorm % 3600) / 60);
  const s = sNorm % 60;
  return { h, m, s };
}

/** Build daily cron expression from seconds since midnight (local time of the tz).
 *  Note: the expr itself is TZ-agnostic; TZ is passed to node-cron options. */
function dailyCronExpr(secondsSinceMidnight: number): string {
  const { h, m, s } = toHMS(secondsSinceMidnight);
  return `${pad2(s)} ${pad2(m)} ${pad2(h)} * * *`;
}

function isValidIanaTimeZone(tz?: string): tz is string {
  if (!tz) return false;
  try {
    // Throws on invalid zones
    new Intl.DateTimeFormat("en-US", { timeZone: tz }).format();
    return true;
  } catch {
    return false;
  }
}

export function reportCronPlugin(opts: ReportCronOptions) {
  const {
    prisma,
    buildReport,
    reconcilePattern = "*/1 * * * *",
    timezoneForUser,
    logger = console,
  } = opts;

  // userId -> scheduled task
  const registry = new Map<number, ScheduleMeta>();

  function unschedule(userId: number): boolean {
    const meta = registry.get(userId);
    if (!meta) return false;
    meta.task.stop();
    registry.delete(userId);
    logger.info?.(`[report-cron] Unscheduled user ${userId}`);
    return true;
  }

  async function scheduleRow(row: UserConfigRow): Promise<void> {
    if (row.autoGenTime == null) {
      unschedule(row.userId);
      return;
    }

    const seconds = row.autoGenTime.secondsSinceMidnight;
    const cronExpr = dailyCronExpr(seconds);

    // Prefer override if provided; otherwise fall back to DB tz
    // Use DB tz only if it's a valid IANA zone
    const resolvedTz = isValidIanaTimeZone(row.autoGenTime.timezone)
      ? row.autoGenTime.timezone
      : "America/Toronto";

    const current = registry.get(row.userId);
    // No changes → keep current task
    if (
      current &&
      current.cronExpr === cronExpr &&
      current.timezone === resolvedTz
    )
      return;

    // Replace if changed
    if (current) {
      current.task.stop();
      registry.delete(row.userId);
      logger.info?.(
        `[report-cron] Updating user ${row.userId}: ${current.cronExpr}${
          current.timezone ? ` (tz=${current.timezone})` : ""
        } -> ${cronExpr}${resolvedTz ? ` (tz=${resolvedTz})` : ""}`
      );
    }

    const task = cron.schedule(
      cronExpr,
      async () => {
        try {
          logger.info?.(
            `[report-cron] buildReport start for user ${row.userId}`
          );
          await buildReport(row.userId);
          logger.info?.(
            `[report-cron] buildReport done for user ${row.userId}`
          );
        } catch (err) {
          logger.error?.(
            `[report-cron] buildReport error for user ${row.userId}:`,
            err
          );
        }
      },
      // IMPORTANT: pass IANA tz to cron so DST is handled correctly
      resolvedTz ? ({ timezone: resolvedTz } as const) : undefined
    );

    registry.set(row.userId, { task, cronExpr, timezone: resolvedTz });
    logger.info?.(
      `[report-cron] Scheduled user ${row.userId} at "${cronExpr}" ${resolvedTz ? `(tz=${resolvedTz})` : ""}`
    );
  }

  /** Query all users that should be scheduled and ensure registry matches DB */
  async function refreshAll(): Promise<void> {
    const rows: UserConfigRow[] = await prisma.userConfig.findMany({
      where: { autoGenTime: { isNot: null } },
      select: {
        userId: true,
        autoGenTime: {
          select: { secondsSinceMidnight: true, timezone: true },
        },
      } as const,
    });

    const live = new Set<number>();
    for (const r of rows) {
      live.add(r.userId);
      await scheduleRow(r);
    }

    // Remove users no longer in the result set
    for (const userId of registry.keys()) {
      if (!live.has(userId)) unschedule(userId);
    }
  }

  const manager = {
    /** Attach (or update) a single user by reading their current config */
    async attach(userId: number): Promise<void> {
      const row = await prisma.userConfig.findUnique({
        where: { userId },
        select: {
          userId: true,
          autoGenTime: {
            select: { secondsSinceMidnight: true, timezone: true },
          },
        } as const,
      });
      if (!row || row.autoGenTime == null) {
        unschedule(userId);
        return;
      }
      await scheduleRow(row);
    },

    /** Detach a single user (regardless of DB content) */
    detach(userId: number): boolean {
      return unschedule(userId);
    },

    /** Poll DB and sync all */
    async refresh(): Promise<void> {
      await refreshAll();
    },

    /** Introspection for debugging */
    list(): Array<{ userId: number; cronExpr: string; timezone?: string }> {
      return Array.from(registry.entries()).map(([userId, meta]) => ({
        userId,
        cronExpr: meta.cronExpr,
        timezone: meta.timezone,
      }));
    },
  };

  return (
    new Elysia()
      .decorate("reportCron", manager)
      .onStart(async () => {
        await refreshAll();
        cron.schedule(reconcilePattern, refreshAll);
        logger.info?.(`[report-cron] Reconciler running "${reconcilePattern}"`);
      })
      .onStop(() => {
        for (const [userId, meta] of registry.entries()) {
          meta.task.stop();
          logger.info?.(`[report-cron] Stopped task for user ${userId}`);
        }
        registry.clear();
      })
  );
}
