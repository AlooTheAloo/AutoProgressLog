import RPC from "@xhayper/discord-rpc";
import { app } from "electron";
import { GetLastEntry } from "../../../../apl-backend/Helpers/DataBase/SearchDB";
import dayjs from "dayjs";
import { getConfig } from "../../../../apl-backend/Helpers/getConfig";
import { onConfigChange } from "../SettingsListeners";
import { Options } from "../../../../apl-backend/types/options";
import { SocketClient } from "../Socket/SocketClient";
import { Socket } from "dgram";
import { Logger } from "../../../../apl-backend/Helpers/Log";
import { APLStorage } from "../util/auth";
import { DashboardDTO } from "../types/Dashboard";

type miniEvent = {
  activity: string;
  start: string;
  id: string;
};

const clientId = "1330290329261445221";
let currentActivity: miniEvent | null = null;
let rpc: RPC.Client | null = null;

export function createAutoRPC() {
  createListeners();

  onConfigChange.on(
    "config-change",
    async (oldConfig: Options, newConfig: Options) => {
      console.log("config-change", JSON.stringify(oldConfig), JSON.stringify(newConfig));
      if (
        oldConfig.localOptions.general.discordIntegration !=
        newConfig.localOptions.general.discordIntegration
      ) {
        if (newConfig.localOptions.general.discordIntegration) {
          await createListeners();
        } else {
          killListeners();
        }
      }
    }
  );

  app.on("before-quit", () => {
    if (currentActivity != null) {
      rpc?.user?.clearActivity();
    }
  });
}

async function killListeners() {
  SocketClient.instance.off("ActivityStart");
  SocketClient.instance.off("ActivityStop");
  SocketClient.instance.off("ClearActivity");
}

async function createListeners() {
  const config = await getConfig();
  if (config == undefined || !config.localOptions.general.discordIntegration)
    return;

  rpc = new RPC.Client({
    clientId: clientId,
  });

  rpc.on("error", (err) => {
    console.error("RPC Error:", err);
  });

  SocketClient.instance.on("ActivityStart", async (event) => {
    Logger.log("Start Activity", "Socket");

    const lastEntry = (await APLStorage.get<DashboardDTO>(
      "Cached_DTO"
    )) as DashboardDTO;

    const seconds =
      (lastEntry?.immersionDTO.totalImmersion ?? 0) +
      Math.abs(dayjs(event.start).diff(dayjs(), "seconds"));

    console.log("seconds is " + seconds);

    if (!rpc?.isConnected) await rpc?.login();
    console.log("rpc.setactivity");
    await rpc!.user?.setActivity({
      details: `Immersing | ${(seconds / 3600).toFixed(2)} hours`,
      state: padToMinLength(event.activity, 2),
      instance: false,
      startTimestamp: new Date(event.start),
    });

    currentActivity = event;
  });

  SocketClient.instance.on("ClearActivity", async (event) => {
    if (!rpc?.isConnected) await rpc?.login();
    currentActivity = null;
    rpc?.user?.clearActivity();
  });

  SocketClient.instance.on("ActivityStop", async (event) => {
    if (event.id != currentActivity?.id) return;
    if (!rpc?.isConnected) await rpc?.login();

    currentActivity = null;
    rpc?.user?.clearActivity();
  });
}

function padToMinLength(str: string, len: number) {
  return str.length >= len ? str : str.padEnd(len, " ");
}
