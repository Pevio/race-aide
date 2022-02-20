import {
  Checkpoint,
  CheckpointDetails,
  CheckpointDistance,
  CheckpointEntry,
  FullRace,
  Race,
  RaceDistance,
  RaceIssues,
  RaceResult,
  RaceResultsFull,
  ResultCheckpointInfo,
  Runner,
  RunnerDistance,
} from "../types/generalTypes";

export const raceHasStarted = (race?: FullRace | Race): boolean => {
  return race !== undefined && Date.now() > race.startTime;
};

/**
 * gets a compiled version of the checkpoints of a race
 * @param checkpoints the checkpoints used in the race
 * @returns A map whose keys are the race distance and whose values are a sorted array of the checkpoints used for that race
 */
export const compileCheckpoints = (
  checkpoints: Record<string, Checkpoint>
): Record<string, CheckpointDistance[]> => {
  const result: Record<string, CheckpointDistance[]> = {};

  Object.keys(checkpoints).forEach((key: string) => {
    const check: Checkpoint = checkpoints[key];
    check.distances.forEach((distance: CheckpointDetails) => {
      const distanceKey = String(distance.raceDistance);
      if (!result[distanceKey]) result[distanceKey] = [];
      result[distanceKey].push({
        checkpointNumber: check.checkpointNumber,
        distance: distance.distance,
        id: `${check.checkpointNumber}-${distance.distance}`,
      });
    });
  });

  // Sort checkpoints for each race
  Object.keys(result).forEach((key: string) => {
    result[key] = result[key].sort((d1, d2) => d1.distance - d2.distance);
  });

  return result;
};
export const getDistanceCheckpoints = (
  race: FullRace | undefined,
  selectedDistance: number | undefined
): CheckpointDistance[] => {
  return (
    (race?.checkpoints &&
      selectedDistance &&
      compileCheckpoints(race.checkpoints)[String(selectedDistance)]) ||
    []
  );
};

export const compileResults = (race: FullRace): RaceResultsFull => {
  const result: RaceResultsFull = {};
  race.raceDetails.distances.forEach((distance: RaceDistance) => {
    // Start with an empty map of runners and the computed checkpoint list
    result[String(distance.distance)] = {
      runners: {},
      checkpoints: getDistanceCheckpoints(race, distance.distance),
      startTime: distance.startTime,
    };
  });
  Object.keys(race.runners).forEach((key: string) => {
    const runner: Runner = race.runners[key];
    const runnerResult: RaceResult = {
      ...runner,
      offset:
        runner.offset,
      checkpointInfo: [],
    };
    const iterationIndecies: Record<string, number> = {};
    let lastNonUndefined = -1;

    result[String(runner.distance)].checkpoints.forEach(
      (checkpoint: CheckpointDistance, checkpointIndex: number) => {
        const runnersPassed: number[] | undefined =
          race.checkpoints[checkpoint.checkpointNumber]?.runnersPassed[key];
        const index: number =
          iterationIndecies[checkpoint.checkpointNumber] || 0;
        if (runnersPassed && runnersPassed[index]) {
          const timestamp = runnersPassed[index];
          if (timestamp) lastNonUndefined = checkpointIndex;
          runnerResult.checkpointInfo.push({
            ...checkpoint,
            timestamp,
          });
        } else {
          runnerResult.checkpointInfo.push({
            ...checkpoint,
          });
        }
        iterationIndecies[checkpoint.checkpointNumber] = index + 1;
      }
    );

    // Chop out checkpoints the runner hasn't gotten to yet
    runnerResult.checkpointInfo = runnerResult.checkpointInfo.slice(
      0,
      lastNonUndefined + 1
    );

    result[String(runner.distance)].runners[key] = runnerResult;
  });

  return result;
};

export const runnerAtCheckpoint = (
  runner?: RaceResult,
  checkpointIndex?: number
): number | undefined => {
  if (runner === undefined || checkpointIndex === undefined) return undefined;
  const timestamp = runner.checkpointInfo[checkpointIndex]?.timestamp;
  if (!timestamp) return undefined;
  return timestamp - runner.offset;
};
export const runnerDistance = (runner?: RaceResult): RunnerDistance => {
  if (!runner || runner.dnf) return { distance: 0, lastTime: 0 };
  const lastDistance: ResultCheckpointInfo | undefined =
    runner.checkpointInfo[runner.checkpointInfo.length - 1];
  if (!lastDistance?.timestamp) return { distance: 0, lastTime: 0 };
  return {
    distance: lastDistance.distance,
    lastTime: lastDistance.timestamp - (runner.offset * 1000),
  };
};

export const getIssues = (race?: FullRace): RaceIssues => {
  const issues: RaceIssues = {
    problemRunners: {},
    unknownEntries: [],
  };
  if (!race) return issues;
  const routes: Record<string, CheckpointDistance[]> = {};
  race.raceDetails.distances.forEach((distance: RaceDistance) => {
    routes[String(distance.distance)] = getDistanceCheckpoints(
      race,
      distance.distance
    );
  });
  Object.values(race.runners).forEach((runner) => {
    const allCheckpoints: CheckpointEntry[] = getCheckpointsByRunner(
      race,
      runner.bibNumber
    );
    const runnerRoute = routes[String(runner.distance)];
    let issue: string | undefined = undefined;
    for (let i = 0; i < allCheckpoints.length; i++) {
      if (
        allCheckpoints[i].checkpointNumber !== runnerRoute[i].checkpointNumber
      ) {
        issue = "Checkpoints out of order";
        break;
      }
    }
    
    if (!issue && (allCheckpoints.length > runnerRoute.length))
      issue = "Too many checkpoint entries";
    if (issue) {
      issues.problemRunners[runner.bibNumber] = {
        ...runner,
        checkpointEntries: allCheckpoints,
        issue,
      };
    }
  });
  // Get unknown entries
  Object.values(race.checkpoints).forEach((check: Checkpoint) => {
    Object.keys(check.runnersPassed).forEach((key: string) => {
      let isUnknown = false;
      if (key === "UNKNOWN_RUNNER") {
        isUnknown = true;
      } else {
        if (!(key in race.runners)) isUnknown = true;
      }

      if (isUnknown) {
        check.runnersPassed[key].forEach((timestamp: number) => {
          issues.unknownEntries.push({
            checkpointNumber: check.checkpointNumber,
            timestamp,
            bibNumber: key,
          });
        });
      }
    });
  });

  return issues;
};
export const getCheckpointsByRunner = (
  race?: FullRace,
  bibNumber?: string
): CheckpointEntry[] => {
  if (!race || !bibNumber) return [];
  const result: CheckpointEntry[] = [];
  Object.values(race.checkpoints).forEach((checkpoint: Checkpoint) => {
    if (bibNumber in checkpoint.runnersPassed) {
      checkpoint.runnersPassed[bibNumber].forEach((timestamp) => {
        result.push({
          checkpointNumber: checkpoint.checkpointNumber,
          timestamp,
          bibNumber,
        });
      });
    }
    result.sort((c1, c2) => c1.timestamp - c2.timestamp);
  });
  return result;
};
