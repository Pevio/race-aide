import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RouteComponentProps, useLocation } from "react-router";
import DataTable from "react-data-table-component";
import { RacePageWrapper } from "../RacePageWrapper";
import { getDistanceCheckpoints } from "../../util/resultsUtils";
import { Checkpoint, CheckpointDetails } from "../../types/generalTypes";
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
  const { race, authorization, password, loading, success } = useSelector((state: RootStore) => state.raceDetails);

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
  const [newDistance, setNewDistance] = useState<Partial<CheckpointDetails>>({})

  useEffect(() => {
    if (!loading && saveInProgress) {
      if (success) {
        setErrorMessage("")
        if (makingNewCheckpoint) setCheckpointEditing(getDefaultCheckpointData())
      } else {
        setErrorMessage("The checkpoint could not be saved.")
      }
      setSaveInProgress(false);
    }
  }, [loading])

  return (
    <RacePageWrapper>
      <h1>Race Checkpoints</h1>
      <p>Race Aide uses a checkpoint system to log results. Below you will see all checkpoints that correspond to each distance of the race.</p>
      <div style={{marginTop: 10}}>
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
      {selectedDistance &&
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
              selector: (check) => check.distance + " Miles",
            },
          ]}
          data={checkpoints}
          highlightOnHover
          responsive
          striped
          keyField="checkpointNumber"
          noDataComponent={<p>No checkpoints have been added to this distance yet.</p>}
          onRowClicked={isAdmin || isAssistant ? (check) => {
            if (isAssistant || hasStarted) {
              history.push(`/${raceId}/addresults/${check.checkpointNumber}`)
            }
            if (isAdmin) {
              const editing = race?.checkpoints.find((checkpoint) => checkpoint.checkpointNumber === check.checkpointNumber)
              if (!editing) return
              setCheckpointEditing(editing)
              setMakingNewCheckpoint(false);
            }
          } : undefined}
        />
      }
      {isAdmin && !hasStarted && 
        <>
          <hr />
          <h3>Edit Race Checkpoints</h3>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", position: "relative" }}>
              <h2>{makingNewCheckpoint ? "Edit Checkpoint" : "Add Checkpoint"}</h2>
              <button
                style={{ position: "absolute", right: 0 }}
                onClick={() => {
                  setMakingNewCheckpoint(true);
                  setCheckpointEditing(getDefaultCheckpointData());
                }}
              >
                Add New Checkpoint
              </button>
            </div>
            <div style={{ marginTop: 10 }}>
              <span>Checkpoint Number:</span>
              <input
                type="text"
                style={{ marginLeft: 10 }}
                value={checkpointEditing.checkpointNumber}
                onChange={(e) =>
                  setCheckpointEditing({
                    ...checkpointEditing,
                    checkpointNumber: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <p>Each checkpoint can be used for any number of races, and any number of different distances within a race. Make sure to include a checkpoint for the end of the race</p>
              <div style={{marginTop: 5, marginBottom: 5}}>
                {checkpointEditing.distances?.map((distance: CheckpointDetails, index: number) => (
                  <React.Fragment key={`${distance.distance}-${distance.raceDistance}`}>
                    {`${distance.raceDistance} Mile Race: ${distance.distance} Miles`}
                    <button
                      style={{marginLeft: 2, marginRight: checkpointEditing?.distances && index !== checkpointEditing.distances.length - 1 ? 10 : 0}}
                      onClick={() => {
                        setCheckpointEditing({
                          ...checkpointEditing,
                          distances: checkpointEditing.distances?.filter(
                            (oldDistance) => oldDistance.distance !== distance.distance || oldDistance.raceDistance !== distance.raceDistance
                          ),
                        });
                      }}
                    >
                      Remove
                    </button><br/>
                  </React.Fragment>
                ))}
              </div>
              <div>
                <p>Add New Distance:</p>
                <div>
                  <span>Race:</span>
                  <select
                    style={{ marginLeft: 10 }}
                    value={String(newDistance.raceDistance)}
                    onChange={(e) =>
                      setNewDistance({
                        ...newDistance,
                        raceDistance: Number.parseFloat(e.target.value)
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
                <div>
                  <span>Distance:</span>
                  <input
                    style={{ marginLeft: 10 }}
                    type="number"
                    step="any"
                    min={0}
                    value={newDistance.distance || 0}
                    onChange={(e) => {
                      const newValue = Number.parseFloat(e.target.value)
                      if (!newValue) return;
                      setNewDistance({
                        ...newDistance,
                        distance: newValue
                      })
                    }}
                  />
                </div>
                {newDistance.raceDistance && newDistance.distance &&
                  <button
                    onClick={() => {
                      if (!newDistance.raceDistance || !newDistance.distance) return;
                      setCheckpointEditing({
                        ...checkpointEditing,
                        distances: [...(checkpointEditing.distances || []), newDistance as CheckpointDetails]
                      })
                      setNewDistance({})
                    }}
                  >
                    Add
                  </button>
                }
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              {errorMessage && <p>{errorMessage}</p>}
              <button
                onClick={() => {
                  if (saveInProgress) return;
                  if (
                    !race || !checkpointEditing.checkpointNumber || !checkpointEditing.distances?.length
                  ) {
                    setErrorMessage("Make sure you have a checkpoint number and at least one distance")
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
