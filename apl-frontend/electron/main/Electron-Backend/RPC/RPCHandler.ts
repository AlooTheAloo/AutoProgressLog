import nodeScheduler, { Job } from "node-schedule";
import RPC from "@xhayper/discord-rpc";
import { getLiveActivity } from "../../../../apl-backend/toggl/toggl-service";
import { app } from "electron";
import { entry } from "../../../../apl-backend/types/entry";
import { GetLastEntry } from "../../../../apl-backend/Helpers/DataBase/SearchDB";
import dayjs from "dayjs";
import { runSync } from "../../../../apl-backend/generate/sync";
import { checkInternet } from "../../../../apl-backend/Helpers/Healthcheck/internetHelper";
import { getConfig } from "../../../../apl-backend/Helpers/getConfig";
import { onConfigChange } from "../settingsListeners";
import { Options } from "../../../../apl-backend/types/options";

const clientId = "1330290329261445221";
let ready = false;
let currentActivity: entry | null = null;
let job: Job | null = null;
let rpc: RPC.Client | null = null;

export function createAutoRPC() {
  createJob();

  onConfigChange.on(
    "config-change",
    async (oldConfig: Options, newConfig: Options) => {
      if (
        oldConfig.general.discordIntegration !=
        newConfig.general.discordIntegration
      ) {
        if (newConfig.general.discordIntegration) {
          await createJob();
        } else {
          job?.cancel();
          job = null;
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

async function createJob() {
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

    // Clean up old client
    try {
      rpc?.destroy(); // Optional, just in case
    } catch (e) {
      console.warn("Failed to destroy old RPC client:", e);
    }

    job?.cancel();

    createJob();
  });

  job = nodeScheduler.scheduleJob(`*/10 * * * * *`, async () => {
    if (!ready || !(await checkInternet())) {
      console.log("Not ready to run RPC job");
      return;
    }

    const activity = await getLiveActivity();
    if (!activity || activity.length === 0) {
      rpc!.user?.clearActivity();
      return;
    }

    const single = activity[0];
    if (currentActivity && activity.length === 0) {
      setTimeout(() => {
        runSync();
      }, 10000);
      rpc?.user?.clearActivity();
      currentActivity = null;
    }

    if (activity.length === 0) return;

    const lastEntry = await GetLastEntry();
    const seconds =
      (lastEntry?.toggl?.totalSeconds ?? 0) +
      Math.abs(dayjs(single.start).diff(dayjs(), "seconds"));

    await rpc!.user?.setActivity({
      details: `Immersing | ${(seconds / 3600).toFixed(2)} hours`,
      state: padToMinLength(single.description, 2),
      instance: false,
      startTimestamp: new Date(single.start),
    });

    console.log("Set current activity to ", single.description);
    currentActivity = single;
  });

  job.invoke();
}

async function reconnectRPC() {
  await tryLoginWithRetries(clientId);
  ready = true;
  console.log("Reconnected to Discord RPC");
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
