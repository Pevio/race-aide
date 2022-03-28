import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { Redirect, RouteComponentProps } from "react-router";
import DataTable from "react-data-table-component";
import { addCheckpointEntry, getFailedCheckpointEntries } from "../../state/actions/RaceDetails";
import { CheckpointEntry } from "../../types/generalTypes";
import { tableProps } from "../../util/table";
import { displayTimestamp } from "../../util/timeUtils";

interface FailedCheckpointProps {
  raceId: string;
}

export function FailedCheckpoints({
  match,
  history,
}: RouteComponentProps<FailedCheckpointProps>) {
  const { raceId } = match.params;
  const dispatch = useDispatch();

  const { loading, success, password, authorization } = useSelector(
    (state: RootStore) => state.raceDetails
  );

  const [failedCheckpoints, setFailedCheckpoints] = useState<CheckpointEntry[]>(getFailedCheckpointEntries(raceId))
  const [indexSaving, setIndexSaving] = useState<number | undefined>()
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>("");

  const removeCheckpointEntry = (index: number): void => {
    const newEntries = [...failedCheckpoints]
    newEntries.splice(index, 1)
    setFailedCheckpoints(newEntries)
    localStorage.setItem(`failed-checkponts-${raceId}`, JSON.stringify(newEntries));
  }
  useEffect(() => {
    if (!loading && saveInProgress) {
      if (success) {
        if (indexSaving !== undefined) {
          removeCheckpointEntry(indexSaving)
          setIndexSaving(undefined);
        }
        setErrorMessage("The checkpoint entry has been saved!");
      } else {
        setErrorMessage("The runner entry could not be saved.");
      }
      setSaveInProgress(false)
    }
  }, [loading]);

  if (
    !authorization ||
    !["RACE_ADMIN", "RACE_ASSISTANT"].includes(authorization)
  ) {
    return <Redirect to={`/${raceId}`} />;
  }

  return (
    <>
      <h1>Failed Checkpoint Information</h1>
      <div>
        <p>The following are checkpoints you recorded, but failed to be saved for one reason or another. You can attempt to save them again here, or delete them if </p>
      </div>
      {errorMessage && <p className="response-info">{errorMessage}</p>}
      <DataTable<CheckpointEntry>
        columns={[
          {
            name: "Checkpoint Name",
            selector: (check) => check.checkpointNumber,
          },
          {
            name: "Bib Number",
            selector: (check) => check.bibNumber
          },
          {
            name: "Time",
            selector: (check) => displayTimestamp(check.timestamp)
          },
          {
            name: "Save",
            cell: (check, index) => <button onClick={() => {
              if (saveInProgress) return;
              setSaveInProgress(true);
              setIndexSaving(index)
              dispatch(addCheckpointEntry(
                raceId,
                check.checkpointNumber,
                check.bibNumber,
                "CREATE",
                password,
                check.timestamp
              ))
            }} className="highlight-button" style={{paddingLeft: 0}}>Save</button>
          },
          {
            name: "Delete",
            cell: (check, index) => <button onClick={() => {
              if (saveInProgress) return;
              removeCheckpointEntry(index)
            }} className="highlight-button" style={{paddingLeft: 0}}>Delete</button>
          }
        ]}
        key="failed-checkpoints"
        data={failedCheckpoints}
        {...tableProps}
        pointerOnHover={false}
        noDataComponent={
          <p>You do not have any failed checkpoint entries!</p>
        }
      />
    </>
  );
}
