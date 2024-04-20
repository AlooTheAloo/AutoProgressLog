import { Toggl } from 'toggl-track';
import { entry } from './types/entry';
import fs from "fs";
import { cache } from './types/cache';
import dayjs, { Dayjs } from 'dayjs';
import { activity } from './types/activity';
import duration from "dayjs/plugin/duration";
import { compareActivities } from './Helpers/activityHelper';
import { sumTime } from './Helpers/entryHelper';
import { Client, TextChannel } from 'discord.js-selfbot-v13';
import { getAnkiCardReviewCount } from "./anki/db";
import { buildMessage } from './Helpers/buildMessage';
import schedule from 'node-schedule';
import {spawn, exec} from 'child_process';
import proc from 'find-process';
import { runGeneration } from './generate/generate';




const job = schedule.scheduleJob("* * * * *", () => {
     console.log("Generating file..");
     fs.writeFileSync("./what.txt", "Hello this is a generated file");
     console.log("Starting anki for sync...")
     exec("open /Applications/Anki.app")
     setTimeout(async () => {
         const prog = await proc("name", "Anki")
         process.kill(prog.filter(x => x.name.toLowerCase() == "anki")[0].pid); 
         runGeneration(false);
     }, 20000);
});





