import {
  Checkpoint,
  CheckpointDetails,
  CheckpointDistance,
  FullRace,
  RaceResult,
  RaceResultsFull,
  ResultCheckpointInfo,
  Runner,
} from "../types/generalTypes";

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
    const check: Checkpoint = checkpoints[key]
    check.distances.forEach((distance: CheckpointDetails) => {
      const distanceKey = String(distance.raceDistance)
      if (!result[distanceKey]) result[distanceKey] = [];
      result[distanceKey].push({
        checkpointNumber: check.checkpointNumber,
        distance: distance.distance,
      });
    });
  });

  // Sort checkpoints for each race
  Object.keys(result).forEach((key: string) => {
    result[key] = result[key].sort((d1, d2) => d1.distance - d2.distance)
  })

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
  race.raceDetails.distances.forEach((distance: number) => {
    // Start with an empty map of runners and the computed checkpoint list
    result[String(distance)] = {
      runners: {},
      checkpoints: getDistanceCheckpoints(race, distance)
    };
  })
  Object.keys(race.runners).forEach((key: string) => {
    const runner: Runner = race.runners[key]
    const runnerResult: RaceResult = {
      ...runner,
      checkpointInfo: [],
    }
    const iterationIndecies: Record<string, number> = {}
    let lastNonUndefined = -1;

    result[String(runner.distance)].checkpoints.forEach((checkpoint: CheckpointDistance, checkpointIndex: number) => {
      const runnersPassed: number[] | undefined = race.checkpoints[checkpoint.checkpointNumber]?.runnersPassed[key];
      const index = iterationIndecies[checkpoint.checkpointNumber] || 0
      if (runnersPassed && runnersPassed[index]) {
        const timestamp = runnersPassed[index]
        if (timestamp) lastNonUndefined = checkpointIndex;
        runnerResult.checkpointInfo.push({
          ...checkpoint,
          timestamp
        })
      } else {
        runnerResult.checkpointInfo.push({
          ...checkpoint,
        })
      }
      iterationIndecies[checkpoint.checkpointNumber] = index + 1;
    })

    // Chop out checkpoints the runner hasn't gotten to yet
    runnerResult.checkpointInfo = runnerResult.checkpointInfo.slice(0, lastNonUndefined);

    result[String(runner.distance)].runners[runnerResult.bibNumber] = runnerResult
  })

  console.log(result);
  return result;
}

export const runnerAtCheckpoint = (runner: RaceResult, checkpointIndex: number): number | undefined => {
  const timestamp = runner.checkpointInfo[checkpointIndex].timestamp;
  if (!timestamp) return undefined;
  return timestamp - (runner.offset * 1000)
}
export const runnerDistance = (runner: RaceResult): number => {
  const lastDistance: ResultCheckpointInfo | undefined = runner.checkpointInfo[runner.checkpointInfo.length - 1]
  if (!lastDistance) return 0;
  return lastDistance.distance
}