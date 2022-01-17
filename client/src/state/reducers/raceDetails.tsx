import {
  FullRace,
  RaceAuthorization,
  RaceResultsFull,
} from "../../types/generalTypes";
import { compileResults, raceHasStarted } from "../../util/resultsUtils";

export const SET_SELECTED_RACE = "SET_SELECTED_RACE";
export const SET_RACE_LOADING = "SET_RACE_LOADING";
export const SET_RACE_PASSWORD = "SET_RACE_PASSWORD";
export const RACE_ERROR = "RACE_ERROR";

interface RaceListState {
  race?: FullRace;
  success: boolean;
  loading: boolean;
  password?: string;
  authorization?: RaceAuthorization;
  allResults?: RaceResultsFull;
}
const initialState: RaceListState = {
  success: true,
  loading: false,
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
    isLoading: boolean;
    success: boolean;
  };
}
export interface SetRacePassword {
  type: "SET_RACE_PASSWORD";
  payload: {
    password?: string;
    authorization?: RaceAuthorization;
  };
}

export type RaceListActions =
  | SetSelectedRace
  | SetRaceLoading
  | SetRacePassword;
export default function raceDetails(
  state = initialState,
  action: RaceListActions
): RaceListState {
  switch (action.type) {
    case SET_SELECTED_RACE:
      let storage = {};
      if (
        action.payload.race &&
        state.race?.raceId !== action.payload.race.raceId
      ) {
        const jsonFromStorage = localStorage.getItem(
          `race-password-${action.payload.race.raceId}`
        );
        if (jsonFromStorage) storage = JSON.parse(jsonFromStorage);
      }

      const results: RaceResultsFull | undefined =
        action.payload.race && raceHasStarted(action.payload.race)
          ? compileResults(action.payload.race)
          : undefined;

      return {
        ...state,
        ...storage,
        race: action.payload.race,
        success: action.payload.success,
        loading: false,
        allResults: results,
      };
    case SET_RACE_LOADING:
      return {
        ...state,
        loading: action.payload.isLoading,
        success: action.payload.success,
      };
    case SET_RACE_PASSWORD:
      if (state.race) {
        const storageKey = `race-password-${state.race.raceId}`;
        if (action.payload.password) {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              password: action.payload.password,
              authorization: action.payload.authorization,
            })
          );
        } else {
          localStorage.removeItem(storageKey);
        }
      }

      return {
        ...state,
        password: action.payload.password,
        authorization: action.payload.authorization,
      };
    default:
      return state;
  }
}
