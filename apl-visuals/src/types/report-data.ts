
export type ReportData = {
    reportNo:number,
    time:string,

    matureCards:matureCardData[];
    retentionRate:TPlusDelta<number>,
    totalReviews:TPlusDelta<number>,
    AnkiStreak:TPlusDelta<number>,
    AnkiData:RelativeReportData[],

    ImmersionTime:TPlusDelta<number>,
    AverageImmersionTime:TPlusDelta<number>,
    ImmersionLog:activity[],
    ImmersionData:RelativeReportData[],

    ImmersionScore:number,
    AnkiScore:number,
    StreakMultiplier:number,
    TotalScore:number

    UserRanking:string,
    lastDaysPoints:number[]
}

export type RelativeReportData = {
    value:number,
    reportNo:number
}

export type activity = {
    activityTitle:string,
    activityDurationHR:string,
    activitySeconds:number
}

export type TPlusDelta<T> = {
    current:T,
    delta:T
}

export type matureCardData = {
    reportNo:number,
    matureCardCount:number
}