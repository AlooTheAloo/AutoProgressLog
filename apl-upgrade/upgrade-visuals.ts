import Bun from "bun";

interface OldSchema {
    totalSeconds: number;
    lastGenerated: string;
    cardsStudied: number;
    ankiStreak: number;
    immersionStreak: number;
    reportNo: number;
    mature: number;
    retention: number;
}

interface NewSchema {
    reportNo: number;
    generationTime: string;
    seconds: number;
    totalSeconds: number;
    cardsStudied: number;
    totalCardsStudied: number;
    mature: number | null;
    retention: number | null;
    ankiStreak: number;
    immersionStreak: number;
    score: number;
}

function convertToNewSchema(oldArray: OldSchema[]): NewSchema[] {
    return oldArray.map((current, index) => {
        const previous = oldArray[index - 1] || 0; // Use current if it's the first element
        const seconds = current.totalSeconds - previous.totalSeconds;
        const cardsStudied = current.cardsStudied - previous.cardsStudied;

        return {
            reportNo: current.reportNo,
            generationTime: current.lastGenerated,
            seconds,
            totalSeconds: current.totalSeconds,
            cardsStudied,
            totalCardsStudied: current.cardsStudied,
            mature: current.mature ?? null,
            retention: current.retention ?? null,
            ankiStreak: current.ankiStreak,
            immersionStreak: current.immersionStreak,
            score: seconds + cardsStudied,
        };
    });
}



const file = Bun.file("./old.json");
const contents = await file.json();
const list = contents.list
const newSchema = convertToNewSchema(list);
Bun.write("./new.json", JSON.stringify(newSchema));