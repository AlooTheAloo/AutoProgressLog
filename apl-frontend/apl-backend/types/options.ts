export interface Options {
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

export type ConditionalOption<T> =
  | { enabled: true; options: T }
  | { enabled: false; options?: undefined };

export type AnkiOptions = {
  retentionMode: RetentionMode;
  trackedDecks: number[];
};

export type ReportExtension = ".png" | ".jpg" | ".jpeg";
export const reportExtensions = [".png", ".jpg", ".jpeg"];

export type OutputOptions = {
  outputFile: {
    path: string;
    name: string;
    extension: ReportExtension;
  };
  outputQuality: number;
};

export interface ankiOptions {
  enabled: boolean;
  ankiIntegration?: ankiIntegration;
  options?: {
    retentionMode: RetentionMode;
    trackedDecks: number[];
  };
}

export type outputOptions = {
  outputFile: {
    path: string;
    name: string;
    extension: ReportExtension;
  };
  outputQuality: number;
};

export interface ServerOptions {
  generationTime: Time;
}

export type RetentionMode = "default_anki" | "true_retention";

export interface Time {
  hours: number;
  minutes: number;
}

export interface ankiIntegration {
  url: string;
  key: string;
}
