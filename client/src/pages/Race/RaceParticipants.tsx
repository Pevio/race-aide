import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RouteComponentProps, useLocation } from "react-router";
import DataTable from "react-data-table-component";
import { CheckpointDistance, Runner } from "../../types/generalTypes";
import {
  getRaceDetails,
  updateRaceParticipants,
} from "../../state/actions/RaceDetails";
import { displayTime } from "../../util/timeUtils";
import {
  getDistanceCheckpoints,
  raceHasStarted,
  runnerAtCheckpoint,
  runnerDistance,
} from "../../util/resultsUtils";
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
  const { race, authorization, password, loading, success, allResults } = useSelector(
    (state: RootStore) => state.raceDetails
  );
  const hasStarted = raceHasStarted(race)

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
  
  return (
    <>
      <h1>{`Race ${hasStarted ? "Results" : "Participants"}`}</h1>
      <div style={{ position: "relative" }}>
        <span>Select a Distance:</span>
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (!value) setSelectedDistance(undefined);
            setSelectedDistance(Number.parseFloat(e.target.value));
          }}
          value={selectedDistance || "ALL"}
          style={{ marginLeft: 10 }}
        >
          <option>Select a Distance</option>
          {race?.raceDetails?.distances?.map((distance) => (
            <option key={distance} value={String(distance)}>
              {`${distance} Miles`}
            </option>
          ))}
        </select>
        <button
          className="highlight-button"
          style={{ position: "absolute", right: 0 }}
          onClick={() => dispatch(getRaceDetails(raceId))}
        >
          {`Refresh ${hasStarted ? "Results" : "Participants"}`}
        </button>
      </div>
      {isAdmin && selectedDistance && (
        <p style={{ marginTop: 5 }}>Click a runner to edit their details.</p>
      )}
      {selectedDistance ? (
        <DataTable
          columns={
            hasStarted && selectedDistance
              ? [
                  {
                    name: "#",
                    selector: (runner, index) => {
                      if (index !== undefined) return String(index + 1);
                      return "";
                    },
                    id: "rank",
                  },
                  {
                    name: "Runner Name",
                    selector: (runner) => runner.runnerName,
                    sortField: "runnerName",
                    sortable: true,
                    id: "name",
                  },
                  {
                    name: "Bib Number",
                    selector: (runner) => runner.bibNumber,
                    sortFunction: (r1: Runner, r2: Runner) => {
                      const n1 = Number.parseFloat(r1.bibNumber);
                      const n2 = Number.parseFloat(r2.bibNumber);
                      if (!isNaN(n1) && !isNaN(n2)) return n1 - n2;
                      return r1.bibNumber.localeCompare(r2.bibNumber);
                    },
                    id: "bib",
                  },
                  {
                    name: "Start Time Offset",
                    selector: (runner) =>
                      runner.offset ? displayTime(runner.offset) : "-",
                    id: "offset",
                  },
                  ...checkpointInfo.map(
                    (info: CheckpointDistance, checkpointIndex: number) => ({
                      name: `${info.distance} Mile${info.distance === 1 ? "" : "s"}${
                        checkpointIndex === checkpointInfo.length - 1
                          ? " (End)"
                          : ""
                      }`,
                      selector: (runner: Runner) => {
                        if (!allResults || !race) return "";
                        const timestamp =
                          allResults[String(selectedDistance)].runners[
                            runner.bibNumber
                          ]?.checkpointInfo[checkpointIndex]?.timestamp;
                        if (!timestamp) return "";
                        return displayTime(
                          (timestamp - (runner.offset * 1000) - race.startTime) /
                            1000,
                          true
                        );
                      },
                      sortFunction: (r1: Runner, r2: Runner) => {
                        if (!allResults) return 0;
                        const t1: number | undefined = runnerAtCheckpoint(
                          allResults[String(selectedDistance)].runners[
                            r1.bibNumber
                          ],
                          checkpointIndex
                        );
                        const t2: number | undefined = runnerAtCheckpoint(
                          allResults[String(selectedDistance)].runners[
                            r2.bibNumber
                          ],
                          checkpointIndex
                        );
                        if (t1 && !t2) return 1;
                        if (t2 && !t1) return -1;
                        if (t1 && t2) return t1 - t2;
                        return 0;
                      },
                      id: `checkpoint-${checkpointIndex}`,
                    })
                  ),
                  {
                    name: "Distance",
                    selector: (runner) => {
                      if (!allResults) return "";
                      const runnerResults =
                        allResults[String(selectedDistance)].runners[
                          runner.bibNumber
                        ];
                      const distance = runnerDistance(runnerResults);
                      if (!distance.distance) return "";
                      if (distance.distance === runner.distance)
                        return "Finished";
                      return `${distance.distance} Mile${
                        distance.distance === 1 ? "" : "s"
                      }`;
                    },
                    sortFunction: (r1: Runner, r2: Runner) => {
                      if (!allResults) return 0;
                      const d1 = runnerDistance(
                        allResults[String(selectedDistance)].runners[
                          r1.bibNumber
                        ]
                      );
                      const d2 = runnerDistance(
                        allResults[String(selectedDistance)].runners[
                          r2.bibNumber
                        ]
                      );
                      const distanceDiff = d2.distance - d1.distance;
                      if (distanceDiff !== 0) return distanceDiff;
                      return d1.lastTime - d2.lastTime;
                    },
                    id: "distance",
                  },
                ]
              : [
                  {
                    name: "Runner Name",
                    selector: (runner) => runner.runnerName,
                    id: "name",
                  },
                  {
                    name: "Bib Number",
                    selector: (runner) => runner.bibNumber,
                    id: "bib",
                  },
                  {
                    name: "Distance",
                    selector: (runner) => `${runner.distance} Miles`,
                    id: "distance",
                  },
                  {
                    name: "Start Time Offset",
                    selector: (runner) =>
                      runner.offset ? displayTime(runner.offset) : "-",
                    id: "offset",
                  },
                ]
          }
          data={runnerArray}
          {...tableProps}
          keyField="bibNumber"
          noDataComponent={<p>There are no runners in this race yet.</p>}
          pointerOnHover={isAdmin}
          onRowClicked={
            isAdmin
              ? (row) => {
                  setRunnerEditing(row);
                  setMakingNewRunner(false);
                }
              : undefined
          }
          defaultSortFieldId={hasStarted ? "distance" : "name"}
        />
      ) : <p>{`Select a distance to see ${hasStarted ? "Results" : "Participants"} for that race.`}</p>}
      {isAdmin && (
        <>
          <hr />
          <h3>Runner Check-In</h3>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", position: "relative" }}>
              <h2>{makingNewRunner ? "Add Runner" : "Edit Runner"}</h2>
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
                    distance: Number.parseFloat(e.target.value),
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
                value={runnerEditing.offset || 0}
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
                  style={{ marginLeft: 32 }}
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
