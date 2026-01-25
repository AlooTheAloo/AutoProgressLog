import { SemVer } from "semver";
import { win } from "../../../../apl-frontend/electron/main";
import { CacheManager } from "../../Helpers/cache";
import {
  getConfig,
  getLegacyConfig,
  setLegacyConfig,
} from "../../Helpers/getConfig";
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

interface new_config {
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

const defaultProfilePicture =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4aJxpLDs-i-t-xiNj4uNHz1mhNpCJpR21DQ&s";

export default async function upgrade_1_0_1() {
  if (new SemVer(CacheManager.get().version ?? "0.0.0").compare("1.0.1") > -1) {
    return;
  }
  const config: previous_config = (await getLegacyConfig()) as previous_config;
  if (config == undefined) return;

  const hadIntegration = config.anki.ankiIntegration != undefined;
  delete config.anki.ankiIntegration;

  const new_config: new_config = getLegacyConfig() as any as new_config;
  if (hadIntegration) {
    new_config.anki.ankiIntegration = {
      url: "https://sync.ankiweb.net/",
      key: "",
    };
  }
  new_config.appreance = {
    glow: true,
  };

  setLegacyConfig(new_config);
  return;
}
