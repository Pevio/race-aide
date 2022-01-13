import { useState } from "react";
import { useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RacePageWrapper } from "../RacePageWrapper";
import DataTable from "react-data-table-component";
import { Runner } from "../../types/generalTypes";

export function RaceParticipants() {
  const { race } = useSelector((state: RootStore) => state.raceDetails);
  const hasStarted = race && race.startTime < Date.now();

  const [selectedDistance, setSelectedDistance] = useState<number | undefined>(
    undefined
  );
  const allRunners: Runner[] = Object.values(race?.runners || []);
  const runnerArray: Runner[] = selectedDistance
    ? allRunners.filter(
        (runner: Runner) => runner.distance === selectedDistance
      )
    : allRunners;

  return (
    <RacePageWrapper>
      <h1>{`Race ${hasStarted ? "Results" : "Participants"}`}</h1>
      <div>
        <span>Distance:</span>
        <select
          onChange={(e) => {
            setSelectedDistance(Number.parseInt(e.target.value));
          }}
        >
          {race?.raceDetails?.distances?.map((distance) => (
            <option key={distance} value={distance}>
              {distance}
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
                  selector: (runner) =>
                    runner.distance || "Unknown",
                },
              ]
        }
        data={runnerArray}
        highlightOnHover
        responsive
        striped
        keyField="bibNumber"
        noDataComponent={<p>There are no runners in this race yet.</p>}
      />
    </RacePageWrapper>
  );
}
