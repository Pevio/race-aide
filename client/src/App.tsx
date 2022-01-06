import React from "react";
import store from "./state/store";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import MainRouter from "./pages/MainRouter";
import "./App.css";

export default function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <BrowserRouter>
          <MainRouter />
        </BrowserRouter>
      </div>
    </Provider>
  );
}
