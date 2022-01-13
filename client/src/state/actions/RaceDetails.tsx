import { Dispatch } from "redux";
import { FullRace, RaceAuthorization, Runner } from "../../types/generalTypes";
import {
  SetRaceLoading,
  SetRacePassword,
  SetSelectedRace,
  SET_RACE_LOADING,
  SET_RACE_PASSWORD,
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

export const updateRaceDetails =
  (race: Partial<FullRace>, adminPassword?: string): ThunkActionType =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setRaceLoading(true));
      const res = await fetch("/api/updateracedetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          race,
          password: adminPassword
        }),
      });
      const data = await res.json();

      dispatch(setSelectedRace(data.race, data.returnCode === 0));
    } catch (error) {
      dispatch(setSelectedRace(undefined, false));
    }
  };

export const updateRaceParticipants =
  (raceId: string, runners: Runner[], adminPassword?: string): ThunkActionType =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setRaceLoading(true));
      const res = await fetch("/api/updateraceparticipants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceId,
          runners,
          password: adminPassword
        }),
      });
      const data = await res.json();

      dispatch(setSelectedRace(data.race, data.returnCode === 0));
    } catch (error) {
      dispatch(setSelectedRace(undefined, false));
    }
  };

export const setSelectedRace = (
  race: FullRace | undefined,
  success: boolean
): SetSelectedRace => ({
  type: SET_SELECTED_RACE,
  payload: {
    race,
    success,
  },
});
export const setRacePassword = (password: string, authorization: RaceAuthorization): SetRacePassword => ({
  type: SET_RACE_PASSWORD,
  payload: {
    password,
    authorization
  }
})
const setRaceLoading = (isLoading: boolean): SetRaceLoading => ({
  type: SET_RACE_LOADING,
  payload: {
    isLoading,
  },
});
