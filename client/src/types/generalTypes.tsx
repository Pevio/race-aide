
export interface Race {
  raceName: string;
  raceId: string;
  startTime: number;
  city: string;
  timezone: string;
}

export interface FullRace extends Race {
  raceDetails: {
    socialMedia?: string;
    website?: string;
    registration?: string;
    picture?: string;
    distances: string[]
  }
  runners: Record<string, Runner>;
}

export interface Runner {
  bibNumber: string;
  runnerName: string;
  runnerDetails: {
    email?: string;
    distance: string;
  }
}