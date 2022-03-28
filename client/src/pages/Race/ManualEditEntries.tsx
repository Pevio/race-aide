import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { Redirect, RouteComponentProps, useLocation } from "react-router";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import TimePicker from "@mui/lab/TimePicker";
import DatePicker from "@mui/lab/DatePicker";
import DataTable from "react-data-table-component";
import { getCheckpointsByRunner, getIssues } from "../../util/resultsUtils";
import {
  RaceIssues,
  CheckpointEntry,
  Runner,
  Checkpoint,
} from "../../types/generalTypes";
import {
  combineDateTime,
  displayTime,
  displayTimestamp,
} from "../../util/timeUtils";
import { Tabs } from "../../components/Tabs";
import { tableProps } from "../../util/table";
import { useEffect } from "react";
import { modifyCheckpointEntry } from "../../state/actions/RaceDetails";

interface CheckpointProps {
  raceId: string;
}

export function ManuelEditEntries({
  match,
  history,
}: RouteComponentProps<CheckpointProps>) {
  const { raceId } = match.params;
  const location: any = useLocation();
  const dispatch = useDispatch();
  const { race, authorization, password, loading, success } = useSelector(
    (state: RootStore) => state.raceDetails
  );
  const issues: RaceIssues = getIssues(race);

  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>("");

  const [view, setViewState] = useState<string>(
    location.state?.manualEditView || "ISSUES"
  );
  const setView = (newView: string, additionalStateParams: object = {}) => {
    history.replace(location.pathname, {
      manualEditView: newView,
      ...additionalStateParams,
    });
    setViewState(newView);
    setErrorMessage("");
  };

  useEffect(() => {
    if (!loading && saveInProgress) {
      if (success) {
        setErrorMessage("Save successful!");
      } else {
        setErrorMessage(
          "An error occurred. Please validate all data and try again."
        );
      }
      setSaveInProgress(false);
    }
  }, [loading]);

  if (race && authorization !== "RACE_ADMIN") {
    return <Redirect to={`/${raceId}`} />;
  }

  const IssuesView = () => {
    return (
      <>
        <p>
          These are runners who skipped a checkpoint or who passed by the same
          checkpoint too many times. Click on one to see full checkpoint details
          for that runner.
        </p>
        <DataTable
          columns={[
            {
              name: "Runner Name",
              selector: (issue) => issue.runnerName,
            },
            {
              name: "Bib Number",
              selector: (issue) => issue.bibNumber,
            },
            {
              name: "Total Checkpoints Passed",
              selector: (issue) => issue.checkpointEntries.length,
            },
            {
              name: "Issue",
              selector: (issue) => issue.issue,
            },
          ]}
          data={Object.values(issues.problemRunners)}
          {...tableProps}
          pointerOnHover={true}
          onRowClicked={(entry) => {
            setView("MANUAL_EDIT", { bibNumber: entry.bibNumber });
          }}
          noDataComponent={<p>No runners have suspicious activity!</p>}
        />
      </>
    );
  };
  const UnknownView = () => {
    const [entryEditing, setEntryEditing] = useState<
      | {
          checkpointNumber: string;
          timestamp: number;
          bibNumber: string;
        }
      | undefined
    >(undefined);
    const [enteredBibNumber, setEnteredBibNumber] = useState<string>("");

    return (
      <>
        <p>
          These are entries where the race assistants couldn't catch the bib
          number of the runner, or entered a bib number that doesn't exist.
          Click on one to give it a bib number or delete it. Race Time is based
          on the start time of the race, not nessecarily the start time of the
          runner's distance.
        </p>
        <DataTable
          columns={[
            {
              name: "Checkpoint",
              selector: (entry) => entry.checkpointNumber,
            },
            {
              name: "Bib Number",
              selector: (entry) => {
                if (entry.bibNumber === "UNKNOWN_ENTRY")
                  return "Unknown Runner";
                return entry.bibNumber;
              },
            },
            {
              name: "Real Time",
              selector: (entry) => {
                return displayTimestamp(entry.timestamp, race?.timezone);
              },
            },
            {
              name: "Race Time",
              selector: (entry) => {
                if (!race) return "-";
                return displayTime(
                  (entry.timestamp - race.startTime) / 1000,
                  true
                );
              },
            },
          ]}
          data={issues.unknownEntries}
          {...tableProps}
          pointerOnHover={true}
          onRowClicked={(entry) => {
            setEntryEditing(entry);
            setEnteredBibNumber(
              entry.bibNumber === "UNKNOWN_RUNNER" ? "" : entry.bibNumber
            );
          }}
          noDataComponent={<p>No unknown entries have been added!</p>}
        />
        {entryEditing && (
          <div style={{ marginTop: 32 }}>
            <h2>Edit Unknown Checkpoint Entry</h2>
            <p style={{ fontSize: 12 }}>
              You can give this entry to an actual bib number, or remove it
              entirely.
            </p>
            <p
              style={{ marginTop: 10 }}
            >{`Checkpoint Name: ${entryEditing.checkpointNumber}`}</p>
            <p style={{ marginTop: 5 }}>{`Real Time: ${displayTimestamp(
              entryEditing.timestamp,
              race?.timezone
            )}`}</p>
            <div style={{ marginTop: 10 }}>
              <span>Bib Number:</span>
              <input
                style={{ marginLeft: 5 }}
                value={enteredBibNumber || ""}
                type="text"
                onChange={(e) => setEnteredBibNumber(e.target.value || "")}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                className="clickable-button"
                onClick={() => {
                  if (
                    !race ||
                    saveInProgress ||
                    !enteredBibNumber ||
                    enteredBibNumber === "UNKNOWN_RUNNER"
                  )
                    return;
                  setSaveInProgress(true);
                  dispatch(
                    modifyCheckpointEntry(
                      race,
                      {
                        ...entryEditing,
                        bibNumber: enteredBibNumber,
                        oldBibNumber: entryEditing.bibNumber,
                      },
                      "EDIT_BIB_NUMBER",
                      password
                    )
                  );
                }}
              >
                Apply Bib Number
              </button>
              <button
                className="highlight-button"
                style={{ marginLeft: 32 }}
                onClick={() => {
                  if (!race || saveInProgress) return;
                  setSaveInProgress(true);
                  dispatch(
                    modifyCheckpointEntry(
                      race,
                      {
                        ...entryEditing,
                        oldTimestamp: entryEditing.timestamp,
                      },
                      "DELETE",
                      password
                    )
                  );
                }}
              >
                Delete Entry
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  const EditView = () => {
    const [bibNumber, setBibNumber] = useState<string | undefined>(
      location.state.bibNumber || undefined
    );
    const [makingNewEntry, setMakingNewEntry] = useState<boolean>(true);
    const [checkpointNumber, setCheckpointNumber] = useState<string>("");
    const [oldTimestamp, setOldTimestamp] = useState<number>(0);
    const [entryDate, setEntryDate] = useState<Date | null>(null);
    const [entryTime, setEntryTime] = useState<Date | null>(null);
    const clearForm = (): void => {
      setMakingNewEntry(true);
      setCheckpointNumber("");
      setOldTimestamp(0);
      if (race) {
        setEntryDate(new Date(race.startTime));
        setEntryTime(new Date(race.startTime));
      }
    };

    const entries: CheckpointEntry[] = getCheckpointsByRunner(race, bibNumber);

    if (!bibNumber) {
      const runners: Runner[] = Object.values(race?.runners || []);
      return (
        <>
          <p>Select a runner to edit their checkpoint entries.</p>
          <DataTable<Runner>
            data={runners}
            columns={[
              {
                name: "Runner Name",
                selector: (runner) => runner.runnerName,
              },
              {
                name: "Bib Number",
                selector: (runner) => runner.bibNumber,
              },
              {
                name: "Distance Running",
                selector: (runner) => `${runner.distance} Mile${runner.distance === 1 ? "" : "s"}`,
              },
            ]}
            noDataComponent={<p>This race doesn't have any runners.</p>}
            {...tableProps}
            pointerOnHover={true}
            onRowClicked={(runner: Runner) => {
              setBibNumber(runner.bibNumber);
              clearForm();
            }}
          />
        </>
      );
    }
    const getResultEntry = () => {
      return {
        bibNumber,
        checkpointNumber,
        timestamp: combineDateTime(entryDate, entryTime, race?.timezone || ""),
        oldTimestamp: makingNewEntry ? undefined : oldTimestamp,
      };
    };

    return (
      <>
        <div style={{ marginBottom: 10 }}>
          <button
            className="highlight-button"
            style={{ marginLeft: 0 }}
            onClick={() => setBibNumber(undefined)}
          >
            Select a Different Runner
          </button>
        </div>

        <h2>{`Checkpoint Entries: ${
          race?.runners[bibNumber].runnerName || ""
        }`}</h2>
        <p>{`Bib Number: ${bibNumber}`}</p>
        <p>{`Distance: ${race?.runners[bibNumber].distance || 0} mile${
          race?.runners[bibNumber].distance === 1 ? "" : "s"
        }`}</p>
        <p style={{ marginTop: 12, fontSize: 12 }}>
          Here, you can add or remove checkpoint entries from the bib
          number you have selected.
        </p>
        <DataTable
          data={entries}
          columns={[
            {
              name: "Checkpoint Number",
              selector: (entry: CheckpointEntry) => entry.checkpointNumber,
            },
            {
              name: "Real Time",
              selector: (entry: CheckpointEntry) =>
                displayTimestamp(entry.timestamp),
            },
            {
              name: "Race Time",
              selector: (entry) => {
                const runner = race?.runners[bibNumber];
                const distanceDetails = race?.raceDetails.distances.find(
                  (dis) => dis.distance === runner?.distance
                );
                if (!distanceDetails || !runner) return "-";
                return displayTime(
                  (entry.timestamp - runner.offset - race.startTime) / 1000,
                  true
                );
              },
            },
          ]}
          noDataComponent={
            <p>No checkpoint entries have been added for this runner.</p>
          }
          {...tableProps}
          pointerOnHover={true}
          onRowClicked={(entry: CheckpointEntry) => {
            setMakingNewEntry(false);
            setCheckpointNumber(entry.checkpointNumber);
            setEntryDate(new Date(entry.timestamp));
            setEntryTime(new Date(entry.timestamp));
            setOldTimestamp(entry.timestamp);
          }}
        />
        <div style={{ position: "relative", marginTop: 32, marginBottom: 10 }}>
          <h2>{`${makingNewEntry ? "Add New" : "Edit"} Checkpoint Entry`}</h2>
          <button
            className="highlight-button"
            style={{ position: "absolute", right: 0 }}
            onClick={clearForm}
          >
            Create Checkpoint Entry
          </button>
        </div>
        {makingNewEntry ? (
          <div>
            <span>Checkpoint Name: </span>
            <select
              value={checkpointNumber || ""}
              onChange={(e) => setCheckpointNumber(e.target.value || "")}
            >
              <option value="">Select a Checkpoint</option>
              {Object.values(race?.checkpoints || []).map(
                (check: Checkpoint) => (
                  <option
                    key={check.checkpointNumber}
                    value={check.checkpointNumber}
                  >
                    {check.checkpointNumber}
                  </option>
                )
              )}
            </select>
          </div>
        ) : (
          <>
            <p
              style={{ marginTop: 10 }}
            >{`Checkpoint Name: ${checkpointNumber}`}</p>
            <p style={{ marginTop: 5, fontSize: 12 }}>
              To change this runner or checkpoint number that applies to this
              entry, delete this entry and create a new one. WARNING: You are editing actual race data here!
            </p>
          </>
        )}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div style={{ marginTop: 10, display: "flex" }}>
            <div style={{ marginRight: 5, paddingTop: 10 }}>
              Checkpoint Entry Date:
            </div>
            <DatePicker
              value={entryDate}
              onChange={(newValue) => {
                setEntryDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
              className="datepicker"
            />
          </div>
          <div style={{ marginTop: 10, display: "flex" }}>
            <div style={{ marginRight: 5, paddingTop: 10 }}>
              Checkpoint Entry Time:
            </div>
            <TimePicker
              value={entryTime}
              onChange={(newValue) => {
                setEntryTime(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
              minutesStep={1}
              views={["hours", "minutes", "seconds"]}
            />
          </div>
        </LocalizationProvider>
        <div style={{ marginTop: 10 }}>
          <button
            className="clickable-button"
            onClick={() => {
              if (
                !race ||
                !checkpointNumber ||
                !entryDate ||
                !entryTime ||
                saveInProgress
              )
                return;
              setSaveInProgress(true);
              dispatch(
                modifyCheckpointEntry(
                  race,
                  getResultEntry(),
                  makingNewEntry ? "CREATE" : "UPDATE",
                  password
                )
              );
            }}
          >
            Save Checkpoint Entry
          </button>
          {!makingNewEntry && (
            <button
              className="highlight-button"
              style={{ marginLeft: 16 }}
              onClick={() => {
                if (!race || saveInProgress) return;
                setSaveInProgress(true);
                dispatch(
                  modifyCheckpointEntry(
                    race,
                    getResultEntry(),
                    "DELETE",
                    password
                  )
                );
              }}
            >
              Delete Checkpoint Entry
            </button>
          )}
        </div>
      </>
    );
  };

  const getTabContent = (): React.ReactNode => {
    switch (view) {
      case "ISSUES":
        return <IssuesView />;
      case "UNKNOWN_ENTRIES":
        return <UnknownView />;
      case "MANUAL_EDIT":
        return <EditView />;
    }
  };

  return (
    <>
      <h1>Manually Edit Checkpoint Entries</h1>
      <p style={{ fontSize: 12 }}>
        If a volunteer misses a runner at a checkpoint, or enters the wrong bib
        number, use this page see reconcile issues and manually edit checkpoint
        information.
      </p>
      <Tabs
        onClickTab={(key: string) => setView(key)}
        activeTab={view}
        tabs={[
          { key: "ISSUES", title: "Checkpoint Issues" },
          { key: "UNKNOWN_ENTRIES", title: "Unknown Checkpoint Entries" },
          { key: "MANUAL_EDIT", title: "Edit Checkpoint Entries" },
        ]}
      />
      {getTabContent()}
      {errorMessage && <p className="response-info">{errorMessage}</p>}
    </>
  );
}
