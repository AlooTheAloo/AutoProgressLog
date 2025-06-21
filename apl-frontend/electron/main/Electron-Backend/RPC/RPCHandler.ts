import RPC from "@xhayper/discord-rpc";
import { app } from "electron";
import { GetLastEntry } from "../../../../apl-backend/Helpers/DataBase/SearchDB";
import dayjs from "dayjs";
import { getConfig } from "../../../../apl-backend/Helpers/getConfig";
import { onConfigChange } from "../SettingsListeners";
import { Options } from "../../../../apl-backend/types/options";
import { SocketClient } from "../Socket/SocketClient";

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
      if (
        oldConfig.general.discordIntegration !=
        newConfig.general.discordIntegration
      ) {
        if (newConfig.general.discordIntegration) {
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
}

async function createListeners() {
  const config = getConfig();
  if (config == undefined || !config.general.discordIntegration) return;

  rpc = new RPC.Client({
    clientId: clientId,
  });

  rpc.on("error", (err) => {
    console.error("RPC Error:", err);
  });

  SocketClient.instance.on("ActivityStart", async (event) => {
    const lastEntry = await GetLastEntry();
    const seconds =
      (lastEntry?.toggl?.totalSeconds ?? 0) +
      Math.abs(dayjs(event.start).diff(dayjs(), "seconds"));

    if (!rpc?.isConnected) rpc?.login();
    await rpc!.user?.setActivity({
      details: `Immersing | ${(seconds / 3600).toFixed(2)} hours`,
      state: padToMinLength(event.activity, 2),
      instance: false,
      startTimestamp: new Date(event.start),
    });

    currentActivity = event;
  });

  SocketClient.instance.on("ActivityStop", (event) => {
    if (event.id != currentActivity?.id) return;
    if (!rpc?.isConnected) rpc?.login();

    currentActivity = null;
    rpc?.user?.clearActivity();
  });
}

function padToMinLength(str: string, len: number) {
  return str.length >= len ? str : str.padEnd(len, " ");
}
