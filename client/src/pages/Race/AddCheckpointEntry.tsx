import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { Redirect, RouteComponentProps } from "react-router";
import { addCheckpointEntry } from "../../state/actions/RaceDetails";
import { Checkpoint } from "../../types/generalTypes";

interface CheckpointProps {
  raceId: string;
  checkpointId: string;
}

export function AddCheckpointEntry({
  match,
  history,
}: RouteComponentProps<CheckpointProps>) {
  const { raceId, checkpointId } = match.params;
  const dispatch = useDispatch();

  const { race, loading, success, password, authorization } = useSelector(
    (state: RootStore) => state.raceDetails
  );
  const checkpointDetails: Checkpoint | undefined =
    race?.checkpoints[checkpointId];

  const nonNumericBib = (): boolean => {
    const runnerList = Object.values(race?.runners || []);
    for (let i = 0; i < runnerList.length; i++) {
      if (!/[0-9]+$/.test(runnerList[i].bibNumber)) return true;
    }
    return false;
  }

  const [selectingNumbers, setSelectingNumbers] = useState<boolean>(!nonNumericBib())
  const [selectedBib, setSelectedBib] = useState<string>("");
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const [entryType, setEntryType] = useState<string>(""); // The type of save we are performing
  const [errorMessage, setErrorMessage] = useState<React.ReactNode>("");

  useEffect(() => {
    if (!loading && saveInProgress) {
      if (success) {
        const thisBib = entryType === "CREATE" ? selectedBib : "UNKNOWN_RUNNER"
        const getUndoButton = () => (
          <button
            className="highlight-button"
            onClick={() => {
              setSaveInProgress(true);
              setErrorMessage("");
              dispatch(
                addCheckpointEntry(
                  raceId,
                  checkpointId,
                  thisBib,
                  "DELETE",
                  password
                )
              );
              setEntryType("DELETE")
            }}
          >
            Undo
          </button>
        )

        switch (entryType) {
          case "CREATE":
            const runnerInfo = race?.runners[selectedBib];
            const runnerPart = runnerInfo
              ? `, ${runnerInfo.runnerName}, running ${runnerInfo.distance} mile${
                  runnerInfo.distance === 1 ? "" : "s"
                },`
              : "";


            setErrorMessage(
              <>{`Bib Number ${selectedBib}${runnerPart} saved successfully! `}
                {getUndoButton()}
              </>
            );
            break;
          case "DELETE":
            setErrorMessage("Undo successful!")
            break;
          case "UNKNOWN":
            setErrorMessage(<>{"Unknown runner saved successfully!"}{getUndoButton()}</>)
            break;
        }

        setSelectedBib("");
        const inputElement = document.getElementById("check-bib-number");
        if (inputElement) inputElement.focus();
      } else {
        setErrorMessage("The runner entry could not be saved.");
      }
      setSaveInProgress(false);
    }
  }, [loading]);

  if (
    !authorization ||
    !["RACE_ADMIN", "RACE_ASSISTANT"].includes(authorization)
  ) {
    return <Redirect to={`/${raceId}`} />;
  }

  if (!checkpointDetails) {
    if (loading) {
      return (
        <>
          <h1>Enter Checkpoint Information</h1>
          <p>Race Data Loading...</p>
        </>
      );
    }
    return <Redirect to={`/${raceId}/admin`} />;
  }

  return (
    <>
      <h1>Enter Checkpoint Information</h1>
      <div>
        <p>{`Selected Checkpoint: ${checkpointId}`}</p>
      </div>
      <div>
        <input
          type="checkbox"
          id="selecting-number"
          checked={selectingNumbers}
          onChange={(e) => setSelectingNumbers(e.target.checked)}
        />
        <label htmlFor="selecting-number">Enter Numeric Numbers</label>
      </div>
      <div style={{ marginTop: 20 }}>
        <span>Runner's Bib Number:</span>
        <input
          style={{ marginLeft: 10 }}
          type={selectingNumbers ? "number" : "text"}
          id="check-bib-number"
          value={selectedBib || ""}
          onChange={(e) => setSelectedBib(e.target.value)}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <div>
          <button
            type="submit"
            className="clickable-button"
            onClick={() => {
              if (saveInProgress) return;
              setSaveInProgress(true);
              setErrorMessage("");
              dispatch(
                addCheckpointEntry(
                  raceId,
                  checkpointId,
                  selectedBib,
                  "CREATE",
                  password
                )
              );
              setEntryType("CREATE")
            }}
          >
            Submit
          </button>
          <button
            className="highlight-button"
            style={{marginLeft: 32}}
            onClick={() => {
              if (saveInProgress) return;
              setSaveInProgress(true);
              setErrorMessage("");
              dispatch(
                addCheckpointEntry(
                  raceId,
                  checkpointId,
                  undefined,
                  "CREATE",
                  password
                )
              );
              setEntryType("UNKNOWN")
            }}
          >
            Unknown Runner Passed
          </button>
        </div>
        <p className="response-info" style={{color: "black"}}>{errorMessage}</p>
      </div>
    </>
  );
}
