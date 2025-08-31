import { app, ipcMain } from "electron";
import { win } from "..";
import { Options } from "../../../apl-backend/types/options";
import { AnkiLogin, deck } from "./SetupConfigBuilder";
import { onConfigChange } from "./SettingsListeners";
import { Logger } from "../../../apl-backend/Helpers/Log";
import { EdenClient } from "./api/ApiManager";
import { APLStorage } from "./util/auth";
import { existsSync } from "fs";

let decksCards: deck[] = [];

export function ankiListeners() {
  ipcMain.handle("GetMagicAnkiFilePath", () => {
    let filepath = "";
    if (process.platform === "win32") {
      filepath = "";
    } else if (process.platform === "darwin") {
      filepath = `${app.getPath("appData")}/Anki2/User 1/collection.anki2`;
    } else filepath = "/";

    return existsSync(filepath) ? filepath : "";
  });

  ipcMain.handle("test-anki-connection", async (event: any, arg: AnkiLogin) => {
    win?.webContents.send("anki-connect-message", "Testing anki connection");
    return loadDB(arg);
  });

  ipcMain.handle(
    "test-anki-connection-key",
    async (event: any, key: string, url: string) => {
      const resp = await EdenClient.user["verify-provider"].anki.post(
        {
          ankiToken: key,
          ankiUrl: url,
        },
        {
          headers: {
            authorization: `Bearer ${await APLStorage.get("token")}`,
          },
        }
      );
      return { worked: resp.status == 200, decks: resp.data?.cards ?? [], key };
    }
  );

  onConfigChange.on(
    "config-change",
    async (oldConfig: Options, newConfig: Options) => {
      // TOOD : Let the server know
    }
  );

  ipcMain.handle("anki-decks-list", async (event: any, arg: any) => {
    return decksCards;
  });
}

export const loadDB = async (login: AnkiLogin) => {
  const no = {
    worked: false,
    decks: [],
    key: "",
  };
  const token = await APLStorage.get("token");
  if (
    login?.password == undefined ||
    login?.username == undefined ||
    login?.url == undefined
  ) {
    console.log("Login is undefined");
    return no;
  }
  try {
    const response = await EdenClient.user["verify-provider"].anki.auth.post(
      {
        username: login?.username,
        password: login?.password,
        ankiUrl: login?.url,
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    Logger.log("Response from Anki login:", "Anki");
    if (response.status == 200) {
      if (response.data == null) return no;
      decksCards = response.data.cards;
      return {
        worked: true,
        decks: response.data.cards,
        key: response.data.key,
      };
    } else return no;
  } catch (e) {
    Logger.log("Error connecting to Anki" + e, "Anki");
    return no;
  }
};
