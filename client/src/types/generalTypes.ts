export interface Race {
  raceName: string;
  raceId: string; // Key
  startTime: number;
  city: string;
  timezone: string;
}

export interface FullRace extends Race {
  raceDetails: RaceDetails;
  runners: Record<string, Runner>; // Key is the bibNumber
  checkpoints: Record<string, Checkpoint>;
  adminPassword?: string;
  checkpointPassword?: string;
}
export interface RaceDetails {
  website?: string;
  registration?: string;
  distances: RaceDistance[];
  raceEmail?: string;
}
export interface RaceDistance {
  distance: number;
  startTime: number;
}

export interface Runner {
  bibNumber: string; // Key
  runnerName: string;
  distance: number;
  offset: number; // If this runner is starting in a different wave
  dnf?: boolean;
}

export interface Checkpoint {
  distances: CheckpointDetails[];
  checkpointNumber: string; // Key
  runnersPassed: Record<string, number[]>; // [bibNumber][index of the time this runner passed this checkpoint]
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
  id: string;
}

// Results for a single runner
export type RaceResultsFull = Record<string, RaceDistanceResults>;
export interface RaceDistanceResults {
  runners: Record<string, RaceResult>;
  checkpoints: CheckpointDistance[];
  startTime: number; // Start time for this distance
}
export interface RaceResult extends Runner {
  checkpointInfo: ResultCheckpointInfo[];
}
export interface ResultCheckpointInfo extends CheckpointDistance {
  timestamp?: number;
}

export interface RaceIssues {
  problemRunners: Record<string, RaceResult>;
  unknownEntries: UnknownEntry[]
}
export interface UnknownEntry {
  checkpointNumber: string;
  timestamp: number;
}
export interface CheckpointEntry {
  checkpointNumber: string;
  bibNumber: string;
  timestamp: number;
}

export interface RunnerDistance {
  lastTime: number; // If not provided
  distance: number;
}
export type RaceAuthorization = "RACE_ADMIN" | "RACE_ASSISTANT";
export const RaceAuthorizationDescription: Record<RaceAuthorization, string> = {
  RACE_ADMIN: "Race Admin",
  RACE_ASSISTANT: "Race Assistant",
};
