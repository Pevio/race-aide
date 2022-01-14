import { Switch, Route, Redirect } from "react-router-dom";
import { About } from "./HomePages/About";
import { CreateRace } from "./HomePages/CreateRace";
import { RaceList } from "./HomePages/RaceList";
import { CheckpointInfo } from "./Race/CheckpointInfo";
import { CheckpointPage } from "./Race/CheckpointPage";
import { EditRacePasswords } from "./Race/EditPasswords";
import { RaceAdmin } from "./Race/RaceAdmin";
import { RaceHome } from "./Race/RaceHome";
import { RaceParticipants } from "./Race/RaceParticipants";

const MainRouter = () => {
  return (
    <Switch>
      <Route exact path="/" component={RaceList} />
      <Route exact path="/about" component={About} />
      <Route exact path="/createrace" component={CreateRace} />

      <Route exact path="/:raceId" component={RaceHome} />
      <Route exact path="/:raceId/participants" component={RaceParticipants} />
      <Route exact path="/:raceId/results" component={RaceParticipants} />
      <Route exact path="/:raceId/admin" component={RaceAdmin} />
      <Route exact path="/:raceId/checkpoints" component={CheckpointPage} />
      <Route
        exact
        path="/:raceId/editpasswords"
        component={EditRacePasswords}
      />
      <Route
        exact
        path="/:raceId/addresults/:checkpointId"
        component={CheckpointInfo}
      />

      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
};

export default MainRouter;
