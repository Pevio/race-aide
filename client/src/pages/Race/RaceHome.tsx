import { useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RacePageWrapper } from "../RacePageWrapper";
import DataTable from "react-data-table-component";
import { Runner } from "../../types/generalTypes";

export function RaceHome() {
  const { race } = useSelector((state: RootStore) => state.raceDetails);
  const hasStarted = race && race.startTime < Date.now();

  const runnerArray: Runner[] = Object.values(race?.runners || []);
  return (
    <RacePageWrapper>
      <>
        <h1>{`${race?.raceName} Race Home`}</h1>
        <DataTable
          columns={[
            { name: "Runner Name", selector: (runner) => runner.runnerName },
            { name: "Bib Number", selector: (runner) => runner.bibNumber },
            {
              name: "Distance",
              selector: (runner) => runner.runnerDetails?.distance || "Unknown",
            },
            {
              name: "Time",
              omit: !hasStarted,
              selector: (runner) => {
                return "";
              },
            },
          ]}
          data={runnerArray}
          highlightOnHover
          responsive
          striped
          keyField="bibNumber"
          noDataComponent={<p>There are no runners in this race yet.</p>}
        />
      </>
    </RacePageWrapper>
  );
}
