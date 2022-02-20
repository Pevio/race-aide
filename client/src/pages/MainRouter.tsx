import { Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootStore } from "../state/store";
import { About } from "./HomePages/About";
import { CreateRace } from "./HomePages/CreateRace";
import { RaceList } from "./HomePages/RaceList";
import { AddCheckpointEntry } from "./Race/AddCheckpointEntry";
import { CheckpointPage } from "./Race/CheckpointPage";
import { EditRacePasswords } from "./Race/EditPasswords";
import { ManuelEditEntries } from "./Race/ManualEditEntries";
import { RaceAdmin } from "./Race/RaceAdmin";
import { RaceHome } from "./Race/RaceHome";
import { RaceParticipants } from "./Race/RaceParticipants";
import { Registration } from "./Race/Registration";

const MainRouter = () => {
  const { authorization } =useSelector((state: RootStore) => state.raceDetails);

  const hasWriteAccess =authorization === "RACE_ADMIN" || authorization === "RACE_ASSISTANT";
  return (
    <Switch>
      <Route exact path="/" component={RaceList} />
      <Route exact path="/about" component={About} />
      <Route exact path="/createrace" component={CreateRace} />

      <Route exact path="/:raceId" component={RaceHome} />
      {hasWriteAccess && <Route exact path="/:raceId/registration" component={Registration} />}
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
        component={AddCheckpointEntry}
      />
      <Route
        exact
        path="/:raceId/manualeditentries"
        component={ManuelEditEntries}
      />

      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
};

export default MainRouter;
