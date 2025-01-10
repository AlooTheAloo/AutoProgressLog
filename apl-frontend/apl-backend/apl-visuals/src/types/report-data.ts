
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
    ImmersionLog:relativeActivity[],
    ImmersionData:RelativeReportData[],
    ImmersionStreak:TPlusDelta<number>,
    MonthlyImmersion:number,
    BestImmersion:TPlusDelta<number>,

    ImmersionScore:number,
    AnkiScore:number,
    TotalScore:number

    lastDaysPoints:number[]
}

export type Layout = {
    layout:string[][],
    gradient:string[]
}

export type RelativeReportData = {
    value:number,
    reportNo:number
}

export interface relativeActivity {
    name: string;
    relativeValue: number;
}
export type TPlusDelta<T> = {
    current:T,
    delta:T
}

export type matureCardData = {
    reportNo:number,
    matureCardCount:number
}