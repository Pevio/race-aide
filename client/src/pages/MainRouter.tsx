import { Switch, Route, Redirect } from "react-router-dom";
import { About } from "./HomePages/About";
import { CreateRace } from "./HomePages/CreateRace";
import { RaceList } from "./HomePages/RaceList";
import { Checkpoint } from "./Race/Checkpoint";
import { RaceHome } from "./Race/RaceHome";
import { RaceParticipants } from "./Race/RaceParticipants";

const MainRouter = () => {
  return (
    <Switch>
      <Route exact path="/" component={RaceList} />
      <Route exact path="/about" component={About} />
      <Route exact path="/createrace" component={CreateRace} />

      <Route exact path="/:raceid" component={RaceHome} />
      <Route exact path="/:raceid/participants" component={RaceParticipants} />
      <Route exact path="/:raceid/results" component={RaceParticipants} />
      <Route exact path="/:raceid/checkpoint" component={Checkpoint} />

      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
};

export default MainRouter;
