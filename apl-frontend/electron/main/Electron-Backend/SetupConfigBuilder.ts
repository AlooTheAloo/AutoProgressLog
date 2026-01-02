import { app, dialog, ipcMain } from "electron";
import { existsSync, writeFileSync } from "fs";
import {
  configPath,
  invalidateConfigCache,
} from "../../../apl-backend/Helpers/getConfig";
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
import { SocketClient } from "./Socket/SocketClient";
import { Options } from "../../../apl-backend/types/options";
import { createListeners } from "./RPC/RPCHandler";

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
let ankiConfig: Partial<AnkiConfig> | null = null;
let togglAccount: TogglAccount | undefined;

const DEFAULT_CONFIG: Options = {
  serverOptions: {
    userOptions: {
      autoGenTime: null,
      togglToken: "",
      togglUserId: "",
    },
    ankiOptions: {
      enabled: true,
      options: {
        url: "",
        ankiToken: "",
        retentionMode: "ANKI_DEFAULT",
        trackedDecks: [],
      },
    },
    userProfile: {
      email: "",
      userName: "",
    },
  },
  localOptions: {
    general: {
      discordIntegration: false,
    },
    appearance: {
      glow: true,
    },
    outputOptions: {
      outputFile: {
        path: app.getPath("desktop"),
        name: "Progress Report",
        extension: ".png",
      },
      outputQuality: 5,
    },
  },
};

const config: Partial<Options> = DEFAULT_CONFIG;
let savedConfig = false;
export function setupListeners() {
  ipcMain.handle("Send-Email", async (e: any, email: string) => {
    Logger.log("Sending email to " + email, "API");
    const { status } = await EdenClient.auth.login.post({
      email,
    });
  });

  ipcMain.handle(
    "approve-email-token",
    async (e: any, email: string, emailToken: string, userAgent: string, isMigration: boolean) => {
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
        console.log("Config is ", config.data);
        console.log(config.response.headers.get("content-length"));

        const isLogin = config.response.headers.get("content-length") != "0";
        if (isLogin) {
          await APLStorage.set("token", retVal.data.token);
          console.log("token has been set!");
          if(!isMigration){
            await APLStorage.set("setupComplete", true);
            win?.webContents.send("is-setup-complete", true);
            win?.webContents.send("set-sidebar-state", true);
          }
          return "login";
        } else return "signup";
      }
    }
  );

  ipcMain.handle("anki-deck-select", async (e: any, arg: number[]) => {
    if (ankiConfig == undefined) return;
    ankiConfig.trackedDecks = arg;
  });

  ipcMain.handle("SetupComplete", async (event: any, arg: any) => {
    console.log("token has been get!");
    await new SocketClient().init({
      token: (await APLStorage.get("token")) as string,
    });
    await createListeners();
    win?.webContents.send("is-setup-complete", true);
    win?.webContents.send("set-sidebar-state", true);
  });

  ipcMain.handle("SaveConfig", async (event: any, arg: any) => {
    console.log("Save config is called");
    if (togglAccount == undefined) return;
    const resp = await EdenClient.user.config.post(
      {
        togglToken: togglAccount.api_token,
        togglUserId: togglAccount.id.toString(),
        autoGenTime: {
          secondsSinceMidnight: 0,
          timezone:
            Intl.DateTimeFormat().resolvedOptions().timeZone ??
            "America/Toronto",
        },
      },
      {
        headers: {
          authorization: `Bearer ${await APLStorage.get("token")}`,
        },
      }
    );

    console.log("And ankiconfig is " + JSON.stringify(ankiConfig));
    console.log("resp " + JSON.stringify(resp));
    if (ankiConfig != null) {
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
          trackedDecks: ankiConfig.trackedDecks.map((x) => x.toString()),
        },
        {
          headers: {
            authorization: `Bearer ${await APLStorage.get("token")}`,
          },
        }
      );
      console.log("Tracked decks is ", ankiConfig.trackedDecks);
      console.log("resp is ", JSON.stringify(respAnki));

      if (respAnki.status != 200) return false;
    }
    APLStorage.set("localConfig", config.localOptions);

    if (resp.status == 200) {
      console.log("setup complete !!!");
      await APLStorage.set("setupComplete", true);
    }

    invalidateConfigCache();

    return resp.status == 200;
  });

  ipcMain.handle("SetOutputFile", (event: any, arg: any) => {
    if (config.localOptions == undefined) return;
    config.localOptions.outputOptions = {
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
    if (config.serverOptions == undefined) return;
    config.serverOptions.ankiOptions.enabled = false;
    config.serverOptions.ankiOptions.options = undefined;
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
    const resp = await loadDB(ankiLogin);
    if (resp.worked == false) return false;
    else {
      ankiConfig = {
        url: ankiLogin.url,
        ankiToken: resp.key,
      };
      return true;
    }
  });
}
