export type SyncType = "Silent" | "Full";

export interface SyncData {
    id: number;
    generationTime: number;
    type: SyncType;
    anki?: AnkiSyncData;
    toggl?: TogglSyncData;
}

export interface AnkiSyncData {
    totalCardsStudied: number;
    cardsStudied: number;
    mature: number;
    retention: number;
}

export interface TogglSyncData {
    totalSeconds: number;
}


export interface ImmersionActivity {
    syncDataId: number;
    time: number;
    seconds: number;
    activityName: string;
}
