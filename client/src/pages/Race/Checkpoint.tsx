import { useState } from "react";
import { RacePageWrapper } from "../RacePageWrapper";

export function Checkpoint() {
  const [selectedBib, setSelectedBib] = useState<string>("")
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
