import { Race } from "../../types/generalTypes";
export const SET_RACE_LIST = "SET_RACE_LIST";
export const SET_RACE_LIST_LOADING = "SET_RACE_LIST_LOADING"

interface RaceListState {
  races: Race[];
  success: boolean;
  loading: boolean;
}
const initialState: RaceListState = {
  races: [],
  success: true,
  loading: false,
};

export interface SetRaceListLoading {
  type: "SET_RACE_LIST_LOADING";
  payload: {
    isLoading: boolean;
  };
}
export interface SetRaceList {
  type: "SET_RACE_LIST";
  payload: {
    races: Race[];
    success: boolean;
  };
}
export type RaceListActions = SetRaceList | SetRaceListLoading;
export default function raceList(
  state = initialState,
  action: RaceListActions
): RaceListState {
  switch (action.type) {
    case SET_RACE_LIST:
      return {
        ...state,
        races: action.payload.races,
        success: action.payload.success,
        loading: false,
      };
    case SET_RACE_LIST_LOADING:
      return {
        ...state,
        loading: action.payload.isLoading
      }
    default:
      return state;
  }
}
