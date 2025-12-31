import dayjs from "dayjs";

export type DashboardDTO = {
  userName: string;
  profile_picture: string;
  lastSyncTime: string;
  lastReportTime: string;
  immersionDTO: ImmersionDTO;
  ankiDTO?: AnkiDTO;
  nextReport: number | null;
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
  immersionStreak: {
    label: string;
    seconds: number;
  }[];
};

export type ImmersionSource = {
  name: string;
  relativeValue: number;
};
