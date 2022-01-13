import { useState } from "react";
import { useSelector } from "react-redux";
import { RaceDetailsForm } from "../../components/RaceDetailsForm";
import { RootStore } from "../../state/store";
import { FullRace, RaceAuthorizationDescription } from "../../types/generalTypes";
import { RacePageWrapper } from "../RacePageWrapper";

export function RaceAdmin() {
  const raceData = useSelector((state: RootStore) => state.raceDetails);

  const [enteredPassword, setEnteredPassword] = useState<string>("");

  const getMainContent = () => {
    if (!raceData.authorization) {
      return (
        <>
          <p>If you have access to edit this race, enter the password below.</p>
          <div>
            <input
              type="string"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
            />
            <button type="submit" onClick={() => {}}>
              Submit
            </button>
          </div>
        </>
      );
    }
    return (
      <>
        <p>
          <span>{`You are currently logged in as a ${
            RaceAuthorizationDescription[raceData.authorization]
          }.`}</span>
          <button>Log Out</button>
        </p>
        {raceData.authorization === "RACE_ADMIN" && (
          <>
            <h3>Edit Race Details</h3>
            <RaceDetailsForm
              isUpdate
              onClickSubmit={(race: Partial<FullRace>) => {}}
              defaultData={raceData.race}
            />
          </>
        )}
        <h3>Checkpoints</h3>
        <p>To enter results at the checkpoint, enter details below.</p>
        <button></button>
      </>
    );
  };

  return (
    <RacePageWrapper>
      <h1>Admin Tools</h1>
      {getMainContent()}
    </RacePageWrapper>
  );
}
