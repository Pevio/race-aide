import { useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import DataTable from "react-data-table-component";
import { RaceDistance, RaceResult, Runner } from "../../types/generalTypes";
import { RouteComponentProps } from "react-router";
import { tableProps } from "../../util/table";
import { raceHasStarted, runnerDistance } from "../../util/resultsUtils";
import { displayTime, displayTimestamp } from "../../util/timeUtils";
import { formatURL } from "../../util/generalUtils";
import { DateTime } from "luxon";

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
  const hasStarted = raceHasStarted(race);

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

  const getDistanceDisplay = (): string => {
    const distances = race.raceDetails.distances;
    let result = `Distance${distances.length === 1 ? "" : "s"}: `;
    distances.forEach((distance: RaceDistance, index) => {
      result += `${distance.distance} Mile${
        distance.distance === 1 ? "" : "s"
      } at ${displayTimestamp(distance.startTime, race.timezone, "hh:mm a")}`;
      if (index < distances.length - 1) result += ", ";
    });
    return result;
  };
  const getStartTimeDisplay = (): string => {
    const start = DateTime.fromMillis(race.startTime);
    const raceTime = start.setZone(race.timezone).toFormat("DD, hh:mm a");
    return `Start Time: ${raceTime} ${race.timezone}`;
  };

  return (
    <>
      <h1>{`${race.raceName} Race Home`}</h1>
      <p>{getDistanceDisplay()}</p>
      <p>{getStartTimeDisplay()}</p>
      {race.raceDetails.website && (
        <>
          <a
            href={formatURL(race.raceDetails.website)}
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
            href={formatURL(race.raceDetails.registration)}
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

      {runnerArray.length > 0 && (
        <DataTable
          columns={[
            {
              name: "Runner Name",
              selector: (runner: Runner) => runner.runnerName,
              grow: 3,
            },
            {
              name: "Bib Number",
              selector: (runner: Runner) => runner.bibNumber,
              compact: true,
              grow: 1,
            },
            {
              name: "Distance Running",
              selector: (runner: Runner) =>
                `${runner.distance} Mile${runner.distance === 1 ? "" : "s"}`,
              compact: true,
              grow: 1,
            },
            {
              name: "Distance Covered",
              omit: !hasStarted,
              selector: (runner: Runner) => {
                if (!allResults) return "";
                const runnerResult: RaceResult | undefined =
                  allResults[String(runner.distance)].runners[runner.bibNumber];
                if (runnerResult?.dnf) return "DNF";
                const distance = runnerDistance(runnerResult);
                if (!distance.distance) return "0 Miles";
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
              compact: true,
              grow: 2,
            },
          ]}
          data={runnerArray}
          {...tableProps}
          keyField="bibNumber"
          noDataComponent={<p>There are no runners in this race yet.</p>}
        />
      )}
    </>
  );
}
