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
  checkpoints: Checkpoint[]
): Record<number, CheckpointDistance[]> => {
  const result: Record<number, CheckpointDistance[]> = {};

  checkpoints.forEach((check: Checkpoint) => {
    check.distances.forEach((distance: CheckpointDetails) => {
      if (!result[distance.raceDistance]) result[distance.raceDistance] = [];
      result[distance.raceDistance].push({
        checkpointNumber: check.checkpointNumber,
        distance: distance.distance,
      });
    });
  });

  // TODO: Sort the checkpoints for each race

  return result;
};
export const getDistanceCheckpoints = (
  race: FullRace | undefined,
  selectedDistance: number | undefined
): CheckpointDistance[] => {
  return (
    (race?.checkpoints &&
      selectedDistance &&
      compileCheckpoints(race.checkpoints)[selectedDistance]) ||
    []
  );
};

export const compileResults = (race: FullRace): RaceResultsFull => {
  const result: RaceResultsFull = {};
  race.raceDetails.distances.forEach((distance: number) => {
    result[String(distance)] = [];
  })
  Object.keys(race.runners).forEach((key: string) => {
    const runner: Runner = race.runners[key]
    const runnerResult: RaceResult = {
      ...runner,
      checkpointInfo: [],
    }
    race.checkpoints.forEach((checkpoint: Checkpoint) => {
      if (checkpoint.runnersPassed[key]) {
        checkpoint.runnersPassed[key].forEach((timestamp: number) => {
          
        })
      }
    })
    runnerResult.checkpointInfo.sort((info1, info2) => info1.timestamp - info2.timestamp)
    result[String(runner.distance)].push(runnerResult)
  })
  return result;
}