export type DashboardDTO = {
    userName: string,
    lastSyncTime: string,
    lastReportTime: string,
    immersionDTO:ImmersionDTO,
    ankiDTO?:AnkiDTO
    monthlyScore: number,
    syncCount: number,
    nextReport: string
}

export type AnkiDTO = {
    retentionRate: number,
    retentionRateDelta: number,

    totalReviews: number,
    reviewsDelta: number,
}

export type ImmersionDTO = {
    totalImmersion: number,
    immersionSinceLastReport: number,
    monthlyImmersion: number,
    monthlyImmersionLastMonth: number,
    immersionSources:{
        name: string,
        relativeValue: number
    }[],
}

export type ImmersionSource = {
    name: string;
    relativeValue: number;
}