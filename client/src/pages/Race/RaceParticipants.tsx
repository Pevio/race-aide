import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RacePageWrapper } from "../RacePageWrapper";
import DataTable from "react-data-table-component";
import { Runner } from "../../types/generalTypes";
import { updateRaceParticipants } from "../../state/actions/RaceDetails";
import { RouteComponentProps } from "react-router";

interface ParticipantsProps {
  raceId: string;
}

export function RaceParticipants({
  match,
  history,
}: RouteComponentProps<ParticipantsProps>) {
  const dispatch = useDispatch();
  const { raceId } = match.params;
  const { race, authorization, password } = useSelector(
    (state: RootStore) => state.raceDetails
  );
  const hasStarted = race && race.startTime < Date.now();
  const isAdmin = authorization === "RACE_ADMIN";

  const [selectedDistance, setSelectedDistance] = useState<number | undefined>(
    undefined
  );
  const allRunners: Runner[] = Object.values(race?.runners || []);
  const runnerArray: Runner[] = selectedDistance
    ? allRunners.filter(
        (runner: Runner) => runner.distance === selectedDistance
      )
    : allRunners;

  const [makingNewRunner, setMakingNewRunner] = useState<boolean>(true);
  const [runnerEditing, setRunnerEditing] = useState<Partial<Runner>>({});

  return (
    <RacePageWrapper>
      <h1>{`Race ${hasStarted ? "Results" : "Participants"}`}</h1>
      <div>
        <span>Distance:</span>
        <select
          onChange={(e) => {
            const value = e.target.value;
            if (value === "ALL") setSelectedDistance(undefined);
            setSelectedDistance(Number.parseInt(e.target.value));
          }}
          value={selectedDistance || "ALL"}
          style={{ minWidth: 200, marginLeft: 10 }}
        >
          {!hasStarted && <option value="ALL">Show All Distances</option>}
          {race?.raceDetails?.distances?.map((distance) => (
            <option key={distance} value={String(distance)}>
              {`${distance} Miles`}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        columns={
          hasStarted && selectedDistance
            ? []
            : [
                {
                  name: "Runner Name",
                  selector: (runner) => runner.runnerName,
                },
                {
                  name: "Bib Number",
                  selector: (runner) => runner.bibNumber,
                },
                {
                  name: "Distance",
                  selector: (runner) => `${runner.distance} Miles`,
                },
              ]
        }
        data={runnerArray}
        highlightOnHover
        responsive
        striped
        keyField="bibNumber"
        noDataComponent={<p>There are no runners in this race yet.</p>}
        onRowClicked={(row) => setRunnerEditing(row)}
      />
      {isAdmin && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", position: "relative" }}>
            <h2>{makingNewRunner ? "Edit Runner" : "Add Runner"}</h2>
            <button
              style={{ position: "absolute", right: 0 }}
              onClick={() => {
                setMakingNewRunner(true);
                setRunnerEditing({});
              }}
            >
              Add Runner
            </button>
          </div>
          <div style={{ marginTop: 10 }}>
            <span>Runner Name:</span>
            <input
              type="text"
              style={{ marginLeft: 10 }}
              value={runnerEditing.runnerName}
              onChange={(e) =>
                setRunnerEditing({
                  ...runnerEditing,
                  runnerName: e.target.value,
                })
              }
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <span>Bib Number:</span>
            {makingNewRunner ? (
              <input
                type="text"
                style={{ marginLeft: 10 }}
                value={runnerEditing.bibNumber}
                onChange={(e) =>
                  setRunnerEditing({
                    ...runnerEditing,
                    bibNumber: e.target.value,
                  })
                }
              />
            ) : (
              <span>{runnerEditing.bibNumber}</span>
            )}
          </div>
          <div style={{ marginTop: 10 }}>
            <span>Distance:</span>
            <select
              style={{ marginLeft: 10 }}
              value={runnerEditing.distance}
              onChange={(e) =>
                setRunnerEditing({
                  ...runnerEditing,
                  distance: Number.parseInt(e.target.value),
                })
              }
            >
              {race?.raceDetails?.distances?.map((distance) => (
                <option key={distance} value={String(distance)}>
                  {`${distance} Miles`}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 10 }}>
            <span>Start Offset (Seconds):</span>
            <input
              type="number"
              style={{ marginLeft: 10 }}
              value={runnerEditing.offset}
              onChange={(e) =>
                setRunnerEditing({
                  ...runnerEditing,
                  offset: Number.parseInt(e.target.value),
                })
              }
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => {
                if (
                  !runnerEditing.bibNumber ||
                  !runnerEditing.runnerName ||
                  !runnerEditing.distance ||
                  !race
                ) {
                  return;
                }
                const newRunners = { ...race?.runners };
                const enteredRunner: Runner = {
                  offset: 0,
                  ...runnerEditing,
                } as Runner;
                newRunners[enteredRunner.bibNumber] = enteredRunner;

                dispatch(updateRaceParticipants(race, newRunners, password));
              }}
            >
              Save Runner
            </button>
            {!makingNewRunner && <button>Delete Runner</button>}
          </div>
        </div>
      )}
    </RacePageWrapper>
  );
}
