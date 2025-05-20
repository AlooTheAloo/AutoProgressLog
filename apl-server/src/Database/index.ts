import Database from "bun:sqlite";
import path from "path";
import { existsSync } from "fs";
import { CreateSurveyTable } from "./Survey/Survey";
export const dbPath = process.env.DB_PATH || './data/dev.db';  // Default to './data/dev.db' for local dev
const fullPath = path.join(process.cwd(), dbPath);
export let db:Database;

export async function initDB(){
    db = new Database(fullPath);
    createTables();
}

const createTables = async () => {
    CreateSurveyTable(db);
}