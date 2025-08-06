import { app, dialog, ipcMain } from "electron";
import { Tags, Toggl } from "toggl-track";
import {
  ankiIntegration,
  ankiOptions,
  Options,
  RetentionMode,
  ServerOptions,
} from "../../../apl-backend/types/options";
import { existsSync, writeFileSync } from "fs";
import { configPath } from "../../../apl-backend/Helpers/getConfig";
import { win } from "..";
import path from "path";
import machineId from "node-machine-id";
import os from "os";
import { EdenClient } from "./api/ApiManager";
import { APLStorage } from "./util/auth";
import { Logger } from "../../../apl-backend/Helpers/Log";
import { HttpStatusCode } from "axios";
import dayjs from "dayjs";
import { loadDB } from "./AnkiListeners";

export interface AnkiLogin {
  username: string;
  password: string;
  url: string;
}

export interface deck {
  name: string;
  cardCount: number;
  id: number;
}

interface TogglAccount {
  id: number;
  name: string;
  api_token: string;
  pfp_url: string;
}

interface AnkiConfig {
  url: string;
  ankiToken: string;
  retentionMode: string;
  trackedDecks: number[];
}

let ankiLogin: AnkiLogin | undefined;
let ankiConfig: Partial<AnkiConfig> = {};
let togglAccount: TogglAccount | undefined;

const DEFAULT_CONFIG: Options = {
  general: {
    discordIntegration: false,
  },
  appearance: {
    glow: true,
  },
  outputOptions: {
    outputFile: {
      path: "",
      name: "",
      extension: ".png",
    },
    outputQuality: 5,
  },
};

const config: Partial<Options> = DEFAULT_CONFIG;

export function setAnkiIntegration(anki: ankiIntegration | false) {}

export function setupListeners() {
  ipcMain.handle("Send-Email", async (e: any, email: string) => {
    Logger.log("Sending email to " + email, "API");
    const { status } = await EdenClient.auth.login.post({
      email,
    });
  });

  ipcMain.handle(
    "approve-email-token",
    async (e: any, email: string, emailToken: string, userAgent: string) => {
      const retVal = await EdenClient.auth.validate.post({
        email,
        emailToken,
        deviceName: os.hostname().replace(/\.local$/, ""),
        deviceId: machineId.machineIdSync(),
        userAgent,
      });
      if (retVal.data == null) return false;
      if ("error" in retVal.data) {
        return false;
      } else {
        APLStorage.set("token", retVal.data.token);
        const config = await EdenClient.user.config.get({
          headers: {
            authorization: `Bearer ${retVal.data.token}`,
          },
        });
        if (config.error || config.status != 200) {
          return false;
        }
        return config.data == null ? "signup" : "login";
      }
    }
  );

  ipcMain.handle("anki-deck-select", async (e: any, arg: number[]) => {
    if (ankiConfig == undefined) return;
    ankiConfig.trackedDecks = arg;
  });

  ipcMain.handle("SetupComplete", (event: any, arg: any) => {
    win?.webContents.send("is-setup-complete", true);
  });

  ipcMain.handle("SaveConfig", async (event: any, arg: any) => {
    if (togglAccount == undefined) return;
    const resp = await EdenClient.user.config.post(
      {
        togglToken: togglAccount.api_token,
        togglUserId: togglAccount.id.toString(),
        autoGenTime: dayjs().startOf("day").toDate(),
      },
      {
        headers: {
          authorization: `Bearer ${await APLStorage.get("token")}`,
        },
      }
    );
    if (ankiConfig != undefined) {
      if (
        ankiConfig.url == undefined ||
        ankiConfig.trackedDecks == undefined ||
        ankiConfig.ankiToken == undefined
      )
        return false;

      const respAnki = await EdenClient.user.config.anki.post(
        {
          url: ankiConfig.url,
          ankiToken: ankiConfig.ankiToken,
          retentionMode: "TRUE_RETENTION",
          trackedDecks: ankiConfig.trackedDecks,
        },
        {
          headers: {
            authorization: `Bearer ${await APLStorage.get("token")}`,
          },
        }
      );
      console.log("resp is ", JSON.stringify(respAnki));
      if (respAnki.status != 200) return false;
    }

    return resp.status == 200;
  });

  ipcMain.handle("SetOutputFile", (event: any, arg: any) => {
    config.outputOptions = {
      outputFile: arg,
      outputQuality: 3,
    };
  });

  ipcMain.handle("GetPath", (evt, pathType) => {
    return app.getPath(pathType);
  });

  ipcMain.handle("OpenPathDialog", (evt, openAt) => {
    if (win == undefined) return;
    return dialog.showOpenDialogSync(win, {
      properties: ["openDirectory", "createDirectory"],
      defaultPath: openAt,
    });
  });

  ipcMain.handle("OpenFileDialog", (evt, openAt) => {
    if (win == undefined) return;
    return dialog.showOpenDialogSync(win, {
      properties: [
        "openFile",
        "showHiddenFiles",
        "dontAddToRecent",
        "createDirectory",
      ],
      defaultPath: path.dirname(openAt),
    });
  });

  ipcMain.handle("toggl-api-key-verify", async (event: any, arg: any) => {
    const token = await APLStorage.get("token");

    const verification = await EdenClient.user["verify-provider"].toggl.post(
      {
        togglToken: arg,
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    if (verification.status == HttpStatusCode.Ok) {
      if (verification.data == null) return false;
      console.log("verif is ", JSON.stringify(verification.data));
      togglAccount = {
        id: verification.data.id,
        name: verification.data.fullname,
        pfp_url: verification.data.image_url,
        api_token: verification.data.api_token,
      };
      return true;
    }

    return verification.status == HttpStatusCode.Ok;
  });

  ipcMain.handle("SetAutoGen", (event: any, arg: boolean) => {});

  ipcMain.handle("toggl-account-get", async (event: any, arg: any) => {
    return togglAccount;
  });

  ipcMain.handle("SkipAnki", async (event: any, arg: any) => {
    setAnkiIntegration(false);
  });

  ipcMain.handle("anki-credentials", async (avt: any, data: AnkiLogin) => {
    ankiLogin = data;
  });

  ipcMain.handle("get-anki-credentials", async (event: any) => {
    return ankiLogin;
  });

  ipcMain.handle("anki-connect-start", async () => {
    win?.webContents.send("anki-connect-message", "Testing anki connection");
    if (ankiLogin == undefined) return false;
    const key = await loadDB(ankiLogin);
    if (key == false) return false;
    else {
      ankiConfig.url = ankiLogin.url;
      ankiConfig.ankiToken = key;
      return true;
    }
  });
}
