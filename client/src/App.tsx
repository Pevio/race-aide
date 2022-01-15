import React from "react";
import store from "./state/store";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./App.css";
import LayoutProvider from "./LayoutProvider";

export default function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <BrowserRouter>
          <LayoutProvider />
        </BrowserRouter>
      </div>
    </Provider>
  );
}
