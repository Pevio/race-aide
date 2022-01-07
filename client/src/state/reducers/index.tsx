import { combineReducers } from "redux";
import raceList from "./raceList";
import raceDetails from "./raceDetails"

export default combineReducers({
  raceList,
  raceDetails,
});
