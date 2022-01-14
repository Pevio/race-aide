import { Dispatch } from "redux";
import { Checkpoint, FullRace, RaceAuthorization, Runner } from "../../types/generalTypes";
import {
  RaceError,
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
          password: adminPassword,
          runners: undefined,
          checkpoints: undefined,
        }),
      });
      const data = await res.json();
      dispatch(setRaceLoading(false));
      if (data.returnCode === 0) dispatch(setSelectedRace(data.race, data.returnCode === 0));
    } catch (error) {
      dispatch(setRaceLoading(false));
    }
  };

export const updateRaceParticipants =
  (
    originalRace: FullRace,
    runners: Record<string, Runner>,
    adminPassword?: string
  ): ThunkActionType =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setRaceLoading(true));
      const res = await fetch("/api/updateraceparticipants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceId: originalRace.raceId,
          runners,
          password: adminPassword,
        }),
      });
      const data = await res.json();

      if (data.returnCode === 0) {
        dispatch(
          setSelectedRace({ ...originalRace, runners: data.runners || runners }, true)
        );
      } else {
        dispatch(raceError())
      }

    } catch (error) {
      dispatch(setSelectedRace(originalRace, false));
    }
  };

export const updateRaceCheckpoints =
  (
    originalRace: FullRace,
    checkpoint: Checkpoint,
    action: "CREATE" | "UPDATE" | "DELETE",
    adminPassword?: string
  ): ThunkActionType =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setRaceLoading(true));
      const res = await fetch("/api/updateraceparticipants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceId: originalRace.raceId,
          checkpoint,
          password: adminPassword,
          action,
        }),
      });
      const data = await res.json();

      if (data.returnCode === 0) {
        dispatch(
          setSelectedRace({ ...originalRace, checkpoints: data.checkpoints }, true)
        );
      } else {
        dispatch(raceError())
      }

    } catch (error) {
      dispatch(setSelectedRace(originalRace, false));
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
export const setRacePassword = (
  password?: string,
  authorization?: RaceAuthorization
): SetRacePassword => ({
  type: SET_RACE_PASSWORD,
  payload: {
    password,
    authorization,
  },
});
const setRaceLoading = (isLoading: boolean): SetRaceLoading => ({
  type: SET_RACE_LOADING,
  payload: {
    isLoading,
  },
});
export const raceError = (): RaceError => ({
  type: "RACE_ERROR"
})