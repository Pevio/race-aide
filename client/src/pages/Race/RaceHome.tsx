import { useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { RacePageWrapper } from "../RacePageWrapper";
import DataTable from "react-data-table-component";
import { Runner } from "../../types/generalTypes";
import { RouteComponentProps } from "react-router";

interface RaceHomeProps {
  raceId: string;
}

export function RaceHome({ match, history }: RouteComponentProps<RaceHomeProps>) {
  const { race, loading } = useSelector((state: RootStore) => state.raceDetails);
  const hasStarted = race && race.startTime < Date.now();

  if (loading) {
    return <RacePageWrapper>
      <p>Race Loading...</p>
    </RacePageWrapper>
  }
  if (!race) {
    return <RacePageWrapper>
      <p>The race could not be loaded</p>
    </RacePageWrapper>
  }
  const runnerArray: Runner[] = Object.values(race?.runners || []);
  return (
    <RacePageWrapper>
      <h1>{`${race.raceName} Race Home`}</h1>
      {race.raceDetails.website &&
        <>
          <a
            href={race?.raceDetails.website}
            target="_blank" // Open in new tab
            rel="noopener noreferrer" // For security
          >
            Race Website
          </a>
          <br/>
        </>
      }
      {race.raceDetails.registration &&
        <>
          <a
            href={race?.raceDetails.registration}
            target="_blank" // Open in new tab
            rel="noopener noreferrer" // For security
          >
            Registration
          </a>
          <br/>
        </>
      }
      
      <DataTable
        columns={[
          { name: "Runner Name", selector: (runner) => runner.runnerName },
          { name: "Bib Number", selector: (runner) => runner.bibNumber },
          {
            name: "Distance",
            selector: (runner) => runner.distance || "Unknown",
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
    </RacePageWrapper>
  );
}
