import {
  Checkpoint,
  CheckpointDetails,
  CheckpointDistance,
  FullRace,
  RaceResult,
  RaceResultsFull,
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
    //
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

    result[String(runner.distance)].checkpoints.forEach((checkpoint: CheckpointDistance) => {
      const runnersPassed: number[] | undefined = race.checkpoints[checkpoint.checkpointNumber]?.runnersPassed[key];
      const index = iterationIndecies[checkpoint.checkpointNumber]
      if (runnersPassed && runnersPassed[index]) {
        runnerResult.checkpointInfo.push({
          ...checkpoint,
          timestamp: runnersPassed[index]
        })
      } else {
        runnerResult.checkpointInfo.push({
          ...checkpoint,
        })
      }
      iterationIndecies[checkpoint.checkpointNumber] = index + 1;
    })

    result[String(runner.distance)].runners[runnerResult.bibNumber] = runnerResult
  })
  return result;
}