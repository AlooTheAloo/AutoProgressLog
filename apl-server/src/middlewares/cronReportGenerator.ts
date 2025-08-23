import { Elysia, t } from "elysia";
import cron, { ScheduledTask } from "node-cron";
import type { PrismaClient, Prisma } from "@prisma/client";

/** Row shape used from Prisma (typed) */
type UserConfigRow = Prisma.UserConfigGetPayload<{
    select: { userId: true; autoGenTime: true }
}>;

interface ReportCronOptions {
    prisma: PrismaClient;
    /** Called when it's time to run the user's report */
    buildReport: (userId: number) => Promise<void> | void;

    /** How often to poll DB to reconcile (cron). Default: every minute. */
    reconcilePattern?: string;

    /**
     * Optional per-user timezone (IANA). If omitted, node-cron uses server tz.
     * If you later add a timezone column, resolve it here.
     */
    timezoneForUser?: (userId: number) => string | undefined | Promise<string | undefined>;

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

/** Build daily cron expression for a given local time */
function dailyCronExpr(date: Date): string {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    return `${pad2(s)} ${pad2(m)} ${pad2(h)} * * *`;
}

export function reportCronPlugin(opts: ReportCronOptions) {
    const {
        prisma,
        buildReport,
        reconcilePattern = "*/1 * * * *",
        timezoneForUser,
        logger = console
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

        const cronExpr = dailyCronExpr(row.autoGenTime);
        const tz = (await timezoneForUser?.(row.userId)) ?? undefined;
        const current = registry.get(row.userId);

        // No changes → keep current task
        if (current && current.cronExpr === cronExpr && current.timezone === tz) return;

        // Replace if changed
        if (current) {
            current.task.stop();
            registry.delete(row.userId);
            logger.info?.(
                `[report-cron] Updating user ${row.userId}: ${current.cronExpr} -> ${cronExpr} ${tz ? `(tz=${tz})` : ""}`
            );
        }

        const task = cron.schedule(
            cronExpr,
            async () => {
                try {
                    logger.info?.(`[report-cron] buildReport start for user ${row.userId}`);
                    await buildReport(row.userId);
                    logger.info?.(`[report-cron] buildReport done for user ${row.userId}`);
                } catch (err) {
                    logger.error?.(`[report-cron] buildReport error for user ${row.userId}:`, err);
                }
            },
            tz ? { timezone: tz } : undefined
        );

        registry.set(row.userId, { task, cronExpr, timezone: tz });
        logger.info?.(
            `[report-cron] Scheduled user ${row.userId} at "${cronExpr}" ${tz ? `(tz=${tz})` : ""}`
        );
    }

    /** Query all users that should be scheduled and ensure registry matches DB */
    async function refreshAll(): Promise<void> {
        const rows: UserConfigRow[] = await prisma.userConfig.findMany({
            where: { autoGenTime: { not: null } },
            select: { userId: true, autoGenTime: true }
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
                select: { userId: true, autoGenTime: true }
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
                timezone: meta.timezone
            }));
        }
    };

    return new Elysia()
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
        // Optional debug route (remove in prod)
        .get("/_report-cron/list", () => manager.list(), {
            response: t.Array(
                t.Object({
                    userId: t.Number(),
                    cronExpr: t.String(),
                    timezone: t.Optional(t.String())
                })
            )
        });
}