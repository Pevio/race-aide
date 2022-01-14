import { useState } from "react";
import { useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RacePageWrapper } from "../RacePageWrapper";
import { RouteComponentProps } from "react-router";

interface EditPasswordProps {
  raceId: string;
}

export function EditRacePasswords({ match, history }: RouteComponentProps<EditPasswordProps>) {
  const { race, password } = useSelector((state: RootStore) => state.raceDetails);

  const [adminPassword, setAdminPassword] = useState<string>(password || "")
  const [assistantPassword, setAssistantPassword] = useState<string>("")
  const [showPasswords, setShowPasswords] = useState<boolean>(false);
  const inputType = showPasswords ? "text" : "password"

  if (!race) {
    return <RacePageWrapper>
      <p>The race could not be loaded</p>
    </RacePageWrapper>
  }
  
  return (
    <RacePageWrapper>
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
              setAdminPassword(e.target.value)
            }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label htmlFor="assistant-password">Assistant Password</label>
          <input
            style={{ marginLeft: 10, width: 300 }}
            type={inputType}
            id="assistant-password"
            value={assistantPassword}
            onChange={(e) => {
              setAssistantPassword(e.target.value)
            }}
          />
        </div>
        <input type="checkbox" onChange={(e) => setShowPasswords(e.target.checked)}>Show Passwords</input>
      </div>
      <div>
        <button
          onClick={() => {

          }}
        >
          Save Passwords
        </button>
      </div>
    </RacePageWrapper>
  );
}
