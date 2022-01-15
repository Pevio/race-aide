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
  const { race } = useSelector((state: RootStore) => state.raceDetails);
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
            className={`sider-bar ${
              location.pathname === to ? "sider-bar-active" : ""
            }`}
          />
          <Link
            to={{ pathname: to, state: location.state }}
            className="highlight-button sider-link"
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
            fontSize: 40,
            marginLeft: 32,
            paddingTop: 20,
          }}
        >
          <Link
            to="/"
            className="highlight-button"
            style={{ fontSize: 40, marginTop: -4, minWidth: 50 }}
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
        {race && (
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
