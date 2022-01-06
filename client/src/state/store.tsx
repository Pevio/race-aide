import { applyMiddleware, createStore } from "redux";
import rootReducer from "./reducers";
import thunk, { ThunkAction, ThunkDispatch } from "redux-thunk";
import { AnyAction, Action } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

const middlewares = [thunk];

export type RootStore = ReturnType<typeof rootReducer>;
export type ThunkActionType<ReturnType = void> = ThunkAction<
  ReturnType,
  RootStore,
  null,
  Action<String>
>;
export type ThunkDispatchType = ThunkDispatch<RootStore, null, AnyAction>;

export default createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(...middlewares)),
);