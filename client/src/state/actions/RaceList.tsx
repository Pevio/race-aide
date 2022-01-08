import { Dispatch } from "redux";
import { Race } from "../../types/generalTypes";
import { SetRaceList, SET_RACE_LIST } from "../reducers/raceList";
import { ThunkActionType } from "../store";

export const getRaceList =
  (): ThunkActionType => async (dispatch: Dispatch) => {
    try {
      const res = await fetch("/api/getRaceList", {
        method: "GET",
      });
      const data = await res.json();
      dispatch(setRaceList(data.races || [], data.returnCode === 0));
    } catch (error) {
      dispatch(setRaceList([], false));
    }
  };

const setRaceList = (races: Race[], success: boolean): SetRaceList => ({
  type: SET_RACE_LIST,
  payload: {
    races,
    success,
  },
});
