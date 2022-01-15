import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RouteComponentProps, useLocation } from "react-router";
import DataTable from "react-data-table-component";
import { CheckpointDistance, Runner } from "../../types/generalTypes";
import { getRaceDetails, updateRaceParticipants } from "../../state/actions/RaceDetails";
import { displayTime } from "../../util/timeUtils";
import { compileResults, getDistanceCheckpoints, runnerAtCheckpoint, runnerDistance } from "../../util/resultsUtils";
import { tableProps } from "../../util/table";

interface ParticipantsProps {
  raceId: string;
}

export function RaceParticipants({
  match,
  history,
}: RouteComponentProps<ParticipantsProps>) {
  const { raceId } = match.params;
  const dispatch = useDispatch();
  const location: any = useLocation();
  const { race, authorization, password, loading, success } = useSelector(
    (state: RootStore) => state.raceDetails
  );
  const hasStarted = race && race.startTime < Date.now();

  const isAdmin = authorization === "RACE_ADMIN";

  const [selectedDistance, setSelectedDistanceState] = useState<
    number | undefined
  >(location.state?.selectedDistance);
  const setSelectedDistance = (value: number | undefined) => {
    setSelectedDistanceState(value);
    history.replace(location.pathname, {
      ...location.state,
      selectedDistance: value,
    });
  };

  const checkpointInfo = getDistanceCheckpoints(race, selectedDistance);
  const allRunners: Runner[] = Object.values(race?.runners || []);
  const runnerArray: Runner[] = selectedDistance
    ? allRunners.filter(
        (runner: Runner) => runner.distance === selectedDistance
      )
    : allRunners;

  const [makingNewRunner, setMakingNewRunner] = useState<boolean>(true);
  const getDefaultRunnerData = (): Partial<Runner> => {
    return {
      offset: 0,
    };
  };
  const [runnerEditing, setRunnerEditing] = useState<Partial<Runner>>(
    getDefaultRunnerData()
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && saveInProgress) {
      if (success) {
        setErrorMessage("");
        if (makingNewRunner) setRunnerEditing(getDefaultRunnerData());
      } else {
        setErrorMessage("The runner could not be saved.");
      }
      setSaveInProgress(false);
    }
  }, [loading]);

  const allResults = hasStarted ? compileResults(race) : undefined;
  return (
    <>
      <h1>{`Race ${hasStarted ? "Results" : "Participants"}`}</h1>
      <div style={{position: "relative"}}>
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
          <option value="0">Select a Distance</option>
          {race?.raceDetails?.distances?.map((distance) => (
            <option key={distance} value={String(distance)}>
              {`${distance} Miles`}
            </option>
          ))}
        </select>
        <button
          className="highlight-button"
          style={{position: "absolute", right: 0}}
          onClick={() => dispatch(getRaceDetails(raceId))}
        >
          {`Refresh ${hasStarted ? "Results" : "Participants"}`}
        </button>
      </div>
      {isAdmin && <p style={{marginTop: 5}}>Click a runner to edit their details.</p>}
      {(!hasStarted || selectedDistance) && (
        <DataTable
          columns={
            hasStarted && selectedDistance
              ? [
                  {
                    name: "Rank",
                    selector: (runner) => "rank"
                  },
                  {
                    name: "Runner Name",
                    selector: (runner) => runner.runnerName,
                    sortField: "runnerName"
                  },
                  {
                    name: "Bib Number",
                    selector: (runner) => runner.bibNumber,
                    sortField: "bibNumber"
                  },
                  ...checkpointInfo.map((info: CheckpointDistance, checkpointIndex: number) => ({
                    name: `${info.distance} Miles${checkpointIndex === checkpointInfo.length - 1 ? " (End)" : ""}`,
                    selector: (runner: Runner) => {
                      if (!allResults) return "";
                      const timestamp = allResults[String(selectedDistance)].runners[runner.bibNumber].checkpointInfo[checkpointIndex]?.timestamp
                      if (!timestamp) return "";
                      return displayTime((timestamp - (runner.offset * 1000) - race.startTime) / 1000, true)
                    },
                    sortFunction: (r1: Runner, r2: Runner) => {
                      if (!allResults) return 0;
                      const t1 = runnerAtCheckpoint(allResults[String(selectedDistance)].runners[r1.bibNumber], checkpointIndex)
                      const t2 = runnerAtCheckpoint(allResults[String(selectedDistance)].runners[r2.bibNumber], checkpointIndex)
                      if (t1 && !t2) return -1;
                      if (t2 && !t1) return -1
                      if (t1 && t2) return t1 - t2;
                      return 0
                    }
                  })),
                  {
                    name: "Distance",
                    selector: (runner) => {
                      if (!allResults) return "";
                      const runnerResults = allResults[String(selectedDistance)].runners[runner.bibNumber]
                      const distance = runnerDistance(runnerResults)
                      if (!distance.distance) return "";
                      if (distance.distance === runner.distance) return "Finished"
                      return `${distance.distance} Miles`
                    },
                    sortFunction: (r1, r2) => {
                      if (!allResults) return 0;
                      const d1 = runnerDistance(allResults[String(selectedDistance)].runners[r1.bibNumber])
                      const d2 = runnerDistance(allResults[String(selectedDistance)].runners[r2.bibNumber])
                      const distanceDiff = d1.distance - d2.distance
                      if (distanceDiff !== 0) return distanceDiff
                      return d2.lastTime - d1.lastTime
                    }
                  }
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
                    selector: (runner) =>
                      runner.offset ? displayTime(runner.offset) : "-",
                  },
                ]
          }
          data={runnerArray}
          {...tableProps}
          keyField="bibNumber"
          noDataComponent={<p>There are no runners in this race yet.</p>}
          onRowClicked={
            isAdmin
              ? (row) => {
                  setRunnerEditing(row);
                  setMakingNewRunner(false);
                }
              : undefined
          }
        />
      )}
      {isAdmin && (
        <>
          <hr />
          <h3>Runner Check-In</h3>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", position: "relative" }}>
              <h2>{makingNewRunner ? "Edit Runner" : "Add Runner"}</h2>
              <button
                style={{ position: "absolute", right: 0 }}
                className="highlight-button"
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
                <>
                  &nbsp;
                  <span>{runnerEditing.bibNumber}</span>
                </>
              )}
            </div>
            <div style={{ marginTop: 10 }}>
              <span>Distance:</span>
              <select
                style={{ marginLeft: 10 }}
                value={runnerEditing.distance || 0}
                onChange={(e) =>
                  setRunnerEditing({
                    ...runnerEditing,
                    distance: Number.parseInt(e.target.value),
                  })
                }
              >
                <option key="0">Select a Distance</option>
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
                    setErrorMessage("All fields must be filled out!");
                    return;
                  }
                  setErrorMessage("");
                  const newRunners = { ...race?.runners };
                  const enteredRunner: Runner = {
                    offset: 0,
                    ...runnerEditing,
                  } as Runner;
                  newRunners[enteredRunner.bibNumber] = enteredRunner;

                  setSaveInProgress(true);
                  dispatch(updateRaceParticipants(race, newRunners, password));
                }}
                className="clickable-button"
              >
                Save Runner
              </button>
              {!makingNewRunner && (
                <button
                  className="highlight-button"
                  style={{marginLeft: 32}}
                  onClick={() => {
                    if (!race || saveInProgress) return;
                    const newRunners = { ...race?.runners };
                    if (runnerEditing.bibNumber)
                      delete newRunners[runnerEditing.bibNumber];

                    setSaveInProgress(true);
                    dispatch(
                      updateRaceParticipants(race, newRunners, password)
                    );
                  }}
                >
                  Delete Runner
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
