import { Dispatch } from "redux";
import { FullRace } from "../../types/generalTypes";
import {
  SetRaceLoading,
  SetSelectedRace,
  SET_RACE_LOADING,
  SET_SELECTED_RACE,
} from "../reducers/raceDetails";
import { ThunkActionType } from "../store";

export const getRaceDetails =
  (raceId: string): ThunkActionType =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setRaceLoading(true));
      const res = await fetch(`/api/getracedetails/${raceId}`, {
        method: "GET",
      });
      const data = await res.json();

      dispatch(setSelectedRace(data.race, data.returnCode === 0));
    } catch (error) {
      dispatch(setSelectedRace(undefined, false));
    }
  };

export const createRace =
  (race: Partial<FullRace>): ThunkActionType =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setRaceLoading(true));
      const res = await fetch("/api/createrace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          race,
        }),
      });
      const data = await res.json();

      dispatch(setSelectedRace(data.race, data.returnCode === 0));
    } catch (error) {
      dispatch(setSelectedRace(undefined, false));
    }
  };

const setSelectedRace = (
  race: FullRace | undefined,
  success: boolean
): SetSelectedRace => ({
  type: SET_SELECTED_RACE,
  payload: {
    race,
    success,
  },
});
const setRaceLoading = (isLoading: boolean): SetRaceLoading => ({
  type: SET_RACE_LOADING,
  payload: {
    isLoading,
  },
});
