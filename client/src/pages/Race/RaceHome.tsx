import { useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import DataTable from "react-data-table-component";
import { Runner } from "../../types/generalTypes";
import { RouteComponentProps } from "react-router";
import { tableProps } from "../../util/table";
import { raceHasStarted, runnerDistance } from "../../util/resultsUtils";
import { displayTime } from "../../util/timeUtils";

interface RaceHomeProps {
  raceId: string;
}

export function RaceHome({
  match,
  history,
}: RouteComponentProps<RaceHomeProps>) {
  const { race, loading, allResults } = useSelector(
    (state: RootStore) => state.raceDetails
  );
  const hasStarted = raceHasStarted(race)

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
            href={"//" + race?.raceDetails.website}
            target="_blank" // Open in new tab
            rel="noopener noreferrer" // For security
            className="highlight-button"
          >
            Race Website
          </a>
          <br />
          <br />
        </>
      )}
      {race.raceDetails.registration && (
        <>
          <a
            href={"//" + race?.raceDetails.registration}
            target="_blank" // Open in new tab
            rel="noopener noreferrer" // For security
            className="highlight-button"
          >
            Registration
          </a>
          <br />
          <br />
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
          {
            name: "Runner Name",
            selector: (runner: Runner) => runner.runnerName,
          },
          {
            name: "Bib Number",
            selector: (runner: Runner) => runner.bibNumber,
          },
          {
            name: "Distance Running",
            selector: (runner: Runner) =>
              `${runner.distance} Mile(${runner.distance === 1 ? "" : "s"})`,
          },
          {
            name: "Distance Covered",
            omit: !hasStarted,
            selector: (runner: Runner) => {
              if (!allResults) return "";
              const distance = runnerDistance(
                allResults[String(runner.distance)].runners[runner.bibNumber]
              );
              if (!distance) return "";
              const timeString = displayTime(
                (distance.lastTime - race.startTime) / 1000,
                true
              );
              return `${
                distance.distance === runner.distance
                  ? "Finished"
                  : `${distance.distance} Mile${
                      distance.distance === 1 ? "" : "s"
                    }`
              } in ${timeString}`;
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
