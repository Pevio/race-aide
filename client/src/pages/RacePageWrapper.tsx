import { useEffect } from "react";
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
  useEffect(() => {
    if (!raceIsLoaded) dispatch(getRaceDetails(raceId))
  }, [])

  if (!raceId) {
    return <Redirect to="/" />
  }
  
  return (
    <>
      <div className="header">
        
        <p style={{
          fontSize: 36, marginLeft: 50, paddingTop: 20
        }}>
          {race?.raceName || "Race Aide"}
        </p>
      </div>
      {raceIsLoaded &&
        <div className="page-race">
          <Link to="/">Choose a different Race from Race Aide</Link>
          {props.children}
        </div>
      }
      
    </>
  )
}