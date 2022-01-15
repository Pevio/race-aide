import { Dispatch } from "redux";
import { Race } from "../../types/generalTypes";
import {
  SetRaceList,
  SetRaceListLoading,
  SET_RACE_LIST,
  SET_RACE_LIST_LOADING,
} from "../reducers/raceList";
import { ThunkActionType } from "../store";

export const getRaceList =
  (): ThunkActionType => async (dispatch: Dispatch) => {
    try {
      dispatch(setRaceListLoading(true));
      const res = await fetch("/api/getRaceList", {
        method: "GET",
      });
      const data = await res.json();
      dispatch(setRaceList(data.races || [], data.returnCode === 0));
    } catch (error) {
      dispatch(setRaceList([], false));
    }
  };

const setRaceListLoading = (isLoading: boolean): SetRaceListLoading => ({
  type: SET_RACE_LIST_LOADING,
  payload: {
    isLoading,
  },
});
const setRaceList = (races: Race[], success: boolean): SetRaceList => ({
  type: SET_RACE_LIST,
  payload: {
    races,
    success,
  },
});
