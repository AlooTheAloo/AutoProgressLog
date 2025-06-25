import { SemVer } from "semver";
import { win } from "../../../electron/main";
import { DEFAULT_ANKI_URL } from "../../entry/AnkiHTTPClient";
import { CacheManager } from "../../Helpers/cache";
import { getConfig } from "../../Helpers/getConfig";
import { Options } from "../../types/options";
import { setConfig } from "../../config/configManager";
import upgrade_1_0_1 from "./1.0.1";

interface previous_config {
  general: {
    autogen: ConditionalOption<ServerOptions>;
    discordIntegration: boolean;
  };
  account: {
    userName: string;
  };
  appreance: {
    glow: boolean;
  };
  toggl: {
    togglToken: string;
  };
  anki: ConditionalOption<AnkiOptions> & {
    ankiIntegration?: ankiIntegration;
  };
  outputOptions: OutputOptions;
}

interface new_config {
  general: {
    autogen: ConditionalOption<ServerOptions>;
    discordIntegration: boolean;
  };
  account: {
    userName: string;
    profilePicture: string;
  };
  appearance: {
    glow: boolean;
  };
  toggl: {
    togglToken: string;
  };
  anki: ConditionalOption<AnkiOptions> & {
    ankiIntegration?: ankiIntegration;
  };
  outputOptions: OutputOptions;
}

type ConditionalOption<T> =
  | { enabled: true; options: T }
  | { enabled: false; options?: undefined };

type AnkiOptions = {
  retentionMode: RetentionMode;
  trackedDecks: number[];
};

type ReportExtension = ".png" | ".jpg" | ".jpeg" | ".webp";

type OutputOptions = {
  outputFile: {
    path: string;
    name: string;
    extension: ReportExtension;
  };
  outputQuality: number;
};

interface ServerOptions {
  generationTime: Time;
}

type RetentionMode = "default_anki" | "true_retention";

interface Time {
  hours: number;
  minutes: number;
}

interface ankiIntegration {
  url: string;
  key: string;
}

const defaultProfilePicture =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4aJxpLDs-i-t-xiNj4uNHz1mhNpCJpR21DQ&s";

export default async function upgrade_1_0_2() {
  if (new SemVer(CacheManager.get().version).compare("1.0.2") > -1) {
    return;
  }
  upgrade_1_0_1();

  const config: previous_config = getConfig() as any as previous_config;
  if (config == undefined) return;

  const newConfig: new_config = {
    ...config,
    appearance: config.appreance,
    account: { ...config.account, profilePicture: defaultProfilePicture },
  };
  delete (newConfig as any).appreance;

  setConfig(newConfig);
  return;
}
