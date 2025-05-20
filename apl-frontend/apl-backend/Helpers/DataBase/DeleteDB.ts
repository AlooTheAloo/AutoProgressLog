import sqlite3 from "sqlite3";
import { syncDataPath } from "../getConfig";

export async function deleteSyncs(from: number) {
  return new Promise<void>((res, rej) => {
    new sqlite3.Database(syncDataPath).all(
      `
            DELETE FROM syncData WHERE id > ${from}`,
      async (err, rows: { id: number }[]) => {
        if (err) {
          console.log(err);
        }
        res();
      },
    );
  });
}
