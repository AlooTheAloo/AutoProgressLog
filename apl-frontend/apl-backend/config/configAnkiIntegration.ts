import { ankiIntegration } from "../types/options";
import fs, { existsSync } from "fs";
import sqlite3 from "sqlite3";
import { exec } from "child_process";
import proc from "find-process";
import { app, shell } from "electron";
import path, { basename } from "path";
import { kill } from "process";
import { getSetupAnkiIntegration } from "../../electron/main/Electron-Backend/SetupConfigBuilder";
import { win } from "../../electron/main/index";
import { ankiPath } from "../Helpers/getConfig";
import AnkiHTTPClient from "../entry/AnkiHTTPClient";

export interface ankiLogin {
  username: string;
  password: string;
  url: string;
}

export interface deck {
  name: string;
  cardCount: number;
  id: number;
}

export async function getDecksCards(): Promise<deck[]> {
  const ankiDB = ankiPath;
  if (ankiDB == undefined) return [];

  const prefsDB = new sqlite3.Database(ankiDB, (err) => {});
  return await new Promise((res, rej) => {
    if (
      prefsDB.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='cards'"
      )
    )
      prefsDB.all(
        `SELECT COUNT(*) as "cardCount", did FROM cards group by did;`,
        async (err, rowsTop: { cardCount: number; did: number }[]) => {
          if (err) {
            res([]);
            return;
          }
          const ret = await Promise.all(
            rowsTop.map(async (row) => {
              return await new Promise<deck>((res, rej) => {
                prefsDB.all(
                  `SELECT name FROM decks WHERE id = ${row.did};`,
                  (err, rows: any) => {
                    if (rows == undefined) return;
                    console.log("all rows" + JSON.stringify(rows));

                    console.log("err", err);
                    console.log("rows len", rows.length);
                    res({
                      cardCount: row.cardCount,
                      name: rows[0].name,
                      id: row.did,
                    });
                  }
                );
              });
            })
          );
          prefsDB.close();
          res(ret);
        }
      );
  });
}

export async function getDecks(chosenProfile: string): Promise<string[]> {
  const prefsDB = new sqlite3.Database(ankiPath, (err) => {});
  const decks: string[] = await new Promise((res, rej) => {
    prefsDB.all("SELECT * FROM decks", (err, rows: any[]) => {
      res(rows);
    });
  });
  prefsDB.close();
  return decks;
}

export async function createAnkiIntegration(
  ankiLogin: ankiLogin
): Promise<ankiIntegration | false> {
  const key = await new AnkiHTTPClient().login(
    ankiLogin.username,
    ankiLogin.password
  );
  if (key == undefined) return false;
  else
    return {
      key: key,
      url: ankiLogin.url,
    };
}
