export interface Options {
  localOptions: APLLocalOptions;
  serverOptions: APLServerOptions;
}

export type APLLocalOptions = {
  general: {
    discordIntegration: boolean;
  };
  appearance: {
    glow: boolean;
  };
  outputOptions: OutputOptions;
};

export type APLServerOptions = {
  userOptions: {
    autoGenTime: Date | null;
    togglToken: string;
    togglUserId: string;
  };
  ankiOptions: ConditionalOption<{
    url: string;
    ankiToken: string;
    retentionMode: RetentionMode;
    trackedDecks: string[];
  }>;
};

export type ConditionalOption<T> =
  | { enabled: true; options: T }
  | { enabled: false; options?: undefined };

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

export type RetentionMode = "ANKI_DEFAULT" | "TRUE_RETENTION";
