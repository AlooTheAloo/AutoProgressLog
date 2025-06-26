import { dialog, ipcMain } from "electron";
import { win } from "..";
import { ankiIntegration, Options } from "../../../apl-backend/types/options";
import {
  getSetupAnkiIntegration,
  setAnkiIntegration,
} from "./SetupConfigBuilder";
import {
  DeleteAnkiData,
  getAnkiCardReviewCount,
  getMatureCards,
  getRetention,
} from "../../../apl-backend/anki/db";
import { roundTo } from "round-to";
import {
  ankiLogin,
  createAnkiIntegration,
  getDecksCards,
} from "../../../apl-backend/config/configAnkiIntegration";
import { onConfigChange } from "./SettingsListeners";
import AnkiHTTPClient from "../../../apl-backend/entry/AnkiHTTPClient";
import { ankiPath } from "../../../apl-backend/Helpers/getConfig";

export function ankiListeners() {
  ipcMain.handle("test-anki-connection", async (event: any, arg: ankiLogin) => {
    win?.webContents.send("anki-connect-message", "Authenticating");

    const httpClient = new AnkiHTTPClient("", arg.url);
    const loginInfo = await httpClient.login(arg.username, arg.password);
    console.log("Info is " + loginInfo);
    win?.webContents.send("anki-connect-message", "Downloading Anki Database");
    return loadDB(httpClient);
  });

  ipcMain.handle(
    "test-anki-connection-key",
    async (event: any, key: string, url: string) => {
      win?.webContents.send("anki-connect-message", "Authenticating");
      const httpClient = new AnkiHTTPClient(key, url);
      return loadDB(httpClient);
    }
  );

  const loadDB = async (client: AnkiHTTPClient) => {
    const worked = await client.downloadInitialDatabase(ankiPath);
    console.log("worked is " + worked);
    if (!worked) {
      return { worked: false, decks: [], key: "" };
    } else {
      console.log("clearly because it worked we're here");
      win?.webContents.send("anki-connect-message", "Reading decks");
      const decks = await getDecksCards();
      console.log("and my decks are " + decks);
      console.log("decks is " + decks);
      return { worked: true, decks: decks, key: client.key };
    }
  };

  ipcMain.handle("anki-read-data", async (event: any, arg: any) => {
    const int = getSetupAnkiIntegration();
    if (int == undefined) return undefined;
    const retention = await getRetention(arg);
    if (retention == undefined) return undefined;
    const matureCards = await getMatureCards();
    return {
      retentionRate: roundTo(retention, 2),
      matureCardCount: matureCards,
    };
  });

  ipcMain.handle("SkipAnki", async (event: any, arg: any) => {
    setAnkiIntegration(false);
  });

  ipcMain.handle("anki-decks-list", async (event: any, arg: any) => {
    const decksCards = await getDecksCards();
    return decksCards;
  });

  let login: ankiLogin | undefined;
  ipcMain.handle("anki-credentials", async (avt: any, data: ankiLogin) => {
    login = data;
  });

  ipcMain.handle("get-anki-credentials", async (event: any) => {
    return login;
  });

  ipcMain.handle("anki-connect-start", async (event: any) => {
    try {
      // win?.webContents.send("anki-connect-message", "Authenticating");
      // if (login == undefined) return false;
      // const httpClient = new AnkiHTTPClient(login.url);
      // await httpClient.login(login?.username, login?.password);
      // return await connectFromClient(httpClient, login);
    } catch (e) {
      console.log("Error connecting to Anki" + e);
      return false;
    }
  });

  async function connectFromClient(client: AnkiHTTPClient, login: ankiLogin) {
    if (login == undefined) return false;
    if (!client.isLoggedIn()) return false;
    win?.webContents.send("anki-connect-message", "Downloading Anki Database");

    await client.downloadInitialDatabase(ankiPath);
    const integration = await createAnkiIntegration(login);

    if (integration) {
      setAnkiIntegration(integration);
    }
    return !!integration;
  }

  onConfigChange.on(
    "config-change",
    async (oldConfig: Options, newConfig: Options) => {
      if (oldConfig.anki.enabled && !newConfig.anki.enabled) {
        await DeleteAnkiData();
      }
    }
  );
}
