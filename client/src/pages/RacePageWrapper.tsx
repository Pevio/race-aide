import { CSSProperties, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router";
import { Link, Redirect } from "react-router-dom";
import { getRaceDetails } from "../state/actions/RaceDetails";
import { RootStore } from "../state/store";

interface Props {
  children: React.ReactElement;
}

export function RacePageWrapper(props: Props) {
  const dispatch = useDispatch()
  const location = useLocation();
  const raceId = location.pathname.split("/")[1]
  const {race} = useSelector((state: RootStore) => state.raceDetails)
  const raceIsLoaded = race && race.raceId === raceId
  const hasStarted = race && race.startTime < Date.now();
  useEffect(() => {
    if (!raceIsLoaded) dispatch(getRaceDetails(raceId))
  }, [])

  if (!raceId) {
    return <Redirect to="/" />
  }
  
  const getSideMenuItem = (text: string, to: string, hr: boolean = true, style: CSSProperties = {}) => {
    return (
      <>
        <div style={{display: "flex", ...style}}>
          <div style={{width: 10, height: 40, backgroundColor: location.pathname === to ? "red" : "transparent"}}/>
          <Link to={to} className="sider-link">
            {text}
          </Link>
        </div>
        {hr && <hr />}
      </>
    )
  }

  return (
    <>
      <div className="header">
        <p style={{
          fontSize: 36, marginLeft: 50, paddingTop: 20
        }}>
          <Link to="/" className="sider-link">{"<"}</Link>
          {race?.raceName || "Race Aide"}
          &nbsp;&nbsp;&nbsp;
          <span style={{fontSize: 14}}>{race?.city}</span>
        </p>
        <Link to="/" className="sider-link">Choose a different Race from Race Aide</Link>
      </div>
      <div className="sider">
        {getSideMenuItem("Race Home", `/${raceId}`)}
        {getSideMenuItem(hasStarted ? "Results" : "Participants", `/${raceId}/${hasStarted ? "results" : "participants"}`)}
        {getSideMenuItem("Race Admin", `/${raceId}/admin`, false)}
      </div>
      {raceIsLoaded &&
        <div className="page">
          {props.children}
        </div>
      }
      
    </>
  )
}