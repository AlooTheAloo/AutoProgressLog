import dayjs from "dayjs";

export type DashboardDTO = {
  userName: string;
  profile_picture: ProfilePicture;
  lastSyncTime: string;
  lastReportTime: string;
  immersionDTO: ImmersionDTO;
  ankiDTO?: AnkiDTO;
  monthlyScore: number;
  syncCount: number;
  nextReport: number | null;
};

export type ProfilePicture = {
  buffer: string;
  isUrl: boolean;
};

export type AnkiDTO = {
  retentionRate: number;
  retentionRateDelta: number;

  totalReviews: number;
  reviewsDelta: number;
};

export type ImmersionDTO = {
  totalImmersion: number;
  immersionSinceLastReport: number;
  monthlyImmersion: number;
  monthlyImmersionLastMonth: number;
  immersionSources: {
    name: string;
    relativeValue: number;
  }[];
};

export type ImmersionSource = {
  name: string;
  relativeValue: number;
};
