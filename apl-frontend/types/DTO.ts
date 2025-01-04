export type DashboardDTO = {
    userName: string,
    lastSyncTime: string,
    lastReportTime: string,
    immersionDTO:ImmersionDTO,
    ankiDTO?:AnkiDTO
    monthlyScore: number,
    syncCount: number
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
    immersionSources:ImmersionSource[],
}

export type ImmersionSource = {
    name: string,
    relativeValue: number
}