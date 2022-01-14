import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RouteComponentProps, useLocation } from "react-router";
import { RacePageWrapper } from "../RacePageWrapper";
import DataTable from "react-data-table-component";
import { CheckpointDistance, Runner } from "../../types/generalTypes";
import { updateRaceParticipants } from "../../state/actions/RaceDetails";
import { displayTime } from "../../util/timeUtils";
import { getDistanceCheckpoints } from "../../util/resultsUtils";

interface ParticipantsProps {
  raceId: string;
}

export function RaceParticipants({
  match,
  history,
}: RouteComponentProps<ParticipantsProps>) {
  const dispatch = useDispatch();
  const location: any = useLocation()
  const { race, authorization, password, loading, success } = useSelector(
    (state: RootStore) => state.raceDetails
  );
  const hasStarted = race && race.startTime < Date.now();
  
  const isAdmin = authorization === "RACE_ADMIN";

  const [selectedDistance, setSelectedDistanceState] = useState<number | undefined>(location.state?.selectedDistance);
  const setSelectedDistance = (value: number | undefined) => {
    setSelectedDistanceState(value)
    history.replace(location.pathname, {...location.state, selectedDistance: value})
  }

  const checkpointInfo = getDistanceCheckpoints(race, selectedDistance)
  const allRunners: Runner[] = Object.values(race?.runners || []);
  const runnerArray: Runner[] = selectedDistance
    ? allRunners.filter(
        (runner: Runner) => runner.distance === selectedDistance
      )
    : allRunners;

  const [makingNewRunner, setMakingNewRunner] = useState<boolean>(true);
  const getDefaultRunnerData = (): Partial<Runner> => {
    return {
      offset: 0
    }
  }
  const [runnerEditing, setRunnerEditing] = useState<Partial<Runner>>(getDefaultRunnerData());
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && saveInProgress) {
      if (success) {
        setErrorMessage("")
        if (makingNewRunner) setRunnerEditing(getDefaultRunnerData())
      } else {
        setErrorMessage("The runner could not be saved.")
      }
    }
  }, [loading])

  return (
    <RacePageWrapper>
      <h1>{`Race ${hasStarted ? "Results" : "Participants"}`}</h1>
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
          {!hasStarted && <option value="ALL">Show All Distances</option>}
          {race?.raceDetails?.distances?.map((distance) => (
            <option key={distance} value={String(distance)}>
              {`${distance} Miles`}
            </option>
          ))}
        </select>
      </div>
      {isAdmin && <p>Click a runner to edit their details.</p>}
      {(!hasStarted || selectedDistance) &&
        <DataTable
          columns={
            hasStarted && selectedDistance
              ? [
                {
                  name: "Runner Name",
                  selector: (runner) => runner.runnerName,
                },
                ...(checkpointInfo.map((info: CheckpointDistance) => ({
                  name: `${info.distance} Miles`,
                  selector: (runner: Runner) => ""
                })))
              ]
              : [
                  {
                    name: "Runner Name",
                    selector: (runner) => runner.runnerName,
                  },
                  {
                    name: "Bib Number",
                    selector: (runner) => runner.bibNumber,
                  },
                  {
                    name: "Distance",
                    selector: (runner) => `${runner.distance} Miles`,
                  },
                  {
                    name: "Start Time Offset",
                    selector: (runner) => runner.offset ? displayTime(runner.offset) : "-",
                  },
                ]
          }
          data={runnerArray}
          highlightOnHover
          responsive
          striped
          keyField="bibNumber"
          noDataComponent={<p>There are no runners in this race yet.</p>}
          onRowClicked={isAdmin ? (row) => {
            setRunnerEditing(row);
            setMakingNewRunner(false)
          } : undefined}
        />
      }
      {isAdmin && (
        <>
        <hr/>
        <h3>Edit Race Runners</h3>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", position: "relative" }}>
            <h2>{makingNewRunner ? "Edit Runner" : "Add Runner"}</h2>
            <button
              style={{ position: "absolute", right: 0 }}
              onClick={() => {
                setMakingNewRunner(true);
                setRunnerEditing(getDefaultRunnerData());
              }}
            >
              Add New Runner
            </button>
          </div>
          <div style={{ marginTop: 10 }}>
            <span>Runner Name:</span>
            <input
              type="text"
              style={{ marginLeft: 10 }}
              value={runnerEditing.runnerName}
              onChange={(e) =>
                setRunnerEditing({
                  ...runnerEditing,
                  runnerName: e.target.value,
                })
              }
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <span>Bib Number:</span>
            {makingNewRunner ? (
              <input
                type="text"
                style={{ marginLeft: 10 }}
                value={runnerEditing.bibNumber}
                onChange={(e) =>
                  setRunnerEditing({
                    ...runnerEditing,
                    bibNumber: e.target.value,
                  })
                }
              />
            ) : (
              <span>{runnerEditing.bibNumber}</span>
            )}
          </div>
          <div style={{ marginTop: 10 }}>
            <span>Distance:</span>
            <select
              style={{ marginLeft: 10 }}
              value={runnerEditing.distance}
              onChange={(e) =>
                setRunnerEditing({
                  ...runnerEditing,
                  distance: Number.parseInt(e.target.value),
                })
              }
            >
              <option key="not-selected">
                Select a Distance
              </option>
              {race?.raceDetails?.distances?.map((distance) => (
                <option key={distance} value={String(distance)}>
                  {`${distance} Miles`}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 10 }}>
            <span>Start Offset (Seconds):</span>
            <input
              type="number"
              style={{ marginLeft: 10 }}
              value={runnerEditing.offset}
              onChange={(e) =>
                setRunnerEditing({
                  ...runnerEditing,
                  offset: Number.parseInt(e.target.value),
                })
              }
            />
          </div>
          <div style={{ marginTop: 10 }}>
            {errorMessage && <p>{errorMessage}</p>}
            <button
              onClick={() => {
                if (saveInProgress) return;
                if (
                  !runnerEditing.bibNumber ||
                  !runnerEditing.runnerName ||
                  !runnerEditing.distance ||
                  !race
                ) {
                  setErrorMessage("All fields must be filled out!")
                  return;
                }
                setErrorMessage("")
                const newRunners = { ...race?.runners };
                const enteredRunner: Runner = {
                  offset: 0,
                  ...runnerEditing,
                } as Runner;
                newRunners[enteredRunner.bibNumber] = enteredRunner;

                setSaveInProgress(true);
                dispatch(updateRaceParticipants(race, newRunners, password));
              }}
            >
              Save Runner
            </button>
            {!makingNewRunner &&
              <button
                onClick={() => {
                  if (!race || saveInProgress) return;
                  const newRunners = { ...race?.runners };
                  if (runnerEditing.bibNumber) delete newRunners[runnerEditing.bibNumber]

                  setSaveInProgress(true);
                  dispatch(updateRaceParticipants(race, newRunners, password));
                }}
              >Delete Runner</button>
            }
          </div>
        </div>
        </>
      )}
    </RacePageWrapper>
  );
}
