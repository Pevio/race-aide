import { Race } from "../../types/generalTypes";
export const SET_RACE_LIST = "SET_RACE_LIST";

interface RaceListState {
  races: Race[]
  success: boolean
}
const initialState: RaceListState = {
  races: [],
  success: true,
};

export interface SetRaceList {
  type: "SET_RACE_LIST";
  payload: {
    races: Race[];
    success: boolean;
  };
}
export type RaceListActions = SetRaceList;
export default function raceList(
  state = initialState,
  action: RaceListActions
): RaceListState {
  switch (action.type) {
    case SET_RACE_LIST:
      return {
        ...state,
        races: action.payload.races,
        success: action.payload.success
      };
    default:
      return state;
  }
}
