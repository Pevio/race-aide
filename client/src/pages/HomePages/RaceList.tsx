import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getRaceList } from "../../state/actions/RaceList";
import { RootStore } from "../../state/store";
import DataTable from "react-data-table-component";
import { DateTime } from "luxon";
import { useHistory } from "react-router";

export function RaceList() {
  const dispatch = useDispatch();
  const history = useHistory();

  const [localTimeZone, setLocalTimeZone] = useState<boolean>(true);

  const { races } = useSelector((state: RootStore) => state.raceList);
  useEffect(() => {
    dispatch(getRaceList());
  }, []);

  return (
    <>
      <h1>Upcoming Races</h1>
      <div>
        <input
          type="radio"
          id="radio-timezone-local"
          checked={localTimeZone}
          onChange={() => setLocalTimeZone(true)}
        />
        <label htmlFor="radio-timezone-local">
          Display times in the race's local timezone
        </label>
        <input
          style={{ marginLeft: 32 }}
          type="radio"
          id="radio-timezone-my"
          checked={!localTimeZone}
          onChange={() => setLocalTimeZone(false)}
          value="Display times in my timezone"
        />
        <label htmlFor="radio-timezone-my">Display times in my timezone</label>
      </div>
      <DataTable
        columns={[
          {
            name: "Race Name",
            selector: (race) => race.raceName,
            sortable: true,
          },
          { name: "City", selector: (race) => race.city, sortable: true },
          {
            name: "Start Time",
            sortable: true,
            selector: (race) => {
              const start = DateTime.fromMillis(race.startTime);
              // My local time zone
              if (!localTimeZone) return start.toFormat("DD, hh:mm a");

              // The Race's local time zone
              return (
                start.setZone(race.timezone).toFormat("DD, hh:mm a") +
                " " +
                race.timezone
              );
            },
          },
        ]}
        data={races}
        keyField="raceId"
        responsive
        striped
        highlightOnHover
        pointerOnHover
        noDataComponent={<p>There are no races available.</p>}
        onRowClicked={(race) => history.push(`/${race.raceId}`)}
      />
    </>
  );
}
