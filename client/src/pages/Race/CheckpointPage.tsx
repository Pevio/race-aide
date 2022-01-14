import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RouteComponentProps, useLocation } from "react-router";
import DataTable from "react-data-table-component";
import { RacePageWrapper } from "../RacePageWrapper";
import { getDistanceCheckpoints } from "../../util/resultsUtils";
import { Checkpoint } from "../../types/generalTypes";
import { updateRaceCheckpoints } from "../../state/actions/RaceDetails";


interface CheckpointProps {
  raceId: string;
}

export function CheckpointPage({
  match,
  history,
}: RouteComponentProps<CheckpointProps>) {
  const { raceId } = match.params;
  const location: any = useLocation()
  const dispatch = useDispatch();
  const { race, authorization, password } = useSelector((state: RootStore) => state.raceDetails);

  const isAdmin = authorization === "RACE_ADMIN";
  const isAssistant = authorization === "RACE_ASSISTANT"
  const hasStarted = race && race.startTime < Date.now();
  

  const [selectedDistance, setSelectedDistanceState] = useState<number | undefined>(location.state?.selectedDistance);
  const setSelectedDistance = (value: number | undefined) => {
    setSelectedDistanceState(value)
    history.replace(location.pathname, {...location.state, selectedDistance: value})
  }
  const checkpoints = getDistanceCheckpoints(race, selectedDistance)

  const [makingNewCheckpoint, setMakingNewCheckpoint] = useState<boolean>(true);
  const getDefaultCheckpointData = (): Partial<Checkpoint> => {
    return {

    }
  }
  const [checkpointEditing, setCheckpointEditing] = useState<Partial<Checkpoint>>(getDefaultCheckpointData());
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);

  return (
    <RacePageWrapper>
      <h1>Race Checkpoints</h1>
      <p>Race Aide uses a checkpoint system to log results. Below you will see all checkpoints that correspond to each distance of the race.</p>
      <div>
        <span>Select a Distance:</span>
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (value === "ALL") setSelectedDistance(undefined);
            setSelectedDistance(Number.parseInt(e.target.value));
          }}
          value={selectedDistance || "ALL"}
          style={{ marginLeft: 10 }}
        >
          <option key="none-selected">Select a Distance</option>
          {race?.raceDetails?.distances?.map((distance) => (
            <option key={distance} value={String(distance)}>
              {`${distance} Miles`}
            </option>
          ))}
        </select>
      </div>
      {isAdmin && !hasStarted &&
        <p>Click on a checkpoint to edit its details or enter results for it.</p>
      }
      {isAssistant && (!isAdmin || hasStarted) &&
        <p>Click on a checkpoint to enter results for it.</p>
      }
      <DataTable
        columns={[
          {
            name: "#",
            selector: (check, index) => index || "",
          },
          {
            name: "Checkpoint Number",
            selector: (check) => check.checkpointNumber,
          },
          {
            name: "Distance",
            selector: (check) => check.distance,
          },
        ]}
        data={checkpoints}
        highlightOnHover
        responsive
        striped
        keyField="checkpointNumber"
        noDataComponent={<p>There are no runners in this race yet.</p>}
        onRowClicked={isAdmin || isAssistant ? (check) => {
          if (isAssistant || hasStarted) {
            history.push(`/${raceId}/addresults/${check.checkpointNumber}`)
          }
          if (isAdmin) {
            setCheckpointEditing(check)
            setMakingNewCheckpoint(false);
          }
        } : undefined}
      />
      {isAdmin && !hasStarted && 
        <>
          <hr />
          <h3>Edit Race Checkpoints</h3>
          <div style={{ marginTop: 10 }}>


            <div style={{ marginTop: 10 }}>
              {errorMessage && <p>{errorMessage}</p>}
              <button
                onClick={() => {
                  if (saveInProgress) return;
                  if (
                    !race
                  ) {
                    setErrorMessage("All fields must be filled out!")
                    return;
                  }
                  setErrorMessage("")
                  setSaveInProgress(true);
                  dispatch(updateRaceCheckpoints(race, checkpointEditing as Checkpoint, makingNewCheckpoint ? "CREATE" : "UPDATE", password));
                }}
              >
                Save Checkpoint
              </button>
              {!makingNewCheckpoint &&
                <button
                  onClick={() => {
                    if (!race || saveInProgress) return;
                    setSaveInProgress(true);
                    dispatch(updateRaceCheckpoints(race, checkpointEditing as Checkpoint, "DELETE", password));
                  }}
                >Delete Checkpoint</button>
              }
            </div>
          </div>
        </>
      }
    </RacePageWrapper>
  );
}
