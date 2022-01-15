import { useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import DataTable from "react-data-table-component";
import { Runner } from "../../types/generalTypes";
import { RouteComponentProps } from "react-router";
import { tableProps } from "../../util/table";

interface RaceHomeProps {
  raceId: string;
}

export function RaceHome({
  match,
  history,
}: RouteComponentProps<RaceHomeProps>) {
  const { race, loading } = useSelector(
    (state: RootStore) => state.raceDetails
  );
  const hasStarted = race && race.startTime < Date.now();

  if (loading) {
    return (
      <>
        <p>Race Loading...</p>
      </>
    );
  }
  if (!race) {
    return (
      <>
        <p>The race could not be loaded</p>
      </>
    );
  }
  const runnerArray: Runner[] = Object.values(race?.runners || []);
  return (
    <>
      <h1>{`${race.raceName} Race Home`}</h1>
      {race.raceDetails.website && (
        <>
          <a
            href={race?.raceDetails.website}
            target="_blank" // Open in new tab
            rel="noopener noreferrer" // For security
            className="highlight-button"
          >
            Race Website
          </a>
          <br /><br />
        </>
      )}
      {race.raceDetails.registration && (
        <>
          <a
            href={race?.raceDetails.registration}
            target="_blank" // Open in new tab
            rel="noopener noreferrer" // For security
            className="highlight-button"
          >
            Registration
          </a>
          <br /><br />
        </>
      )}
      {race.raceDetails.raceEmail && (
        <>
          <a
            href={`mailto:${race?.raceDetails.raceEmail}`}
            target="_blank" // Open in new tab
            rel="noopener noreferrer" // For security
            className="highlight-button"
          >
            Race Email
          </a>
          <br />
        </>
      )}

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
        {...tableProps}
        keyField="bibNumber"
        noDataComponent={<p>There are no runners in this race yet.</p>}
      />
    </>
  );
}
