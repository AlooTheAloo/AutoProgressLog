import { Dayjs } from "dayjs"

export type DashboardDTO = {
    userName: string,
    lastSyncTime: string,
    lastReportTime: string,
    immersionSinceLastReport: number,
    totalImmersion: number,
    retentionRate: number,
    totalReviews: number,
    immersionSources:{
        name: string,
        relativeValue: number
    }[],
    monthlyScore: number

}