import { useState } from "react";
import { RouteComponentProps } from "react-router";
import { RacePageWrapper } from "../RacePageWrapper";

interface CheckpointProps {
  raceId: string;
  checkpointId: string;
}

export function Checkpoint({
  match,
  history,
}: RouteComponentProps<CheckpointProps>) {
  const { raceId, checkpointId } = match.params;
  const [selectedBib, setSelectedBib] = useState<string>("")
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  
  return (
    <RacePageWrapper>
      <h1>Enter Checkpoint Information</h1>
      <div>
        <span>Select your checkpoint:</span>
      </div>
      <div style={{marginTop: 20}}>
        <span>Runner's Bib Number:</span>
        <input type="text" value={selectedBib} onChange={(e) => setSelectedBib(e.target.value)}/>
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
      <div>

      </div>
    </RacePageWrapper>
  );
}
