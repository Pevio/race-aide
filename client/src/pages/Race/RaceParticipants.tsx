import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RouteComponentProps, useLocation } from "react-router";
import DataTable from "react-data-table-component";
import {
  CheckpointDistance,
  RaceDistance,
  Runner,
} from "../../types/generalTypes";
import {
  getRaceDetails,
  updateRaceParticipants,
} from "../../state/actions/RaceDetails";
import { displayTime, displayTimestamp } from "../../util/timeUtils";
import {
  getDistanceCheckpoints,
  raceHasStarted,
  runnerAtCheckpoint,
  runnerDistance,
} from "../../util/resultsUtils";
import { tableProps } from "../../util/table";
import { Link } from "react-router-dom";

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
  const { race, authorization, password, loading, success, allResults } =
    useSelector((state: RootStore) => state.raceDetails);
  const hasStarted = raceHasStarted(race);

  const hasWriteAccess =
    authorization === "RACE_ADMIN" || authorization === "RACE_ASSISTANT";
  const isAdmin = authorization === "RACE_ADMIN"

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
  const [showRunnerForm, setShowRunnerForm] = useState<boolean>(!hasStarted);

  useEffect(() => {
    if (!loading && saveInProgress) {
      if (success) {
        setErrorMessage("Runner information saved!");
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
            if (!value) {
              setSelectedDistance(undefined);
              return
            }
            setSelectedDistance(Number.parseFloat(e.target.value));
          }}
          value={selectedDistance || "ALL"}
          style={{ marginLeft: 10 }}
        >
          <option key="none-selected">Select a Distance</option>
          {race?.raceDetails?.distances?.map((distance: RaceDistance) => (
            <option key={distance.distance} value={String(distance.distance)}>
              {`${distance.distance} Miles`}
            </option>
          ))}
        </select>
        {selectedDistance !== undefined && (
          <button
            className="highlight-button"
            style={{ position: "absolute", right: 0 }}
            onClick={() => dispatch(getRaceDetails(raceId))}
          >
            {`Refresh ${hasStarted ? "Results" : "Participants"}`}
          </button>
        )}
      </div>
      {selectedDistance !== undefined && (
        <p>
          {`Start time for the ${selectedDistance} race: ${displayTimestamp(
            race?.raceDetails.distances.find(
              (dis) => dis.distance === selectedDistance
            )?.startTime,
            race?.timezone,
            "hh:mm a"
          )}`}
        </p>
      )}
      {hasWriteAccess && showRunnerForm && selectedDistance !== undefined && (
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
                    grow: 1,
                  },
                  {
                    name: "Runner Name",
                    selector: (runner) => runner.runnerName,
                    sortField: "runnerName",
                    sortable: true,
                    id: "name",
                    compact: true,
                    grow: 4,
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
                    compact: true,
                    grow: 2,
                  },
                  {
                    name: "Start Time Offset",
                    selector: (runner) =>
                      runner.offset ? displayTime(runner.offset) : "-",
                    id: "offset",
                    compact: true,
                    hide: 1000,
                    grow: 2,
                  },
                  ...checkpointInfo.map(
                    (info: CheckpointDistance, checkpointIndex: number) => ({
                      name: `${info.distance} Mile${
                        info.distance === 1 ? "" : "s"
                      }${
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
                          (timestamp - runner.offset * 1000 - race.startTime) /
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
                        if (t1 && !t2) return -1;
                        if (t2 && !t1) return 1;
                        if (t1 && t2) return t1 - t2;
                        return 0;
                      },
                      id: `checkpoint-${checkpointIndex}`,
                      compact: true,
                      grow: 2,
                    })
                  ),
                  {
                    name: "Distance",
                    selector: (runner: Runner) => {
                      if (!allResults) return "";
                      const runnerResults =
                        allResults[String(selectedDistance)].runners[
                          runner.bibNumber
                        ];
                      if (runnerResults?.dnf) return "DNF";
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
                    compact: true,
                    grow: 3,
                  },
                ]
              : [
                  {
                    name: "Runner Name",
                    selector: (runner) => runner.runnerName,
                    id: "name",
                    grow: 3,
                  },
                  {
                    name: "Bib Number",
                    selector: (runner) => runner.bibNumber,
                    id: "bib",
                    compact: true,
                    grow: 2,
                  },
                  {
                    name: "Distance",
                    selector: (runner) => `${runner.distance} Miles`,
                    id: "distance",
                    compact: true,
                    grow: 2,
                  },
                  {
                    name: "Start Time Offset",
                    selector: (runner) =>
                      runner.offset ? displayTime(runner.offset) : "-",
                    id: "offset",
                    compact: true,
                    grow: 2,
                  },
                ]
          }
          data={runnerArray}
          {...tableProps}
          keyField="bibNumber"
          noDataComponent={<p>There are no runners in this race yet.</p>}
          pointerOnHover={hasWriteAccess && showRunnerForm}
          onRowClicked={
            hasWriteAccess && showRunnerForm
              ? (row) => {
                  setRunnerEditing(row);
                  setMakingNewRunner(false);
                }
              : undefined
          }
          defaultSortFieldId={hasStarted ? "distance" : "name"}
        />
      ) : (
        <p>{`Select a distance to see ${
          hasStarted ? "results" : "participants"
        } for that race.`}</p>
      )}
      {hasWriteAccess && !showRunnerForm && (
        <div style={{ marginTop: 32 }}>
          <button
            className="highlight-button"
            onClick={() => setShowRunnerForm(true)}
          >
            Add or Edit Runner Information
          </button>
          {isAdmin &&
            <>
              <br/><br/>
              <Link
                className="highlight-button"
                to={`/${raceId}/manualeditentries`}
              >
                Manually Checkpoint Entries
              </Link>
            </>
          }
        </div>
      )}
      {hasWriteAccess && showRunnerForm && (
        <>
          <hr style={{ marginTop: 32 }} />
          <div className="container" style={{ marginTop: 32 }}>
            <h3>Runner Check-In</h3>
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
                value={runnerEditing.runnerName || ""}
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
                  value={runnerEditing.bibNumber || ""}
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
                value={runnerEditing.distance || "none"}
                onChange={(e) =>
                  setRunnerEditing({
                    ...runnerEditing,
                    distance: Number.parseFloat(e.target.value),
                  })
                }
              >
                <option key="none">Select a Distance</option>
                {race?.raceDetails?.distances?.map((distance: RaceDistance) => (
                  <option
                    key={distance.distance}
                    value={String(distance.distance)}
                  >
                    {`${distance.distance} Miles`}
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
                    offset: Number.parseInt(e.target.value || "0"),
                  })
                }
              />
            </div>
            <div style={{ marginTop: 10 }}>
              <input
                type="checkbox"
                id="runner-dnf"
                checked={runnerEditing.dnf || false}
                onChange={(e) =>
                  setRunnerEditing({
                    ...runnerEditing,
                    dnf: e.target.checked,
                  })
                }
              />
              <label htmlFor="runner-dnf">Did Not Finish</label>
            </div>
            <div style={{ marginTop: 10 }}>
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

                  setSaveInProgress(true);
                  dispatch(
                    updateRaceParticipants(
                      race,
                      runnerEditing as Runner,
                      makingNewRunner ? "CREATE" : "UPDATE",
                      password
                    )
                  );
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
                    setErrorMessage("");

                    setSaveInProgress(true);
                    dispatch(
                      updateRaceParticipants(
                        race,
                        runnerEditing as Runner,
                        "DELETE",
                        password
                      )
                    );
                  }}
                >
                  Delete Runner
                </button>
              )}
              {errorMessage && <p className="response-info">{errorMessage}</p>}
            </div>
          </div>
        </>
      )}
    </>
  );
}
