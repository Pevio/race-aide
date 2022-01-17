import { Dispatch } from "redux";
import {
  Checkpoint,
  FullRace,
  RaceAuthorization,
  Runner,
} from "../../types/generalTypes";
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
      dispatch(setRaceLoading(false, false));
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
      const success = data.returnCode === 0;
      if (success) {
        dispatch(setSelectedRace(data.race, true));
        dispatch(setRacePassword(race.adminPassword, "RACE_ADMIN"));
      } else {
        dispatch(setRaceLoading(false, false));
      }
    } catch (error) {
      dispatch(setRaceLoading(false, false));
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
          race: {
            ...race,
            runners: undefined,
            checkpoints: undefined,
          },
          password: adminPassword,
        }),
      });
      const data = await res.json();
      const success = data.returnCode === 0;
      if (success) {
        dispatch(setSelectedRace({ ...race, ...data.race }, true));
      } else {
        setRaceLoading(false, false);
      }
    } catch (error) {
      dispatch(setRaceLoading(false, false));
    }
  };

export const updateRaceParticipants =
  (
    originalRace: FullRace,
    runner: Runner,
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
          runner,
          action,
          password: adminPassword,
        }),
      });
      const data = await res.json();

      if (data.returnCode === 0) {
        dispatch(
          setSelectedRace({ ...originalRace, runners: data.runners }, true)
        );
      } else {
        dispatch(setRaceLoading(false, false));
      }
    } catch (error) {
      dispatch(setRaceLoading(false, false));
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
      const res = await fetch("/api/updateracecheckpoints", {
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
          setSelectedRace(
            { ...originalRace, checkpoints: data.checkpoints },
            true
          )
        );
      } else {
        dispatch(setRaceLoading(false, false));
      }
    } catch (error) {
      dispatch(setRaceLoading(false, false));
    }
  };

export const updateRacePasswords =
  (
    raceId: string,
    password: string,
    newAdminPassword: string,
    newCheckpointPassword: string
  ): ThunkActionType =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setRaceLoading(true));
      const res = await fetch("/api/updateracepasswords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceId,
          password,
          newAdminPassword,
          newCheckpointPassword,
        }),
      });
      const data = await res.json();
      const success = data.returnCode === 0;
      dispatch(setRaceLoading(false, success));

      if (success) {
        setRacePassword(newAdminPassword, "RACE_ADMIN");
      }
    } catch (error) {
      dispatch(setRaceLoading(false, false));
    }
  };

export const addCheckpointEntry =
  (
    raceId: string,
    checkpointNumber: string,
    bibNumber: string | undefined,
    action: "CREATE" | "DELETE",
    password?: string
  ): ThunkActionType =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(setRaceLoading(true));
      const res = await fetch("/api/addcheckpointentry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceId,
          checkpointNumber,
          bibNumber,
          password,
          action,
        }),
      });
      const data = await res.json();

      dispatch(setRaceLoading(false, data.returnCode === 0));
    } catch (error) {
      dispatch(setRaceLoading(false, false));
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
const setRaceLoading = (
  isLoading: boolean,
  success: boolean = false
): SetRaceLoading => ({
  type: SET_RACE_LOADING,
  payload: {
    isLoading,
    success,
  },
});
