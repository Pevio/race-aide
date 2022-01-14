export interface Race {
  raceName: string;
  raceId: string; // Key
  startTime: number;
  city: string;
  timezone: string;
}

export interface FullRace extends Race {
  raceDetails: Partial<RaceDetails>;
  runners: Record<string, Runner>; // Key is the bibNumber
  checkpoints: Checkpoint[];
  adminPassword?: string;
  checkpointPassword?: string;
}
export interface RaceDetails {
  socialMedia: string;
  website: string;
  registration: string;
  picture: string;
  distances: number[];
  logoUrl: string;
}

export interface Runner {
  bibNumber: string; // Key
  runnerName: string;
  distance: number;
  offset: number; // If this runner is starting in a different wave
}

export interface Checkpoint {
  distances: CheckpointDetails[];
  checkpointNumber: string; // Key
  runnersPassed: Record<string, Record<string, number[]>>; // [bibNumber][checkpointNumber][index of the time this runner passed this checkpoint]
}
export interface CheckpointDetails {
  // This object does not have a key;
  raceDistance: number; // 5K, 10K, etc
  distance: number; // The distance that the runners will have gone
}

// Ambiguous of the race or if this checkpoint appears multiple times
export interface CheckpointDistance {
  checkpointNumber: string;
  distance: number;
}

export interface RunnerAtCheckpoint {
  bibNumber?: string; // If not provided
  distance: number;
}
export type RaceAuthorization = "RACE_ADMIN" | "RACE_ASSISTANT";
export const RaceAuthorizationDescription: Record<RaceAuthorization, string> = {
  RACE_ADMIN: "Race Admin",
  RACE_ASSISTANT: "Race Assistant",
};
