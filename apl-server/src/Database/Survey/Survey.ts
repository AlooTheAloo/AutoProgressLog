import Database from "bun:sqlite";
import { SurveyAnswer } from "../../Routes/SurveyAnswer";
import { db } from "..";
import { u } from "../Util/u";

const survetAnswerTable = "survey_answer";

export function InsertSurvey(SurveyAnswer:SurveyAnswer) {
    db.query(`INSERT INTO ${survetAnswerTable} (track, refold_knows, refold_stage, years, language, appsUsing) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(...u(SurveyAnswer.track, SurveyAnswer.refoldData?.knows, SurveyAnswer.refoldData?.stage, SurveyAnswer.years, SurveyAnswer.language, 
        JSON.stringify(SurveyAnswer.appsUsing)));
}

export function CreateSurveyTable(db: Database) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS ${survetAnswerTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        track TEXT NULL,
        refold_knows BOOLEAN NULL,
        refold_stage TEXT NULL,
        years INTEGER NULL,
        language TEXT NULL,
        appsUsing TEXT NULL)
    `);
}