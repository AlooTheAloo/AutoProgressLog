import client from "../../db/client";
import dayjs from "dayjs";

export async function getReport(userId: number, reportNo: number) {
  // 1. Fetch the requested report
  const currentReport = await client.report.findUnique({
    where: {
      reportNo_userId: {
        reportNo: reportNo,
        userId: userId,
      },
    },
    include: {
      syncData: {
        include: {
          ankiData: true,
        },
      },
      streak: true,
    },
  });

  if (!currentReport) {
    throw new Error("Report not found");
  }

  // 2. Fetch the previous report (if exists)
  const previousReport = await client.report.findUnique({
    where: {
      reportNo_userId: {
        reportNo: reportNo - 1,
        userId: userId,
      },
    },
    include: {
      syncData: {
        include: {
          ankiData: true,
        },
      },
      streak: true,
    },
  });

  // 3. Define time range
  const until = dayjs(currentReport.syncData.generationTime);
  const since = previousReport
    ? dayjs(previousReport.syncData.generationTime)
    : dayjs(0); // Beginning of time if no previous report

  // 4. Fetch Immersion Activities in range
  const immersionLogs = await client.immersionActivity.findMany({
    where: {
      userId: userId,
      createdAt: {
        gt: since.toDate(),
        lte: until.toDate(),
      },
    },
  });

  // 5. Aggregate Immersion Data
  const currentImmersionTime = currentReport.syncData.totalImmersionTime;
  const previousImmersionTime = previousReport
    ? previousReport.syncData.totalImmersionTime
    : 0;
  const immersionDelta = currentImmersionTime - previousImmersionTime;

  // Group by activity name for ImmersionLog
  const immersionLogMap = new Map<string, number>();
  immersionLogs.forEach((log) => {
    const current = immersionLogMap.get(log.activityName) || 0;
    immersionLogMap.set(log.activityName, current + log.seconds);
  });

  const immersionLog = Array.from(immersionLogMap.entries()).map(
    ([name, relativeValue]) => ({
      name,
      relativeValue,
    })
  );

  // 6. Anki Data
  const currentAnki = currentReport.syncData.ankiData;
  const previousAnki = previousReport?.syncData.ankiData;

  const currentRetention = currentAnki?.retention ?? 0;
  const previousRetention = previousAnki?.retention ?? 0;

  const currentReviews = currentAnki?.totalCardsStudied ?? 0;
  const previousReviews = previousAnki?.totalCardsStudied ?? 0;

  // 7. Construct ReportData
  // Note: Some fields like 'AverageImmersionTime', 'BestImmersion', 'MonthlyImmersion'
  // might need more complex queries or approximations if not stored directly.
  // For now, I'll calculate what I can.

  // Monthly Immersion (approximate based on current report time)
  const startOfMonth = until.startOf("month").toDate();
  const monthlyImmersion = await client.immersionActivity.aggregate({
    where: {
      userId: userId,
      createdAt: {
        gte: startOfMonth,
        lte: until.toDate(),
      },
    },
    _sum: {
      seconds: true,
    },
  });

  // Last 7 days points (placeholder or actual calculation if we had a points system defined)
  // For now returning 0s as in the mock
  const lastDaysPoints = [0, 0, 0, 0, 0, 0, 0, 0];

  return {
    reportNo: currentReport.reportNo,
    time: until.toISOString(),
    matureCards: await getHistoricalMatureCardsData(userId, reportNo),
    retentionRate: {
      current: currentRetention,
      delta: currentRetention - previousRetention,
    },
    totalReviews: {
      current: currentReviews,
      delta: currentReviews - previousReviews,
    },
    AnkiStreak: {
      current: currentReport.streak?.ankiStreak ?? 0,
      delta:
        (currentReport.streak?.ankiStreak ?? 0) -
        (previousReport?.streak?.ankiStreak ?? 0),
    },
    AnkiData: await getHistoricalAnkiData(userId, reportNo),

    ImmersionTime: {
      current: currentImmersionTime,
      delta: immersionDelta,
    },
    AverageImmersionTime: {
      current: currentReport.averageImmersionTime, 
      delta: currentReport.averageImmersionTime - (previousReport?.averageImmersionTime ?? 0),
    },
    ImmersionLog: immersionLog,
    ImmersionData: await getHistoricalImmersionData(userId, reportNo),
    ImmersionStreak: {
      current: currentReport.streak?.immersionStreak ?? 0,
      delta:
        (currentReport.streak?.immersionStreak ?? 0) -
        (previousReport?.streak?.immersionStreak ?? 0),
    },
    MonthlyImmersion: monthlyImmersion._sum.seconds ?? 0,
    BestImmersion: {
      current: currentReport.bestImmersionTime,
      delta: currentReport.bestImmersionTime - (previousReport?.bestImmersionTime ?? 0),
    },

    ImmersionScore: 0, // TODO: Calculate score
    AnkiScore: 0, // TODO: Calculate score
    TotalScore: currentReport.score,

    lastDaysPoints: lastDaysPoints,
    metadata: {
      hasAnki: currentAnki !== null,
    },  
  };
}

async function getHistoricalImmersionData(userId: number, currentReportNo: number) {
  const startReportNo = Math.max(0, currentReportNo - 23);
  
  const reports = await client.report.findMany({
    where: {
      userId: userId,
      reportNo: {
        gte: startReportNo,
        lte: currentReportNo,
        not: 0,
      },
    },
    include: {
      syncData: true,
    },
    orderBy: {
      reportNo: 'asc',
    },
  });

  return reports.map((report, index) => {
    const previousTotal = index > 0 ? reports[index - 1].syncData.totalImmersionTime : 0;
    const currentTotal = report.syncData.totalImmersionTime;
    return {
      reportNo: report.reportNo,
      value: currentTotal - previousTotal,
    };
  });
}

async function getHistoricalAnkiData(userId: number, currentReportNo: number) {
  const startReportNo = Math.max(0, currentReportNo - 23);
  
  const reports = await client.report.findMany({
    where: {
      userId: userId,
      reportNo: {
        gte: startReportNo,
        lte: currentReportNo,
        not: 0,
      },
    },
    include: {
      syncData: {
        include: {
          ankiData: true,
        },
      },
    },
    orderBy: {
      reportNo: 'asc',
    },
  });

  return reports.map((report, index) => {
    const previousTotal = index > 0 ? (reports[index - 1].syncData.ankiData?.totalCardsStudied ?? 0) : 0;
    const currentTotal = report.syncData.ankiData?.totalCardsStudied ?? 0;
    return {
      reportNo: report.reportNo,
      value: currentTotal - previousTotal,
    };
  });
}

async function getHistoricalMatureCardsData(userId: number, currentReportNo: number) {
  const startReportNo = Math.max(0, currentReportNo - 5);
  
  const reports = await client.report.findMany({
    where: {
      userId: userId,
      reportNo: {
        gte: startReportNo,
        lte: currentReportNo,
        not: 0,
      },
    },
    include: {
      syncData: {
        include: {
          ankiData: true,
        },
      },
    },
    orderBy: {
      reportNo: 'asc',
    },
  });

  // Only include reports that have Anki data (metadata.hasAnki = true)
  return reports
    .filter((report) => report.syncData.ankiData !== null)
    .map((report) => ({
      reportNo: report.reportNo,
      matureCardCount: report.syncData.ankiData!.mature,
    }));
}
