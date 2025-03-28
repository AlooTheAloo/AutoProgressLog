import nodeScheduler, { Job } from "node-schedule";
import RPC from "discord-rpc";
import { getLiveActivity } from "../../../../apl-backend/toggl/toggl-service";
import { app } from "electron";
import { entry } from "../../../../apl-backend/types/entry";
import { GetLastEntry } from "../../../../apl-backend/Helpers/DataBase/SearchDB";
import dayjs from "dayjs";
import { runSync } from "../../../../apl-backend/generate/sync";
import { checkInternet } from "../../../../apl-backend/Helpers/Healthcheck/internetHelper";
import { getConfig } from "../../../../apl-backend/Helpers/getConfig";
import { onConfigChange } from "../SettingsListeners";
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
      rpc?.clearActivity();
    }
  });
}

async function createJob() {
  console.log("Creating job");
  const config = getConfig();
  if (config == undefined || !config.general.discordIntegration) return;

  rpc = new RPC.Client({ transport: "ipc" });

  await tryLoginWithRetries(rpc, clientId);

  ready = true;
  console.log("Discord RPC ready");

  rpc.on("error", (err) => {
    console.error("RPC Error:", err);
  });

  rpc.on("disconnected", () => {
    console.warn("RPC disconnected. Will retry login...");
    ready = false;
    tryLoginWithRetries(rpc!, clientId);
  });

  job = nodeScheduler.scheduleJob(`*/10 * * * * *`, async () => {
    if (!ready || !(await checkInternet())) return;

    const activity = await getLiveActivity();
    if (!activity || activity.length === 0) {
      rpc!.clearActivity();
      return;
    }

    const single = activity[0];
    if (currentActivity && activity.length === 0) {
      setTimeout(() => {
        console.log("Runsync 2");
        runSync();
      }, 10000);
      rpc!.clearActivity();
      currentActivity = null;
    }

    if (activity.length === 0) return;

    const lastEntry = await GetLastEntry();
    const seconds =
      (lastEntry?.toggl?.totalSeconds ?? 0) +
      Math.abs(dayjs(single.start).diff(dayjs(), "seconds"));

    await rpc!.setActivity({
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

async function tryLoginWithRetries(
  rpc: RPC.Client,
  clientId: string,
  maxRetries = 20
) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      await rpc.login({ clientId });
      console.log("Logged in to Discord RPC");
      return;
    } catch (err) {
      attempt++;
      const waitTime = Math.pow(2, attempt) * 1000;
      console.warn(
        `RPC login failed (attempt ${attempt}). Retrying in ${
          waitTime / 1000
        }s...`
      );
      if (attempt >= maxRetries) {
        console.error(
          "Failed to login to Discord RPC after multiple attempts.",
          err
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

function padToMinLength(str: string, len: number) {
  return str.length >= len ? str : str.padEnd(len, " ");
}
