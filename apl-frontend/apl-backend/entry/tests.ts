import dayjs from "dayjs";
import { getAnkiCardReviewCount, getMatureCards, getRetention } from "../anki/db";

async function a()
{
    const a = getMatureCards({
        ankiDB: "/Users/philipanthony-davis/Library/Application Support/anki2/User 1/collection.anki2",
        ankiPath: "/Applications/Anki.app",
        ankiProgramBinaryName: "/Applications/Anki.app/Contents/MacOS/anki"
    });
    console.log(await a);
}

a();