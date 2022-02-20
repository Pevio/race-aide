import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RouteComponentProps } from "react-router";
import DataTable from "react-data-table-component";
import {
  RaceDistance,
  Runner,
} from "../../types/generalTypes";
import {
  getRaceDetails,
  updateRaceParticipants,
} from "../../state/actions/RaceDetails";
import { displayTime } from "../../util/timeUtils";
import {
  raceHasStarted,
} from "../../util/resultsUtils";
import { tableProps } from "../../util/table";


interface ParticipantsProps {
  raceId: string;
}

export function Registration({
  match,
  history,
}: RouteComponentProps<ParticipantsProps>) {
  const { raceId } = match.params;
  const dispatch = useDispatch();
  const { race, password, loading, success } =
    useSelector((state: RootStore) => state.raceDetails);

  const hasStarted = raceHasStarted(race);
  useEffect(() => {
    if (hasStarted) dispatch(getRaceDetails(raceId));
  }, [hasStarted]);

  const allRunners: Runner[] = Object.values(race?.runners || []);

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
      <p style={{ marginTop: 5 }}>Click a runner to edit their details.</p>
      <DataTable
        columns={[
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
        ]}
        data={allRunners}
        {...tableProps}
        keyField="bibNumber"
        noDataComponent={<p>There are no runners for this distance yet.</p>}
        pointerOnHover={true}
        onRowClicked={(row) => {
                setRunnerEditing(row);
                setMakingNewRunner(false);
              }
        }
        defaultSortFieldId={hasStarted ? "distance" : "name"}
      />
          <hr style={{ marginTop: 32 }} />
          <div className="container" style={{ marginTop: 32 }}>
            <div style={{ display: "flex", position: "relative" }}>
              <h2>{makingNewRunner ? "Add Runner" : "Edit Runner"}</h2>
              {!makingNewRunner && <button
                style={{ position: "absolute", right: 0 }}
                className="highlight-button"
                onClick={() => {
                  setMakingNewRunner(true);
                  setRunnerEditing(getDefaultRunnerData());
                }}
              >
                Add New Runner
              </button>}
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
            {hasStarted && <div style={{ marginTop: 10 }}>
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
            </div>}
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
  );
}
