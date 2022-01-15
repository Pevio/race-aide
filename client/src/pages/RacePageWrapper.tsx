import React, { CSSProperties, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router";
import { Link, Redirect } from "react-router-dom";
import { getRaceDetails } from "../state/actions/RaceDetails";
import { RootStore } from "../state/store";

interface Props {
  children: React.ReactNode;
}

export function RacePageWrapper(props: Props) {
  const dispatch = useDispatch();
  const location = useLocation();
  const raceId = location.pathname.split("/")[1];
  const { race, loading } = useSelector(
    (state: RootStore) => state.raceDetails
  );
  const raceIsLoaded = race && race.raceId === raceId;
  const hasStarted = race && race.startTime < Date.now();
  useEffect(() => {
    if (!raceIsLoaded) dispatch(getRaceDetails(raceId));
  }, []);

  if (!raceId) {
    return <Redirect to="/" />;
  }

  const getSideMenuItem = (
    text: string,
    to: string,
    hr: boolean = true,
    style: CSSProperties = {}
  ) => {
    return (
      <>
        <div style={{ display: "flex", ...style }}>
          <div
            style={{
              width: 10,
              height: 45,
              backgroundColor: location.pathname === to ? "red" : "transparent",
            }}
          />
          <Link
            to={{ pathname: to, state: location.state }}
            className="sider-link highlight-button"
          >
            {text}
          </Link>
        </div>
        {hr && <hr />}
      </>
    );
  };

  return (
    <>
      <div className="header">
        <p
          style={{
            fontSize: 36,
            marginLeft: 32,
            paddingTop: 20,
          }}
        >
          <Link
            to="/"
            className="sider-link"
            style={{ fontSize: 36, marginTop: -4 }}
          >
            {"<"}
          </Link>
          <span style={{ marginLeft: 10 }}>
            {race?.raceName || "Race Aide"}
          </span>
          &nbsp;&nbsp;&nbsp;
          <span style={{ fontSize: 14 }}>{race?.city}</span>
        </p>
      </div>
      <div className="sider">
        {getSideMenuItem("Race Home", `/${raceId}`)}
        {!loading && (
          <>
            {getSideMenuItem(
              hasStarted ? "Results" : "Participants",
              `/${raceId}/${hasStarted ? "results" : "participants"}`
            )}
            {getSideMenuItem("Checkpoints", `/${raceId}/checkpoints`)}
            {getSideMenuItem("Race Admin", `/${raceId}/admin`, false)}
          </>
        )}
      </div>
      {raceIsLoaded && <div className="page">{props.children}</div>}
    </>
  );
}
