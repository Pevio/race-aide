import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { Redirect, RouteComponentProps, useLocation } from "react-router";
import DataTable from "react-data-table-component";
import {
  getCheckpointsByRunner,
  getIssues,
} from "../../util/resultsUtils";
import {
  RaceIssues, CheckpointEntry, Runner
} from "../../types/generalTypes";
import { displayTime, displayTimestamp } from "../../util/timeUtils";
import { Tabs } from "../../components/Tabs";
import { tableProps } from "../../util/table";

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
  const { race, authorization, password, loading, success } =
    useSelector((state: RootStore) => state.raceDetails);
  const issues: RaceIssues = getIssues(race);

  const [view, setViewState] = useState<string>(location.state?.manualEditView || "ISSUES")
  const setView = (newView: string, additionalStateParams: object = {}) => {
    history.replace(location.pathname, {manualEditView: newView, ...additionalStateParams})
    setViewState(newView)
  }
  if (race && authorization !== "RACE_ADMIN") {
    return <Redirect to={`/${raceId}`} />;
  }

  const IssuesView = () => {

    return (
      <>
        <p>
          These are runners who skipped a checkpoint or who passed by the same checkpoint too many times. Click on one to see full details for that runner.
        </p>
        <DataTable
          columns={[
            {
              name: "Runner Name"
            },
            {
              name: "Bib Number"
            },
            {
              name: "Total Checkpoints Passed"
            },
            {
              name: "Issue"
            }
          ]}
          data={[] as any[]}
          {...tableProps}
          pointerOnHover={true}
          onRowClicked={(entry) => {
            setView("MANUAL_EDIT", {bibNumber: entry.bibNumber});
          }}
          noDataComponent={<p>No runners have suspicious activity!</p>}
        />
      </>
    )
  }
  const UnknownView = () => {
    const [entryEditing, setEntryEditing] = useState<{
      checkpointNumber: string,
      timestamp: number,
      bibNumber?: string;
    } | undefined>(undefined)

    return (
      <>
        <p>
          These are entries where the race assistants couldn't catch the bib number of the runner. Click on one to give it a bib number or delete it.
          Race Time is based on the start time of the race, not nessecarily the start time of the runner's distance.
        </p>
        <DataTable
          columns={[
            {
              name: "Checkpoint",
              selector: (entry) => entry.checkpointNumber
            },
            {
              name: "Real Time",
              selector: (entry) => {
                return displayTimestamp(entry.timestamp, race?.timezone)
              }
            },
            {
              name: "Race Time",
              selector: (entry) => {
                if (!race) return "-"
                return displayTime((entry.timestamp - race.startTime) / 1000, true)
              }
            }
          ]}
          data={issues.unknownEntries}
          {...tableProps}
          pointerOnHover={true}
          onRowClicked={(entry) => setEntryEditing(entry)}
          noDataComponent={<p>No unknown entries have been added!</p>}
        />
        {entryEditing &&
          <div style={{marginTop: 32}}>
            <h2>Edit Unknown Checkpoint Entry</h2>
            <div>

            </div>
            <div>
              <button
                className="clickable-button"
                onClick={() => {

                }}
              >
                Apply Bib Number
              </button>
              <button
                className="highlight-button"
                style={{marginLeft: 32}}
                onClick={() => {
                  
                }}
              >
                Delete Entry
              </button>
            </div>
          </div>
        }
        
      </>
    )
  }

  const EditView = () => {
    const [bibNumber, setBibNumber] = useState<string | undefined>(location.state.bibNumber || undefined);
    const [makingNewEntry, setMakingNewEntry] = useState<boolean>(true)
    const [data, setData] = useState<Partial<CheckpointEntry>>(location.state.checkpointEntry || {})
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);

    const entries: CheckpointEntry[] = getCheckpointsByRunner(race, bibNumber);

    if (!bibNumber) {
      const runners: Runner[] = Object.values(race?.runners || [])
      return (
        <>
          <p>Select a runner to edit their checkpoint entries.</p>
          <DataTable
            data={runners}
            columns={[
              {
                name: "Runner Name"
              },
              {
                name: "Bib Number"
              },
              {
                name: "Distance Running"
              },
            ]}
            noDataComponent={<p>This race doesn't have any runners.</p>}
            {...tableProps}
            pointerOnHover={true}
            onRowClicked={(runner: Runner) => setBibNumber(runner.bibNumber)}
          />
        </>
      )
    }
    return (
      <>
        <div style={{marginBottom: 10}}>
          <button
            className="highlight-button"
            style={{marginLeft: 0}}
            onClick={() => setBibNumber(undefined)}
          >
            Select a Different Runner
          </button>
        </div>
        <p>
          Here, you can add or remove checkpoint entry you like from the bib number you have selected.
        </p>
        <p>{`Runner ${race?.runners[bibNumber].runnerName || ""}, bib number ${bibNumber}`}</p>
        <DataTable
          data={entries}
          columns={[
            {
              name: "Checkpoint Number"
            },
            {
              name: "Real Time"
            },
            {
              name: "Race Time"
            },
          ]}
          noDataComponent={<p>No checkpoint entries have been added for this runner.</p>}
          {...tableProps}
          pointerOnHover={true}
        />
      </>
    )
  }

  const getTabContent = (): React.ReactNode => {
    switch (view) {
      case "ISSUES":
        return <IssuesView />;
      case "UNKNOWN_ENTRIES":
        return <UnknownView />
      case "MANUAL_EDIT":
        return <EditView />;
    }
  }

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
          {key: "ISSUES", title: "Checkpoint Issues"},
          {key: "UNKNOWN_ENTRIES", title: "Unknown Checkpoint Entries"},
          {key: "MANUAL_EDIT", title: "Edit Checkpoint Entries"}
        ]}
      />
      {getTabContent()}
    </>
  );
}
