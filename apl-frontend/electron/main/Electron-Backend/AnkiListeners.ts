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
import path, { basename, join } from "path";
import { onConfigChange } from "./SettingsListeners";
import AnkiHTTPClient from "../../../apl-backend/entry/AnkiHTTPClient";
import { ankiPath } from "../../../apl-backend/Helpers/getConfig";

export function ankiListeners() {
  ipcMain.handle("test-anki-connection", async (event: any, arg: ankiLogin) => {
    win?.webContents.send("anki-connect-message", "Authenticating");

    const httpClient = new AnkiHTTPClient("", arg.url);
    await httpClient.login(arg.username, arg.password);
    return loadDB(httpClient);
  });

  ipcMain.handle(
    "test-anki-connection-key",
    async (event: any, key: string, url: string) => {
      console.log("key is " + key);
      console.log("url is " + url);
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
      win?.webContents.send("anki-connect-message", "Reading decks");
      const decks = await getDecksCards();
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
    console.log("set login to " + JSON.stringify(login));
  });

  ipcMain.handle("anki-connect-start", async (event: any) => {
    win?.webContents.send("anki-connect-message", "Authenticating");
    if (login == undefined) return false;

    const httpClient = new AnkiHTTPClient();
    await httpClient.login(login?.username, login?.password);
    return await connectFromClient(httpClient, login);
  });

  async function connectFromClient(client: AnkiHTTPClient, login: ankiLogin) {
    console.log(1);
    if (login == undefined) return false;
    console.log(2);
    if (!client.isLoggedIn()) return false;
    console.log(3);
    win?.webContents.send("anki-connect-message", "Downloading Anki Database");
    console.log(4);
    await client.downloadInitialDatabase(ankiPath);
    console.log(5);
    const integration = await createAnkiIntegration(login);
    console.log("integration is " + JSON.stringify(integration));

    if (integration) {
      setAnkiIntegration(integration);
    }
    console.log("!!integration" + !!integration);
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
