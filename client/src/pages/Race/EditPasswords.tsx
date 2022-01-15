import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { Redirect, RouteComponentProps } from "react-router";
import { updateRacePasswords } from "../../state/actions/RaceDetails";

interface EditPasswordProps {
  raceId: string;
}

export function EditRacePasswords({
  match,
  history,
}: RouteComponentProps<EditPasswordProps>) {
  const dispatch = useDispatch()
  const { raceId } = match.params;

  const { race, password, loading, success, authorization } = useSelector(
    (state: RootStore) => state.raceDetails
  );

  const [submitClicked, setSubmitClicked] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [checkpointPassword, setCheckpointPassword] = useState<string>("");
  const [showPasswords, setShowPasswords] = useState<boolean>(false);
  const inputType = showPasswords ? "text" : "password";

  useEffect(() => {
    if (!loading && submitClicked) {
      if (success) {
        setErrorMessage("");
        setAdminPassword("")
        setCheckpointPassword("")
      } else {
        setErrorMessage("The checkpoint could not be saved.");
      }
      setSubmitClicked(false);
    }
  }, [loading]);

  if (!race) {
    return (
      <>
        <p>The race could not be loaded.</p>
      </>
    );
  }
  if (authorization !== "RACE_ADMIN") {
    return <Redirect to={`/${raceId}`} />
  }
  return (
    <>
      <h1>Edit Race Passwords</h1>
      <p>Enter your new passwords below.</p>
      <div>
        <p style={{ margin: 0 }}>
          Don't lose these passwords! You may not be able to get them back.
        </p>
        <div style={{ marginTop: 10 }}>
          <label htmlFor="admin-password">Admin Password</label>
          <input
            style={{ marginLeft: 10, width: 300 }}
            type={inputType}
            id="admin-password"
            value={adminPassword}
            onChange={(e) => {
              setAdminPassword(e.target.value);
            }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label htmlFor="checkpoint-password">Checkpoint Password</label>
          <input
            style={{ marginLeft: 10, width: 300 }}
            type={inputType}
            id="checkpoint-password"
            value={checkpointPassword}
            onChange={(e) => {
              setCheckpointPassword(e.target.value);
            }}
          />
        </div>
        <div style={{marginTop: 10}}>
          <input
            type="checkbox"
            id="show-passwords"
            onChange={(e) => setShowPasswords(e.target.checked)}
          />
          <label htmlFor="show-passwords">Show Passwords</label>
        </div>
      </div>
      <div style={{marginTop: 10}}>
        <button  className="clickable-button" onClick={() => {
          if (submitClicked) return
          dispatch(updateRacePasswords(raceId, password || "", adminPassword, checkpointPassword))
          setSubmitClicked(true);
        }}>Save Passwords</button>
      </div>
      <p>{errorMessage}</p>
    </>
  );
}
