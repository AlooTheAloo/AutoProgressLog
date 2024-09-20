
export interface SyncData {
    id: number;
    generationTime: number;
    totalSeconds: number;
    totalCardsStudied: number;
    cardsStudied: number;
    mature: number;
    retention: number;
}

export interface ImmersionActivity {
    syncDataId: number;
    time: number;
    seconds: number;
    activityName: string;
}