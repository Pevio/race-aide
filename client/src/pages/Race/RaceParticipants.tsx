import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RouteComponentProps, useLocation } from "react-router";
import DataTable from "react-data-table-component";
import {
  CheckpointDistance,
  RaceDistance,
  Runner,
} from "../../types/generalTypes";
import {
  getRaceDetails,
} from "../../state/actions/RaceDetails";
import { displayTime, displayTimestamp } from "../../util/timeUtils";
import {
  getDistanceCheckpoints,
  raceHasStarted,
  runnerAtCheckpoint,
  runnerDistance,
} from "../../util/resultsUtils";
import { tableProps } from "../../util/table";

interface ParticipantsProps {
  raceId: string;
}

export function RaceParticipants({
  match,
  history,
}: RouteComponentProps<ParticipantsProps>) {
  const { raceId } = match.params;
  const dispatch = useDispatch();
  const location: any = useLocation();
  const { race, authorization, allResults } =
    useSelector((state: RootStore) => state.raceDetails);

  const hasStarted = raceHasStarted(race);
  useEffect(() => {
    if (hasStarted) dispatch(getRaceDetails(raceId));
  }, [hasStarted]);

  const hasWriteAccess =
    authorization === "RACE_ADMIN" || authorization === "RACE_ASSISTANT";
  const isAdmin = authorization === "RACE_ADMIN";

  const [selectedDistance, setSelectedDistanceState] = useState<
    number | undefined
  >(location.state?.selectedDistance);
  const [selectedDivision, setSelectedDivision] = useState<string | undefined>()
  const setSelectedDistance = (value: number | undefined) => {
    setSelectedDistanceState(value);
    history.replace(location.pathname, {
      ...location.state,
      selectedDistance: value,
    });
  };

  const checkpointInfo = getDistanceCheckpoints(race, selectedDistance);
  const allRunners: Runner[] = Object.values(race?.runners || []);
  const runnerArray: Runner[] = allRunners.filter(
      (runner: Runner) => {
        if (selectedDistance !== undefined && runner.distance !== selectedDistance) return false;
        if (selectedDivision && runner.division !== selectedDivision) return false;
        return true;
      }
    )

  const distanceStartTime = race?.raceDetails.distances.find(
    (dis) => dis.distance === selectedDistance
  )?.startTime
  return (
    <>
      <h1>{`Race ${hasStarted ? "Results" : "Participants"}`}</h1>
      <div style={{ position: "relative" }}>
        <span>Select a Distance:</span>
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              setSelectedDistance(undefined);
              return;
            }
            setSelectedDistance(Number.parseFloat(e.target.value));
          }}
          value={selectedDistance || "ALL"}
          style={{ marginLeft: 10 }}
        >
          <option key="none-selected" value="">Select a Distance</option>
          {race?.raceDetails?.distances?.map((distance: RaceDistance) => (
            <option key={distance.distance} value={String(distance.distance)}>
              {`${distance.distance} Miles`}
            </option>
          ))}
        </select>
        <button
          className="highlight-button"
          style={{ position: "absolute", right: 0 }}
          onClick={() => dispatch(getRaceDetails(raceId))}
        >
          {`Refresh ${hasStarted ? "Results" : "Participants"}`}
        </button>
      </div>
      {race?.raceDetails?.divisions && race?.raceDetails?.divisions?.length > 0 && <div style={{marginTop: 10}}>
        <span>Filter by Division:</span>
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              setSelectedDivision(undefined);
              return;
            }
            setSelectedDivision(e.target.value);
          }}
          value={selectedDivision}
          style={{ marginLeft: 10 }}
        >
          <option key="none-selected" value="">All Divisions</option>
          {race?.raceDetails?.divisions?.map((division: string) => (
            <option key={division} value={String(division)}>
              {division}
            </option>
          ))}
        </select>
      </div>}
      {selectedDistance !== undefined && (
        <p>
          {`Start time for the ${selectedDistance} mile race: ${displayTimestamp(
            distanceStartTime,
            race?.timezone,
            "hh:mm a"
          )}`}
        </p>
      )}
      {selectedDistance ? (
        <DataTable
          columns={
            hasStarted && selectedDistance
              ? [
                  {
                    name: "#",
                    selector: (runner, index) => {
                      if (index !== undefined) return String(index + 1);
                      return "";
                    },
                    id: "rank",
                    grow: 1,
                  },
                  {
                    name: "Runner Name",
                    selector: (runner) => runner.runnerName,
                    sortField: "runnerName",
                    sortable: true,
                    id: "name",
                    compact: true,
                    grow: 4,
                  },
                  {
                    name: "Bib Number",
                    selector: (runner) => runner.bibNumber,
                    sortFunction: (r1: Runner, r2: Runner) => {
                      const n1 = Number.parseFloat(r1.bibNumber);
                      const n2 = Number.parseFloat(r2.bibNumber);
                      if (!isNaN(n1) && !isNaN(n2)) return n1 - n2;
                      return r1.bibNumber.localeCompare(r2.bibNumber);
                    },
                    id: "bib",
                    compact: true,
                    grow: 2,
                  },
                  {
                    name: "Division",
                    selector: (runner) => runner.division,
                    id: "division",
                    compact: true,
                    grow: 2,
                    omit: !race?.raceDetails.divisions?.length || (selectedDivision !== undefined)
                  },
                  {
                    name: "Start Time Offset",
                    selector: (runner) =>
                      runner.offset ? displayTime(runner.offset) : "-",
                    id: "offset",
                    compact: true,
                    hide: 1000,
                    grow: 2,
                  },
                  ...checkpointInfo.map(
                    (info: CheckpointDistance, checkpointIndex: number) => ({
                      name: `${info.distance} Mile${
                        info.distance === 1 ? "" : "s"
                      }${
                        checkpointIndex === checkpointInfo.length - 1
                          ? " (End)"
                          : ""
                      }`,
                      selector: (runner: Runner) => {
                        if (!allResults || !race) return "";
                        const timestamp =
                          allResults[String(selectedDistance)].runners[
                            runner.bibNumber
                          ]?.checkpointInfo[checkpointIndex]?.timestamp;
                        if (!timestamp) return "";
                        return displayTime(
                          (timestamp - runner.offset * 1000 - (distanceStartTime || race.startTime)) /
                            1000,
                          true
                        );
                      },
                      sortFunction: (r1: Runner, r2: Runner) => {
                        if (!allResults) return 0;
                        const t1: number | undefined = runnerAtCheckpoint(
                          allResults[String(selectedDistance)].runners[
                            r1.bibNumber
                          ],
                          checkpointIndex
                        );
                        const t2: number | undefined = runnerAtCheckpoint(
                          allResults[String(selectedDistance)].runners[
                            r2.bibNumber
                          ],
                          checkpointIndex
                        );
                        if (t1 && !t2) return -1;
                        if (t2 && !t1) return 1;
                        if (t1 && t2) return t1 - t2;
                        return 0;
                      },
                      id: `checkpoint-${checkpointIndex}`,
                      compact: true,
                      grow: 2,
                    })
                  ),
                  {
                    name: "Distance",
                    selector: (runner: Runner) => {
                      if (!allResults) return "";
                      const runnerResults =
                        allResults[String(selectedDistance)].runners[
                          runner.bibNumber
                        ];
                      if (runnerResults?.dnf) return "DNF";
                      const distance = runnerDistance(runnerResults);
                      if (!distance.distance) return "";
                      if (distance.distance === runner.distance)
                        return "Finished";
                      return `${distance.distance} Mile${
                        distance.distance === 1 ? "" : "s"
                      }`;
                    },
                    sortFunction: (r1: Runner, r2: Runner) => {
                      if (!allResults) return 0;
                      const d1 = runnerDistance(
                        allResults[String(selectedDistance)].runners[
                          r1.bibNumber
                        ]
                      );
                      const d2 = runnerDistance(
                        allResults[String(selectedDistance)].runners[
                          r2.bibNumber
                        ]
                      );

                      const distanceDiff = d2.distance - d1.distance;
                      if (distanceDiff !== 0) return distanceDiff;
                      return d1.lastTime - d2.lastTime;
                    },
                    id: "distance",
                    compact: true,
                    grow: 3,
                  },
                ]
              : [
                  {
                    name: "Runner Name",
                    selector: (runner) => runner.runnerName,
                    id: "name",
                    grow: 3,
                  },
                  {
                    name: "Bib Number",
                    selector: (runner) => runner.bibNumber,
                    id: "bib",
                    compact: true,
                    grow: 2,
                  },
                  {
                    name: "Division",
                    selector: (runner) => runner.division,
                    id: "division",
                    compact: true,
                    grow: 2,
                    omit: !race?.raceDetails.divisions?.length || (selectedDivision !== undefined)
                  },
                  {
                    name: "Distance",
                    selector: (runner) => `${runner.distance} Miles`,
                    id: "distance",
                    compact: true,
                    grow: 2,
                  },
                  {
                    name: "Start Time Offset",
                    selector: (runner) =>
                      runner.offset ? displayTime(runner.offset) : "-",
                    id: "offset",
                    compact: true,
                    grow: 2,
                  },
                ]
          }
          data={runnerArray}
          {...tableProps}
          keyField="bibNumber"
          noDataComponent={<p>There are no runners for this distance yet.</p>}
          pointerOnHover={false}
          defaultSortFieldId={hasStarted ? "distance" : "name"}
        />
      ) : (
        <p>{`Select a distance to see ${
          hasStarted ? "results" : "participants"
        } for that race.`}</p>
      )}
      {hasWriteAccess && (
        <div style={{ marginTop: 32 }}>
          <Link
            className="highlight-button"
            to={`/${race?.raceId}/registration`}
          >
            Add or Edit Runner Information
          </Link>
          {isAdmin && (
            <>
              <br />
              <br />
              <Link
                className="highlight-button"
                to={`/${raceId}/manualeditentries`}
              >
                Manually Edit Checkpoint Entries
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
