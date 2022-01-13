import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { Redirect, RouteComponentProps } from "react-router";
import { RacePageWrapper } from "../RacePageWrapper";
import { Checkpoint } from "../../types/generalTypes";

interface CheckpointProps {
  raceId: string;
  checkpointId: string;
}

export function CheckpointInfo({
  match,
  history,
}: RouteComponentProps<CheckpointProps>) {
  const { raceId, checkpointId } = match.params;
  const dispatch = useDispatch();

  const raceData = useSelector((state: RootStore) => state.raceDetails);
  const checkpointDetails = raceData.race?.checkpoints?.find(
    (checkpoint: Checkpoint) => checkpoint.checkpointNumber === checkpointId
  );

  const [selectedBib, setSelectedBib] = useState<string>("");
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);

  if (!checkpointDetails) {
    if (raceData.loading) {
      return (
        <RacePageWrapper>
          <h1>Enter Checkpoint Information</h1>
          <p>Race Data Loading...</p>
        </RacePageWrapper>
      );
    }
    return <Redirect to={`/${raceId}/admin`} />;
  }

  return (
    <RacePageWrapper>
      <h1>Enter Checkpoint Information</h1>
      <div>
        <p>{`Selected Checkpoint: ${checkpointId}`}</p>
      </div>
      <div style={{ marginTop: 20 }}>
        <span>Runner's Bib Number:</span>
        <input
          type="text"
          value={selectedBib}
          onChange={(e) => setSelectedBib(e.target.value)}
        />
      </div>
      <button
        type="submit"
        onClick={() => {
          if (saveInProgress) return;
          // Send runner to back end
        }}
      >
        Submit
      </button>
      <div></div>
    </RacePageWrapper>
  );
}
