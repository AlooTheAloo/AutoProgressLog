import { ipcMain } from "electron";
import { win } from "..";
import { Options } from "../../../apl-backend/types/options";
import { AnkiLogin, deck } from "./SetupConfigBuilder";
import { onConfigChange } from "./SettingsListeners";
import { Logger } from "../../../apl-backend/Helpers/Log";
import { EdenClient } from "./api/ApiManager";
import { APLStorage } from "./util/auth";

let decksCards: deck[] = [];

export function ankiListeners() {
  ipcMain.handle("test-anki-connection", async (event: any, arg: AnkiLogin) => {
    win?.webContents.send("anki-connect-message", "Testing anki connection");
    return loadDB(arg);
  });

  ipcMain.handle(
    "test-anki-connection-key",
    async (event: any, key: string, url: string) => {
      // TODO : Make API Call here (and ship to server)
      // win?.webContents.send("anki-connect-message", "Authenticating");
      // const httpClient = new AnkiHTTPClient(key, url);
      // return loadDB(httpClient);
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
  const token = await APLStorage.get("token");
  if (
    login?.password == undefined ||
    login?.username == undefined ||
    login?.url == undefined
  ) {
    console.log("Login is undefined");
    return false;
  }
  try {
    const response = await EdenClient.user["verify-provider"].anki.post(
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
      if (response.data == null) return false;
      decksCards = response.data.cards;
      return response.data.key;
    } else return false;
  } catch (e) {
    Logger.log("Error connecting to Anki" + e, "Anki");
    return false;
  }
};
