import { SemVer } from "semver";
import { win } from "../../../electron/main";
import { DEFAULT_ANKI_URL } from "../../entry/AnkiHTTPClient";
import { CacheManager } from "../../Helpers/cache";
import { getConfig } from "../../Helpers/getConfig";
import { Options } from "../../types/options";
import { setConfig } from "../../config/configManager";

interface previous_config {
  general: {
    autogen: ConditionalOption<ServerOptions>;
    discordIntegration: boolean;
  };
  account: {
    userName: string;
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

interface AnkiIntegration {
  ankiPath?: string;
  ankiDB?: string;
  profile?: string;
}

type AnkiOptions = {
  retentionMode: RetentionMode;
  trackedDecks: number[];
};

type ReportExtension = ".png" | ".jpg" | ".jpeg" | ".webp";
const reportExtensions = [".png", ".jpg", ".jpeg", ".webp"];

type OutputOptions = {
  outputFile: {
    path: string;
    name: string;
    extension: ReportExtension;
  };
  outputQuality: number;
};

interface ankiOptions {
  enabled: boolean;
  ankiIntegration?: ankiIntegration;
  options?: {
    retentionMode: RetentionMode;
    trackedDecks: number[];
  };
}

type outputOptions = {
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

export default async function upgrade_1_0_1() {
  if (new SemVer(CacheManager.get().version).compare("1.0.1") > -1) {
    return;
  }
  const config: previous_config = getConfig() as previous_config;
  if (config == undefined) return;

  console.log("Had integration " + config.anki.ankiIntegration);
  const hadIntegration = config.anki.ankiIntegration != undefined;
  delete config.anki.ankiIntegration;

  const new_config: Options = getConfig() as Options;
  if (hadIntegration) {
    new_config.anki.ankiIntegration = {
      url: DEFAULT_ANKI_URL,
      key: "",
    };
  }
  new_config.appreance = {
    glow: true,
  };

  console.log("New config is " + JSON.stringify(new_config));
  setConfig(new_config);
  return;
}
