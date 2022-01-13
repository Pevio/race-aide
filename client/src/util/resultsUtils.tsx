import {
  Checkpoint,
  CheckpointDetails,
  CheckpointDistance,
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
