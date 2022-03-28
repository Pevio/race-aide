import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RouteComponentProps, useLocation } from "react-router";
import DataTable from "react-data-table-component";
import {
  getDistanceCheckpoints,
  raceHasStarted,
} from "../../util/resultsUtils";
import {
  Checkpoint,
  CheckpointDetails,
  CheckpointDistance,
  RaceDistance,
  RaceResult,
} from "../../types/generalTypes";
import { updateRaceCheckpoints } from "../../state/actions/RaceDetails";
import { tableProps } from "../../util/table";
import { displayTime } from "../../util/timeUtils";

interface CheckpointProps {
  raceId: string;
}

export function CheckpointPage({
  match,
  history,
}: RouteComponentProps<CheckpointProps>) {
  const { raceId } = match.params;
  const location: any = useLocation();
  const dispatch = useDispatch();
  const { race, authorization, password, loading, success, errorResponse, allResults } =
    useSelector((state: RootStore) => state.raceDetails);

  const isAdmin = authorization === "RACE_ADMIN";
  const isAssistant = authorization === "RACE_ASSISTANT";
  const hasStarted = raceHasStarted(race);

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
  const checkpoints: CheckpointDistance[] = getDistanceCheckpoints(
    race,
    selectedDistance
  );

  const [makingNewCheckpoint, setMakingNewCheckpoint] = useState<boolean>(true);
  const getDefaultCheckpointData = (): Partial<Checkpoint> => {
    return {};
  };
  const [checkpointEditing, setCheckpointEditing] = useState<
    Partial<Checkpoint>
  >(getDefaultCheckpointData());
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const [newDistance, setNewDistance] = useState<Partial<CheckpointDetails>>(
    {}
  );
  const [showCheckpointForm, setShowCheckpointForm] = useState<boolean>(
    !hasStarted
  );

  useEffect(() => {
    if (!loading && saveInProgress) {
      if (success) {
        setErrorMessage("");
        if (makingNewCheckpoint)
          setCheckpointEditing(getDefaultCheckpointData());
      } else {
        setErrorMessage(`The checkpoint could not be saved. ${errorResponse || ""}`);
      }
      setSaveInProgress(false);
    }
  }, [loading]);

  const beginAddingEntries = (check: Checkpoint | CheckpointDistance) => {
    history.push(
      `/${raceId}/addresults/${check.checkpointNumber}`,
      location.state
    );
  };
  const onRowClicked =
    isAdmin || isAssistant
      ? (check: Checkpoint | CheckpointDistance) => {
          if (!showCheckpointForm) {
            beginAddingEntries(check);
            return;
          }
          if (isAdmin) {
            const editing = Object.values(race?.checkpoints || []).find(
              (checkpoint) =>
                checkpoint.checkpointNumber === check.checkpointNumber
            );
            if (!editing) return;
            setCheckpointEditing(editing);
            setMakingNewCheckpoint(false);
          }
        }
      : undefined;

  
  return (
    <>
      <h1>Race Checkpoints</h1>
      <p>
        {`Race Aide uses a checkpoint system to log results. Below you will see
        all checkpoints that correspond to each distance of the race.${
          hasStarted
            ? ""
            : " Once the race has started, you will also see the fastest and average splits for each checkpoint."
        }`}
      </p>
      <div style={{ marginTop: 10 }}>
        <span>Select a Distance:</span>
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              setSelectedDistance(undefined);
              return;
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
      </div>
      {isAdmin && !hasStarted && selectedDistance !== undefined && (
        <p>
          Click on a checkpoint to edit its details or enter results for it.
        </p>
      )}
      {hasStarted &&
        (isAdmin || isAssistant) &&
        selectedDistance !== undefined && (
          <p style={{ marginTop: 16 }}>
            Click on a checkpoint to enter results for it. If you see your
            checkpoint multiple times, click on any of them.
          </p>
        )}
      {selectedDistance ? (
        <DataTable
          columns={[
            {
              name: "#",
              selector: (check, index) =>
                index !== undefined ? index + 1 : "",
              maxWidth: "32px",
              id: "number",
              grow: 1,
            },
            {
              name: "Checkpoint Name",
              selector: (check) => check.checkpointNumber,
              id: "check-name",
              compact: true,
              grow: 3,
            },
            {
              name: "Distance",
              selector: (check) =>
                check.distance +
                ` Mile${check.distance === 1 ? "" : "s"}` +
                (check.distance === selectedDistance ? " (End)" : ""),
              id: "distance",
              compact: true,
              grow: 2,
            },
            ...(hasStarted
              ? [
                  {
                    name: "Average Split",
                    selector: (check: CheckpointDistance) => {
                      if (!allResults) return "";
                      let checkpointIndex = -1;
                      allResults[String(selectedDistance)].checkpoints.forEach(
                        (checkDistance: CheckpointDistance, index: number) => {
                          if (checkDistance.id === check.id)
                            checkpointIndex = index;
                        }
                      );

                      let totalTime = 0; // Milliseconds
                      let runnersSeen = 0;

                      Object.values(
                        allResults[String(selectedDistance)].runners
                      ).forEach((runner: RaceResult) => {
                        if (
                          runner.checkpointInfo &&
                          runner.checkpointInfo.length >= checkpointIndex + 1
                        ) {
                          const thisTimestamp =
                            runner.checkpointInfo[checkpointIndex]?.timestamp;
                          const previousTimestamp =
                            checkpointIndex === 0
                              ? (race?.startTime || 0) + runner.offset
                              : runner.checkpointInfo[checkpointIndex - 1]
                                  ?.timestamp;
                          if (
                            thisTimestamp !== undefined &&
                            previousTimestamp
                          ) {
                            const diff = thisTimestamp - previousTimestamp;
                            if (diff > 0) {
                              totalTime += diff;
                              runnersSeen += 1;
                            }
                          }
                        }
                      });

                      if (runnersSeen === 0) return "-";
                      return displayTime(totalTime / 1000 / runnersSeen);
                    },
                    id: "average",
                    compact: true,
                    grow: 2,
                  },
                  {
                    name: "Average Speed",
                    selector: () => "coming soon",
                    id: "avg-speed",
                    compact: true,
                    grow: 2,
                  },
                  {
                    name: "Fastest Split",
                    selector: (check: CheckpointDistance) => {
                      if (!allResults) return "";
                      let checkpointIndex = -1;
                      allResults[String(selectedDistance)].checkpoints.forEach(
                        (checkDistance: CheckpointDistance, index: number) => {
                          if (checkDistance.id === check.id)
                            checkpointIndex = index;
                        }
                      );

                      let fastestTime = 0; // Milliseconds
                      let fastestTimePerson = "";
                      Object.values(
                        allResults[String(selectedDistance)].runners
                      ).forEach((runner: RaceResult) => {
                        if (
                          runner.checkpointInfo &&
                          runner.checkpointInfo.length >= checkpointIndex + 1
                        ) {
                          const thisTimestamp =
                            runner.checkpointInfo[checkpointIndex]?.timestamp;
                          const previousTimestamp =
                            checkpointIndex === 0
                              ? (race?.startTime || 0) + runner.offset
                              : runner.checkpointInfo[checkpointIndex - 1]
                                  ?.timestamp;
                          if (thisTimestamp && previousTimestamp) {
                            const diff = thisTimestamp - previousTimestamp;
                            if (
                              diff > 0 &&
                              (diff < fastestTime || fastestTime === 0)
                            ) {
                              fastestTime = diff;
                              fastestTimePerson = runner.runnerName;
                            }
                          }
                        }
                      });

                      if (fastestTime === 0) return "-";
                      return `${displayTime(
                        fastestTime / 1000
                      )} (${fastestTimePerson})`;
                    },
                    id: "fastest",
                    compact: true,
                    grow: 3,
                  },
                ]
              : []),
          ]}
          data={checkpoints}
          {...tableProps}
          keyField="id"
          key="checkpoints-for-distance"
          noDataComponent={
            <p>No checkpoints have been added to this distance yet.</p>
          }
          pointerOnHover={isAdmin || isAssistant}
          onRowClicked={onRowClicked}
        />
      ) : (
        <DataTable
          columns={[
            {
              name: "Checkpoint Name",
              selector: (check) => check.checkpointNumber,
            },
            {
              name: "Races",
              selector: (check) => {
                const distances: Set<number> = new Set<number>()
                check.distances.forEach((d: CheckpointDetails) => {
                  distances.add(d.raceDistance)
                })
                const distanceArray = Array.from(distances).sort((a, b) => a - b);
                let result = ""
                distanceArray.forEach((d, i) => {
                  result = `${result}${i > 0 ? ", " : ""}${d} Mile Race`
                })
                return result;
              }
            }
          ]}
          keyField="checkpointNumber"
          key="generic-checkpoints"
          data={Object.values(race?.checkpoints || {})}
          onRowClicked={onRowClicked}
          {...tableProps}
          pointerOnHover={onRowClicked !== undefined}
        />
      )}
      {isAdmin && !showCheckpointForm && (
        <div style={{ marginTop: 32 }}>
          <button
            className="highlight-button"
            onClick={() => setShowCheckpointForm(true)}
          >
            DANGER: Add and Edit Checkpoints
          </button>
        </div>
      )}
      {isAdmin && showCheckpointForm && (
        <>
          <hr style={{ marginTop: 32 }} />
          <div className="container" style={{ marginTop: 32 }}>
            <h3>Edit Race Checkpoints</h3>
            <div style={{ display: "flex", position: "relative" }}>
              <h2>{`${makingNewCheckpoint ? "Add" : "Edit"} Checkpoint`}</h2>
              <button
                style={{ position: "absolute", right: 0 }}
                className="highlight-button"
                onClick={() => {
                  setMakingNewCheckpoint(true);
                  setCheckpointEditing(getDefaultCheckpointData());
                }}
              >
                Add New Checkpoint
              </button>
            </div>
            {makingNewCheckpoint ? (
              <div style={{ marginTop: 8 }}>
                <span>Checkpoint Name:</span>
                <input
                  type="text"
                  style={{ marginLeft: 10 }}
                  value={checkpointEditing.checkpointNumber || ""}
                  onChange={(e) =>
                    setCheckpointEditing({
                      ...checkpointEditing,
                      checkpointNumber: e.target.value,
                    })
                  }
                />
                <p style={{fontSize: 12, color: ""}}>This may only contain letters, numbers, hyphens, and underscores.</p>
              </div>
            )
              : <p>{`Checkpoint Name: ${checkpointEditing.checkpointNumber}`}</p>
            }
            {hasStarted && !makingNewCheckpoint && (
              <div style={{ marginTop: 10 }}>
                <button
                  style={{ marginRight: 16 }}
                  className="highlight-button"
                  onClick={() =>
                    beginAddingEntries(checkpointEditing as Checkpoint)
                  }
                >
                  Add Runner Entires for this Checkpoint
                </button>
              </div>
            )}
            <div className="container" style={{ marginTop: 16 }}>
              <h3>Checkpoint Distances</h3>
              <p>
                Each checkpoint can be used for any number of races, and any
                number of different distances within a race. Make sure to
                include a checkpoint for the end of the race
              </p>
              <div style={{ marginTop: 5, marginBottom: 5 }}>
                {checkpointEditing.distances?.map(
                  (distance: CheckpointDetails, index: number) => (
                    <React.Fragment
                      key={`${distance.distance}-${distance.raceDistance}`}
                    >
                      {`${distance.raceDistance} Mile Race: ${
                        distance.distance
                      } Mile${distance.distance === 1 ? "" : "s"}`}
                      <button
                        style={{
                          marginLeft: 6,
                          marginRight:
                            checkpointEditing?.distances &&
                            index !== checkpointEditing.distances.length - 1
                              ? 10
                              : 0,
                        }}
                        className="highlight-button"
                        onClick={() => {
                          setCheckpointEditing({
                            ...checkpointEditing,
                            distances: checkpointEditing.distances?.filter(
                              (oldDistance) =>
                                oldDistance.distance !== distance.distance ||
                                oldDistance.raceDistance !==
                                  distance.raceDistance
                            ),
                          });
                        }}
                      >
                        Remove
                      </button>
                      <br />
                    </React.Fragment>
                  )
                )}
              </div>
              <div>
                <p>Add New Distance:</p>
                <div style={{ marginTop: 10 }}>
                  <span>Race:</span>
                  <select
                    style={{ marginLeft: 10 }}
                    value={String(newDistance.raceDistance)}
                    onChange={(e) =>
                      setNewDistance({
                        ...newDistance,
                        raceDistance: Number.parseFloat(e.target.value),
                      })
                    }
                  >
                    <option key="not-selected">Select a Distance</option>
                    {race?.raceDetails?.distances?.map(
                      (distance: RaceDistance) => (
                        <option
                          key={distance.distance}
                          value={String(distance.distance)}
                        >
                          {`${distance.distance} Miles`}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div style={{ marginTop: 10 }}>
                  <span>Distance (Miles):</span>
                  <input
                    style={{ marginLeft: 10 }}
                    type="number"
                    step="any"
                    min={0}
                    value={newDistance.distance || 0}
                    onChange={(e) => {
                      const newValue = Number.parseFloat(e.target.value || "0");
                      setNewDistance({
                        ...newDistance,
                        distance: newValue,
                      });
                    }}
                  />
                </div>
                {newDistance.raceDistance !== undefined &&
                  newDistance.distance && (
                    <button
                      className="highlight-button"
                      onClick={() => {
                        if (!newDistance.raceDistance || !newDistance.distance)
                          return;
                        setCheckpointEditing({
                          ...checkpointEditing,
                          distances: [
                            ...(checkpointEditing.distances || []),
                            newDistance as CheckpointDetails,
                          ],
                        });
                        setNewDistance({});
                      }}
                    >
                      Add
                    </button>
                  )}
              </div>
            </div>
            <div style={{ marginTop: 32 }}>
              {hasStarted && (
                <p style={{ marginBottom: 16 }}>
                  This race has started. Be VERY CAREFUL when editing checkpoints
                  to ensure you don't lose race data!
                </p>
              )}
              <div>
                <button
                  onClick={() => {
                    if (saveInProgress) return;
                    if (
                      !race ||
                      !checkpointEditing.checkpointNumber ||
                      !checkpointEditing.distances?.length
                    ) {
                      setErrorMessage(
                        "Make sure you have a Checkpoint Name and at least one distance"
                      );
                      return;
                    }
                    setErrorMessage("");
                    setSaveInProgress(true);
                    dispatch(
                      updateRaceCheckpoints(
                        race,
                        checkpointEditing as Checkpoint,
                        makingNewCheckpoint ? "CREATE" : "UPDATE",
                        password
                      )
                    );
                  }}
                  className="clickable-button"
                >
                  Save Checkpoint
                </button>
                {!makingNewCheckpoint && (
                  <button
                    className="highlight-button"
                    style={{ marginLeft: 16 }}
                    onClick={() => {
                      if (!race || saveInProgress) return;
                      setSaveInProgress(true);
                      dispatch(
                        updateRaceCheckpoints(
                          race,
                          checkpointEditing as Checkpoint,
                          "DELETE",
                          password
                        )
                      );
                    }}
                  >
                    Delete Checkpoint
                  </button>
                )}
              </div>
            </div>
            {errorMessage && <p className="response-info">{errorMessage}</p>}
          </div>
        </>
      )}
    </>
  );
}
