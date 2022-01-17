import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { RaceDetailsForm } from "../../components/RaceDetailsForm";
import {
  setRacePassword,
  updateRaceDetails,
} from "../../state/actions/RaceDetails";
import { RootStore } from "../../state/store";
import {
  FullRace,
  RaceAuthorizationDescription,
} from "../../types/generalTypes";

interface AdminProps {
  raceId: string;
}

export function RaceAdmin({ match, history }: RouteComponentProps<AdminProps>) {
  const { raceId } = match.params;
  const dispatch = useDispatch();

  const raceData = useSelector((state: RootStore) => state.raceDetails);

  const [enteredPassword, setEnteredPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);

  useEffect(() => {
    if (!raceData.loading && saveInProgress) {
      if (raceData.success) {
        setErrorMessage("Race details saved successfully!");
      } else {
        setErrorMessage("Race details could not be saved.");
      }
      setSaveInProgress(false);
    }
  }, [raceData.loading]);

  const getMainContent = () => {
    if (!raceData.authorization) {
      return (
        <>
          <p>If you have access to edit this race, enter the password below.</p>
          <div style={{ marginTop: 10 }}>
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
            />
            <button
              type="submit"
              className="clickable-button"
              style={{ marginLeft: 10 }}
              onClick={async () => {
                const res = await fetch(`/api/validatepassword`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ password: enteredPassword, raceId }),
                });
                const data = await res.json();
                if (data.access in RaceAuthorizationDescription) {
                  dispatch(setRacePassword(enteredPassword, data.access));
                } else {
                  setPasswordError(true);
                }
                setEnteredPassword("");
              }}
            >
              Log In
            </button>
          </div>
          {passwordError && (
            <div style={{ color: "red" }}>
              The password you entered is incorrect. Please try again.
            </div>
          )}
        </>
      );
    }
    const getAuthorizationDescription = (): string => {
      if (!raceData.authorization) return "You are not logged in";
      let details = "";
      switch (raceData.authorization) {
        case "RACE_ADMIN":
          details = "This gives you all capabilities in Race Aide.";
          break;
        case "RACE_ASSISTANT":
          details =
            "This allows you to edit runner information and record runners at checkpoints.";
          break;
      }
      return `You are currently logged in as a ${
        RaceAuthorizationDescription[raceData.authorization]
      }. ${details}`;
    };
    return (
      <>
        <p style={{ marginBottom: 10 }}>
          <span>{getAuthorizationDescription()}</span>
          <button
            className="highlight-button"
            style={{ marginLeft: 10 }}
            onClick={() => {
              dispatch(setRacePassword());
            }}
          >
            Log Out
          </button>
        </p>
        {raceData.authorization === "RACE_ADMIN" && (
          <>
            <RaceDetailsForm
              isUpdate
              onClickSubmit={(race: Partial<FullRace>) => {
                if (saveInProgress) return;
                setSaveInProgress(true);
                dispatch(updateRaceDetails(race, raceData.password));
              }}
              defaultData={raceData.race}
            />
            {errorMessage && <p className="response-info">{errorMessage}</p>}
          </>
        )}
      </>
    );
  };

  return (
    <>
      <h1>Admin Tools</h1>
      {getMainContent()}
    </>
  );
}
