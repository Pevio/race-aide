import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { RaceList } from "./RaceList/RaceList";

const MainRouter = () => {
  return (
    <Switch>
      <Route exact path="/" component={RaceList} />
      <Route exact path="/about" component={() => null} />
      <Route exact path="/:raceid" component={() => null} />

      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
};

export default MainRouter;
