import { useState, useEffect } from "react";
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

  const {race, loading, success, password, authorization } = useSelector((state: RootStore) => state.raceDetails);
  const checkpointDetails: Checkpoint | undefined = race?.checkpoints[checkpointId]

  const [selectedBib, setSelectedBib] = useState<string>("");
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!loading && saveInProgress) {
      if (success) {
        const runnerInfo = race?.runners[selectedBib]
        const runnerPart = runnerInfo ? `, ${runnerInfo.runnerName}, running ${runnerInfo.distance} mile${runnerInfo.distance === 1 ? "" : "s"},` : ""
        setErrorMessage(`Bib Number ${selectedBib}${runnerPart} saved successfully!`);
        setSelectedBib("")
      } else {
        setErrorMessage("The runner entry could not be added.");
      }
      setSaveInProgress(false);
    }
  }, [loading]);

  if (!authorization || !["RACE_ADMIN", "RACE_ASSISTANT"].includes(authorization)) {
    return <Redirect to={`/${raceId}`} />
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
      <div style={{ marginTop: 20 }}>
        <span>Runner's Bib Number:</span>
        <input
          style={{marginLeft: 10}}
          type="text"
          value={selectedBib || ""}
          onChange={(e) => setSelectedBib(e.target.value)}
        />
      </div>
      <div style={{marginTop: 10}}>
        <button
          type="submit"
          className="clickable-button"
          onClick={() => {
            if (saveInProgress) return;
            setSaveInProgress(true)
            setErrorMessage("")
            dispatch(addCheckpointEntry(raceId, checkpointId, selectedBib, "CREATE", password))
          }}
        >
          Submit
        </button>
        <p style={{marginTop: 16}}>{errorMessage}</p>
      </div>
    </>
  );
}
