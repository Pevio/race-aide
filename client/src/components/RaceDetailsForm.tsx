import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import TimePicker from "@mui/lab/TimePicker";
import DatePicker from "@mui/lab/DatePicker";
import { DateTime } from "luxon";
import { FullRace, RaceDetails } from "../types/generalTypes";
import { timezoneDescriptions } from "../util/timezones";

interface Props {
  isUpdate: boolean;
  onClickSubmit: (data: Partial<FullRace>) => void;
  defaultData?: Partial<FullRace>;
}

export function RaceDetailsForm(props: Props) {
  const [raceDetails, setRaceDetails] = useState<Partial<FullRace>>({
    raceDetails: {},
    ...props.defaultData,
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [newDistanceValue, setNewDistanceValue] = useState<number>(0);

  const getFormInputField = (
    key: keyof FullRace | keyof RaceDetails,
    description: string,
    additionalContent?: React.ReactNode,
    isSubDetail: boolean = false,
    type: string = "text"
  ) => {
    return (
      <div style={{ marginTop: 10 }}>
        <label htmlFor={key}>{`${description}:`}</label>
        <input
          style={{ marginLeft: 10, width: 300 }}
          type={type}
          id={key}
          // @ts-ignore
          value={isSubDetail ? raceDetails?.raceDetails[key] : raceDetails[key]}
          onChange={(e) => {
            if (isSubDetail) {
              setRaceDetails({
                ...raceDetails,
                raceDetails: {
                  ...raceDetails.raceDetails,
                  [key]: e.target.value,
                },
              });
            } else {
              setRaceDetails({
                ...raceDetails,
                [key]: e.target.value,
              });
            }
          }}
        />
        {additionalContent && (
          <p style={{ fontSize: 12 }}>{additionalContent}</p>
        )}
      </div>
    );
  };

  const onSubmit = () => {
    if (!startDate || !startTime) return;
    const timeObj = DateTime.now()
      .setZone(raceDetails.timezone)
      .set({
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1,
        day: startDate.getDate(),
        hour: startTime.getHours(),
        minute: startTime.getMinutes(),
      });
    const time = timeObj.toMillis();
    props.onClickSubmit({
      ...raceDetails,
      startTime: time,
    });
  };

  return (
    <>
      {props.isUpdate && <h2>Edit Race Details</h2>}
      <p>
        Enter all of your race details below. Everything except Race ID will be
        editable later.
      </p>
      {getFormInputField("raceName", "Race Name")}
      {!props.isUpdate &&
        getFormInputField(
          "raceId",
          "Race ID",
          "This may only contain letters, numbers, and some special characters, like MyRace or awesome-marathon. One the race is created, the ID cannot be edited!"
        )}
      {getFormInputField(
        "city",
        "City",
        "Use this format: City, State, Country"
      )}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div style={{ marginTop: 10, display: "flex" }}>
          <div style={{ marginRight: 5, paddingTop: 10 }}>Start Date:</div>
          <DatePicker
            value={startDate}
            onChange={(newValue) => {
              setStartDate(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
            className="datepicker"
          />
        </div>
        <div style={{ marginTop: 10, display: "flex" }}>
          <div style={{ marginRight: 5, paddingTop: 10 }}>Start Time:</div>
          <TimePicker
            value={startTime}
            onChange={(newValue) => {
              setStartTime(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
            minutesStep={1}
          />
        </div>
      </LocalizationProvider>
      <div style={{ marginTop: 10 }}>
        <label htmlFor="timezone">Timezone</label>
        <select
          style={{ marginLeft: 10 }}
          id="timezone"
          value={raceDetails.timezone}
          onChange={(e) =>
            setRaceDetails({
              ...raceDetails,
              timezone: e.target.value,
            })
          }
        >
          {Object.keys(timezoneDescriptions).map((timezone: string) => (
            <option key={timezone} value={timezone}>
              {timezoneDescriptions[timezone]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p style={{ marginTop: 32, fontSize: 16 }}>Security</p>
        <p style={{ margin: 0 }}>
          Don't lose these passwords! You may not be able to get them back.
        </p>
        {getFormInputField(
          "adminPassword",
          "Admin Password",
          "This is the password you will use to edit this race",
          false,
          "password"
        )}
        {getFormInputField(
          "checkpointPassword",
          "Checkpoint Password",
          "This is the password your assistants will use to enter checkpoint information",
          false,
          "password"
        )}
      </div>
      <div>
        <p style={{ marginTop: 32, fontSize: 16 }}>Extra Information</p>
        <p style={{ margin: 0 }}>The following information is all optional:</p>
        {getFormInputField("website", "Website", undefined, true)}
        {getFormInputField(
          "registration",
          "Registration Link",
          undefined,
          true
        )}
        {getFormInputField(
          "logoUrl",
          "Race Logo URL",
          "If you have a link to a logo for your race, include that here.",
          true
        )}

        <h3>Distances</h3>
        <p style={{ fontSize: 12 }}>
          For each race distance, add it here. Distances will always be in
          miles.
        </p>
        <div>
          {raceDetails.raceDetails?.distances?.map((distance: number) => (
            <React.Fragment key={distance}>
              {`${distance} Miles`}
              <button
                onClick={() => {
                  setRaceDetails({
                    ...raceDetails,
                    raceDetails: {
                      ...raceDetails.raceDetails,
                      distances: raceDetails.raceDetails?.distances?.filter(
                        (oldDistance) => oldDistance !== distance
                      ),
                    },
                  });
                }}
              >
                x
              </button>
            </React.Fragment>
          ))}
        </div>
        <div>
          <span>Add New Distance:</span>
          <input
            style={{ marginLeft: 10 }}
            type="number"
            step="any"
            min={0}
            value={newDistanceValue}
            onChange={(e) =>
              setNewDistanceValue(Number.parseFloat(e.target.value))
            }
          />
          <button
            style={{ marginLeft: 10 }}
            onClick={() => {
              const newDistances = [
                ...(raceDetails.raceDetails?.distances || []),
                newDistanceValue,
              ].sort((num1, num2) => num1 - num2);
              setRaceDetails({
                ...raceDetails,
                raceDetails: {
                  ...raceDetails.raceDetails,
                  distances: newDistances,
                },
              });
            }}
          >
            Add
          </button>
        </div>
        <h3>Checkpoints</h3>
        <p style={{ fontSize: 12 }}>
          Add all checkpoints here. Once the race begins, you will not be able
          to add or change any checkpoints.
        </p>
      </div>
      <div style={{ marginTop: 32 }}>
        <button onClick={onSubmit}>
          {props.isUpdate ? "Save Race Details" : "Create Race!"}
        </button>
      </div>
    </>
  );
}
