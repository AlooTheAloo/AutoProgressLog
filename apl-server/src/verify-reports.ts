import client from "./db/client";
import { buildReport } from "./services/reports/buildReport";
import { getReport } from "./services/reports/getReport";

async function verify() {
    const userId = 1; // Assuming user 1 exists, change if needed
    console.log("--- Starting Verification ---");

    // 1. Create a dummy log
    const now = new Date();
    const log = await client.immersionActivity.create({
        data: {
            userId,
            activityName: "Verification Test",
            seconds: 3600,
            activityTogglId: "verify-" + Date.now(),
            createdAt: now,
        }
    });
    console.log("Created dummy log: 1 hour of 'Verification Test'");

    // 2. Build a report
    console.log("Building report...");
    await buildReport(userId, true);

    // 3. Get the report
    const lastReport = await client.report.findFirst({
        where: { userId },
        orderBy: { reportNo: 'desc' }
    });
    if (!lastReport) throw new Error("Report not created");
    
    let reportData = await getReport(userId, lastReport.reportNo);
    console.log(`Report #${reportData.reportNo} generated.`);
    console.log(`Delta: ${reportData.ImmersionTime.delta}s`);
    
    // 4. Delete the log
    console.log("Deleting the log...");
    await client.immersionActivity.delete({ where: { id: log.id } });

    // 5. Get the report again (Simulating check of same report, ensuring persistence if desired, or build new report)
    // In this flow, we want to see if the next report reflects the deletion.
    
    console.log("Building second report to verify delta logic...");
    await buildReport(userId, true);
    const secondReport = await client.report.findFirst({
        where: { userId },
        orderBy: { reportNo: 'desc' }
    });
    
    const secondReportData = await getReport(userId, secondReport!.reportNo);
    console.log(`Report #${secondReportData.reportNo} generated.`);
    console.log(`Delta: ${secondReportData.ImmersionTime.delta}s`);
    console.log(`Score: ${secondReportData.ImmersionScore}`);

    // Cleanup
    await client.report.delete({ where: { id: lastReport.id } });
    await client.report.delete({ where: { id: secondReport!.id } });
    console.log("--- Verification Complete ---");
}

verify().catch(console.error).finally(() => client.$disconnect());
