import dayjs from "dayjs";
import plugin from "dayjs/plugin/duration";
import { GetImmersionSourcesSince, GetImmersionTimeSince, GetLastEntry } from "../Helpers/DataBase/SearchDB";
import { getConfig, syncDataPath } from "../Helpers/getConfig";
import { getTimeEntries } from "../toggl/toggl-service";
import { WriteEntries, WriteSyncData } from "../Helpers/DataBase/WriteDB";
import { CreateDTO } from "../../electron/main/Electron-Backend/DashboardListeners";
import { DashboardDTO } from "../../electron/main/Electron-Backend/types/Dashboard";
import { CacheManager } from "../Helpers/cache";
import { CreateDB } from "../Helpers/DataBase/CreateDB";
import sqlite3 from "sqlite3";
import { runSync } from "../generate/sync";

const b = async() => {
    let db = new sqlite3.Database(syncDataPath, 
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
    (err) => { 
        console.log("meow")
    });
}

b();

