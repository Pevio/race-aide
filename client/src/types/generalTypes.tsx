export interface Race {
  raceName: string;
  raceId: string;
  startTime: number;
  city: string;
  timezone: string;
}

export interface FullRace extends Race {
  raceDetails: Partial<RaceDetails>;
  runners: Record<string, Runner>;
  checkpoints: {};
  adminPassword?: string;
  checkpointPassword?: string;
}
export interface RaceDetails {
  socialMedia: string;
  website: string;
  registration: string;
  picture: string;
  distances: string[];
  logoUrl: string;
}

export interface Runner {
  bibNumber: string;
  runnerName: string;
  runnerDetails: Partial<{
    email: string;
    distance: string;
  }>;
}

export type RaceAuthorization = "RACE_ADMIN" | "RACE_OFFICER";
export const RaceAuthorizationDescription: Record<RaceAuthorization, string> = {
  RACE_ADMIN: "Race Admin",
  RACE_OFFICER: "Race Officer",
};
