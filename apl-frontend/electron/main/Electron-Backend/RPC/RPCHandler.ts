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
let ready = false;
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

  await tryLoginWithRetries(clientId);

  ready = true;
  console.log("Discord RPC ready");

  rpc.on("error", (err) => {
    console.error("RPC Error:", err);
  });

  rpc.on("disconnected", async () => {
    console.warn("RPC disconnected. Reinitializing client...");

    ready = false;
    try {
      rpc?.destroy(); // Optional, just in case
    } catch (e) {
      console.warn("Failed to destroy old RPC client:", e);
    }
    killListeners();
    createListeners();
  });

  SocketClient.instance.on("ActivityStart", async (event) => {
    console.log("AStart");
    const lastEntry = await GetLastEntry();
    const seconds =
      (lastEntry?.toggl?.totalSeconds ?? 0) +
      Math.abs(dayjs(event.start).diff(dayjs(), "seconds"));

    console.log("Connected : " + rpc?.isConnected);
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
    currentActivity = null;
    rpc?.user?.clearActivity();
  });
}

async function tryLoginWithRetries(clientId: string) {
  rpc = new RPC.Client({
    clientId: clientId,
    transport: {
      type: "ipc",
    },
  });

  let attempt = 0;
  while (true) {
    try {
      await rpc.login();
      console.log("Logged in to Discord RPC");
      return;
    } catch (err) {
      attempt++;
      let waitTime = Math.pow(2, Math.min(attempt, 5)) * 1000;
      console.warn(
        `RPC login failed (attempt ${attempt}). Retrying in ${
          waitTime / 1000
        }s...`
      );
      console.log("failed due to ", err);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

function padToMinLength(str: string, len: number) {
  return str.length >= len ? str : str.padEnd(len, " ");
}
