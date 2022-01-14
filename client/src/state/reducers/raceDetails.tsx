import { FullRace, RaceAuthorization } from "../../types/generalTypes";
export const SET_SELECTED_RACE = "SET_SELECTED_RACE";
export const SET_RACE_LOADING = "SET_RACE_LOADING";
export const SET_RACE_PASSWORD = "SET_RACE_PASSWORD";
export const RACE_ERROR = "RACE_ERROR"

interface RaceListState {
  race?: FullRace;
  success: boolean;
  loading: boolean;
  password?: string;
  authorization?: RaceAuthorization;
}
const initialState: RaceListState = {
  success: true,
  loading: false,
};

export interface RaceError {
  type: "RACE_ERROR"
}
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
  | SetRacePassword
  | RaceError;
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
        storage = JSON.parse(
          localStorage.getItem(
            `race-password-${action.payload.race.raceId}`
          ) as string
        );
        // TODO: possibly validate the password right now.
      }
      return {
        ...state,
        race: action.payload.race,
        success: action.payload.success,
        loading: false,
        ...storage,
      };
    case SET_RACE_LOADING:
      return {
        ...state,
        loading: action.payload.isLoading,
      };
    case SET_RACE_PASSWORD: 
      if (state.race)
        localStorage.setItem(
          `race-password-${state.race.raceId}`,
          JSON.stringify({
            password: action.payload.password,
            authorization: action.payload.authorization,
          })
        );
      return {
        ...state,
        password: action.payload.password,
        authorization: action.payload.authorization,
      };
    case RACE_ERROR:
      return {
        ...state,
        success: false,
        loading: false,
      }
    default:
      return state;
  }
}
