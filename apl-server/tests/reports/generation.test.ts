import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import client from "../../src/db/client";
import { buildReport } from "../../src/services/reports/buildReport";
import { getReport } from "../../src/services/reports/getReport";
import { ImmersionActivity } from "@prisma/client";

const TEST_USER_EMAIL = "automated_test_user@example.com";
let testUserId: number;

describe("Report Generation System", () => {
    
    beforeAll(async () => {
        // Create a dedicated test user
        const user = await client.user.upsert({
            where: { email: TEST_USER_EMAIL },
            update: {},
            create: {
                email: TEST_USER_EMAIL,
                userName: "Test Bot",
            }
        });
        testUserId = user.id;

        // Clean slate for this user
        await client.immersionActivity.deleteMany({ where: { userId: testUserId } });
        // await client.itemReport.deleteMany({ where: { userId: testUserId } }).catch(() => {}); // Removed invalid model reference
        // Note: Report model cascades delete from user? No, we might need manual cleanup if cascading isn't perfect, 
        // but schema has onDelete: Cascade for user relations.
        await client.report.deleteMany({ where: { userId: testUserId } });
        await client.syncData.deleteMany({ where: { userId: testUserId } });
    });

    afterAll(async () => {
        // Cleanup user and all related data (Cascading delete should handle relations)
        await client.user.delete({ where: { id: testUserId } });
    });

    test("Generate First Report (Initial State)", async () => {
        // 1. Create some logs
        const now = new Date();
        await client.immersionActivity.create({
            data: {
                userId: testUserId,
                activityName: "Test Activity 1",
                seconds: 3600, // 1 hour
                activityTogglId: "test-1-" + Date.now(),
                createdAt: now,
            }
        });

        // 2. Build Report
        await buildReport(testUserId, true);

        // Bypass Debounce for next test: Update ONLY the latest
        const latestSync = await client.syncData.findFirst({
            where: { userId: testUserId },
            orderBy: { generationTime: 'desc' }
        });
        if(latestSync) {
            await client.syncData.update({
                where: { id: latestSync.id },
                data: { generationTime: new Date(Date.now() - 20000) }
            });
        }

        // 3. Verify
        const report = await client.report.findFirst({
            where: { userId: testUserId },
            orderBy: { reportNo: 'desc' }
        });
        expect(report).not.toBeNull();
        if (!report) return;

        const data = await getReport(testUserId, report.reportNo);
        
        expect(data.reportNo).toBe(1);
        expect(data.ImmersionTime.current).toBe(3600);
        expect(data.ImmersionTime.delta).toBe(3600); // First report delta = total
        expect(data.ImmersionScore).toBe(3600); // 1 sec = 1 score
    });

    test("Generate Subsequent Report with Positive Delta", async () => {
        // 1. Add more logs
        const now = new Date();
        await client.immersionActivity.create({
            data: {
                userId: testUserId,
                activityName: "Test Activity 2",
                seconds: 1800, // 30 mins
                activityTogglId: "test-2-" + Date.now(),
                createdAt: now,
            }
        });

        // 2. Build Report
        await buildReport(testUserId, true);

        // Bypass Debounce for next test
        const latestSync = await client.syncData.findFirst({
            where: { userId: testUserId },
            orderBy: { generationTime: 'desc' }
        });
        if(latestSync) {
            await client.syncData.update({
                where: { id: latestSync.id },
                data: { generationTime: new Date(Date.now() - 20000) }
            });
        }

        // 3. Verify
        const report = await client.report.findFirst({
            where: { userId: testUserId },
            orderBy: { reportNo: 'desc' }
        });
        expect(report).not.toBeNull();
        if (!report) return;

        const data = await getReport(testUserId, report.reportNo);
        
        expect(data.reportNo).toBe(2);
        expect(data.ImmersionTime.current).toBe(5400); // 3600 + 1800
        expect(data.ImmersionTime.delta).toBe(1800); // Added 30 mins
        expect(data.ImmersionScore).toBe(1800);
    });

    test("Handle Negative Delta (Log Deletion)", async () => {
        // 1. Delete the last activity (1800s)
        // Find it first
        const activity = await client.immersionActivity.findFirst({
            where: { userId: testUserId, activityName: "Test Activity 2" }
        });
        expect(activity).not.toBeNull();
        if(activity) await client.immersionActivity.delete({ where: { id: activity.id } });

        // 2. Build Report
        await buildReport(testUserId, true);

        // Bypass Debounce for next test
         const latestSync = await client.syncData.findFirst({
            where: { userId: testUserId },
            orderBy: { generationTime: 'desc' }
        });
        if(latestSync) {
            await client.syncData.update({
                where: { id: latestSync.id },
                data: { generationTime: new Date(Date.now() - 20000) }
            });
        }

        // 3. Verify
        const report = await client.report.findFirst({
            where: { userId: testUserId },
            orderBy: { reportNo: 'desc' }
        });
        expect(report).not.toBeNull();
        if (!report) return;

        const data = await getReport(testUserId, report.reportNo);
        
        expect(data.reportNo).toBe(3);
        expect(data.ImmersionTime.current).toBe(3600); // Back to 1 hour
        expect(data.ImmersionTime.delta).toBe(-1800); // Negative delta !!!
        expect(data.ImmersionScore).toBe(0); // Clamped score !!!
    });

    test("Debounce Verification (Prevent Double Build)", async () => {
        // 1. Trigger first build
        await buildReport(testUserId, true);
        
        // Capture report count
        const countAfterFirst = await client.report.count({ where: { userId: testUserId } });

        // 2. Trigger second build immediately - SHOULD THROW
        await expect(buildReport(testUserId, true)).rejects.toThrow("RATE_LIMIT");

        // 3. Verify count hasn't increased
        const countAfterSecond = await client.report.count({ where: { userId: testUserId } });
        
        // Report count should be the same because the second build was skipped
        expect(countAfterSecond).toBe(countAfterFirst);
    });
});
