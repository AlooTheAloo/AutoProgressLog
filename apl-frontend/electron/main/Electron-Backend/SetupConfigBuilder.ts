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

interface TogglAccount {
  id: string;
  name: string;
  api_token: string;
  pfp_url: string;
}

let account: TogglAccount | undefined;
const DEFAULT_CONFIG: Options = {
  account: {
    userName: "",
    profilePicture: "",
  },
  general: {
    autogen: {
      enabled: false,
      options: undefined,
    },
    discordIntegration: false,
  },
  toggl: {
    togglToken: "",
  },
  anki: {
    enabled: false,
    ankiIntegration: undefined,
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

export function setAnkiIntegration(anki: ankiIntegration | false) {
  if (!anki) {
    config.anki = {
      enabled: false,
    };
    return;
  }
  config.anki = {
    enabled: true,
    ankiIntegration: anki,
    options: {
      trackedDecks: [],
      retentionMode: "true_retention",
    },
  };
}

export function getSetupAnkiIntegration(): ankiIntegration | undefined {
  return config?.anki?.ankiIntegration;
}

export function getSetupAnki(): ankiOptions | undefined {
  return config.anki;
}

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
    if (config?.anki?.options == undefined) return;
    config.anki.options.trackedDecks = arg;
    if (arg.length == 0) {
      config.anki = {
        enabled: false,
        options: undefined,
      };
    }
  });

  ipcMain.handle("SetupComplete", (event: any, arg: any) => {
    win?.webContents.send("is-setup-complete", true);
  });

  ipcMain.handle("SaveConfig", async (event: any, arg: any) => {
    if (existsSync(configPath)) return;
    writeFileSync(configPath, JSON.stringify(config));
    // await new Promise<void>((res, rej) => {
    //   let db = new sqlite3.Database(
    //     syncDataPath,
    //     sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    //     async (err) => {
    //       let cards = 0;
    //       if (config.anki?.enabled) {
    //         cards =
    //           (await getAnkiCardReviewCount(
    //             dayjs(0),
    //             dayjs().startOf("day")
    //           )) ?? 0;
    //       }
    //       const time = await CreateDB(db, {
    //         cards: cards,
    //       });
    //       if (time == undefined) return;

    //       CacheManager.init(time, cards);
    //       res();
    //     }
    //   );
    // });
    // await buildContextMenu();

    // TODO : Make API Call here
    return;
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

  ipcMain.handle("SetAutoGen", (event: any, arg: boolean) => {
    if (arg) {
      config.general = {
        autogen: {
          enabled: true,
          options: {
            generationTime: {
              hours: 0,
              minutes: 0,
            },
          },
        },
        discordIntegration: false,
      };
    } else {
      config.general = {
        autogen: {
          enabled: false,
        },
        discordIntegration: false,
      };
    }

    if (!config.general.autogen.enabled) {
      config.general.autogen.options = undefined;
    }
  });

  ipcMain.handle("toggl-api-key-set", async (event: any, arg: any) => {
    account = undefined;
    const me = await new Toggl({
      auth: {
        token: arg,
      },
    }).me.get();

    config.toggl = {
      togglToken: arg,
    };
    config.account = {
      userName: me.fullname,
      profilePicture: me.image_url,
    };
  });

  ipcMain.handle("set-server-options", (event: any, arg: ServerOptions) => {
    if (config.general == undefined) return;
    config.general.autogen.options = arg;
  });

  ipcMain.handle("SetRetentionMode", (event: any, arg: RetentionMode) => {
    if (config.anki?.options == undefined) return;
    config.anki.options.retentionMode = arg;
  });

  ipcMain.handle("toggl-account-get", async (event: any, arg: any) => {
    if (account !== undefined) {
      return account;
    }

    if (config.toggl == undefined) return undefined;

    const me = await new Toggl({
      auth: {
        token: config.toggl.togglToken,
      },
    }).me.get();

    if (typeof me !== "object") {
      return undefined;
    }

    account = {
      id: me.id,
      name: me.fullname,
      pfp_url: me.image_url,
      api_token: config.toggl.togglToken,
    } as TogglAccount;

    return account;
  });
}
