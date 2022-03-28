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
  divisions?: string[];
}
export interface RaceDistance {
  distance: number;
  startTime: number;
}

export interface Runner {
  bibNumber: string; // Key
  runnerName: string;
  distance: number;
  offset: number; // In seconds - If this runner is starting in a different wave
  dnf?: boolean;
  division?: string;
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
  id: string; // combines the above fields into a unique id for the race
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
  // Offset here is milliseconds off from the start of the race, with distance start time and original runner offset taken into account.
}
export interface ResultCheckpointInfo extends CheckpointDistance {
  timestamp?: number;
}

export interface RaceIssues {
  problemRunners: Record<string, RunnerIssue>;
  unknownEntries: UnknownEntry[];
}
export interface RunnerIssue extends Runner {
  issue: string;
  checkpointEntries: CheckpointEntry[];
}
export interface UnknownEntry {
  checkpointNumber: string;
  timestamp: number;
  bibNumber: string;
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
