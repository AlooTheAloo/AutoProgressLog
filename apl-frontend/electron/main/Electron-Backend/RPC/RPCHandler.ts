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

function createJob() {
  const config = getConfig();
  if (config == undefined) return;

  if (!config.general.discordIntegration)
    // If autogen is disabled, don't do anything
    return;
  const rpc = new RPC.Client({ transport: "ipc" });
  rpc.login({ clientId }).catch();

  job = nodeScheduler.scheduleJob(`*/10 * * * * *`, async () => {
    if (!ready || !(await checkInternet())) return;
    const activity = await getLiveActivity();
    if (activity?.length == 0 || activity == undefined) {
      rpc.clearActivity();
      return;
    }
    if (currentActivity != null && activity.length == 0) {
      setTimeout(() => {
        runSync();
      }, 10000);
      rpc.clearActivity();
      currentActivity = null;
    }
    if (activity.length == 0) return;
    const single = activity[0];
    if (single.id != currentActivity?.id) {
      setTimeout(() => {
        runSync();
      }, 10000);
    }
    const lastEntry = await GetLastEntry();
    const seconds =
      (lastEntry?.toggl?.totalSeconds ?? 0) +
      Math.abs(dayjs(single.start).diff(dayjs(), "seconds"));

    // if(seconds == null) return;
    const a = await rpc.setActivity({
      details: `Immersing | ${(seconds / 3600).toFixed(2)} hours`,
      state: single.description, // What the user is doing
      instance: false,
      startTimestamp: new Date(single.start),
      // buttons: [
      //     {
      //         label: 'Get the app',
      //         url: 'https://www.aplapp.dev/#/',
      //     },
      // ],
    });
    currentActivity = single;
  });

  job.invoke();

  rpc.on("ready", () => {
    ready = true;
  });
}
