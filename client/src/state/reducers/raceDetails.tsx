import { FullRace } from "../../types/generalTypes";
export const SET_SELECTED_RACE = "SET_SELECTED_RACE";
export const SET_RACE_LOADING = "SET_RACE_LOADING";

interface RaceListState {
  race?: FullRace
  success: boolean
  loading: boolean
}
const initialState: RaceListState = {
  success: true,
  loading: false
};

export interface SetSelectedRace {
  type: "SET_SELECTED_RACE";
  payload: {
    race?: FullRace;
    success: boolean;
  };
}
export interface SetRaceLoading {
  type: "SET_RACE_LOADING";
  payload: {
    isLoading: boolean
  };
}
export type RaceListActions = SetSelectedRace | SetRaceLoading;
export default function raceDetails(
  state = initialState,
  action: RaceListActions
): RaceListState {
  switch (action.type) {
    case SET_SELECTED_RACE:
      return {
        ...state,
        race: action.payload.race,
        success: action.payload.success,
        loading: false,
      };
    case SET_RACE_LOADING:
      return {
        ...state,
        loading: action.payload.isLoading
      }
    default:
      return state;
  }
}
