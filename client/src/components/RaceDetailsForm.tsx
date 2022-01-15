import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import TimePicker from "@mui/lab/TimePicker";
import DatePicker from "@mui/lab/DatePicker";
import { Link } from "react-router-dom";
import { DateTime } from "luxon";
import { FullRace, RaceDetails } from "../types/generalTypes";
import { timezoneDescriptions } from "../util/timeUtils";

interface Props {
  isUpdate: boolean;
  onClickSubmit: (data: Partial<FullRace>) => void;
  defaultData?: Partial<FullRace>;
}

export function RaceDetailsForm(props: Props) {
  const getDefaultRaceDetails = (): Partial<FullRace> => ({
    ...props.defaultData,
    raceDetails: {
      distances: [],
      ...props.defaultData?.raceDetails,
    },
  });
  const [raceDetails, setRaceDetails] = useState<Partial<FullRace>>(
    getDefaultRaceDetails()
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [newDistanceValue, setNewDistanceValue] = useState<number>(0);
  const hasStarted =
    props.defaultData?.startTime && props.defaultData.startTime < Date.now();

  useEffect(() => {
    setRaceDetails(getDefaultRaceDetails());
    if (props.defaultData?.startTime && props.defaultData.timezone) {
      const date = DateTime.fromMillis(props.defaultData.startTime).setZone(
        props.defaultData.timezone
      );
      const jsDate = new Date();
      jsDate.setFullYear(date.get("year"));
      jsDate.setMonth(date.get("month") - 1);
      jsDate.setDate(date.get("day"));
      setStartDate(jsDate);

      const time = new Date();
      time.setHours(date.get("hour"), date.get("minute"), date.get("second"));
      setStartTime(time);
    } else {
      setStartDate(null);
      setStartTime(null);
    }
    setNewDistanceValue(0);
  }, [props.defaultData]);

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
                // @ts-ignore
                raceDetails: {
                  ...raceDetails.raceDetails,
                  [key]: e.target.value || "",
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
        {`${props.isUpdate ? "Update" : "Enter"} all of your race details below.${!props.isUpdate && " Everything except Race ID will be editable later."}`}
      </p>
      {getFormInputField("raceName", "Race Name")}
      {!props.isUpdate &&
        getFormInputField(
          "raceId",
          "Race ID",
          "This may only contain letters, numbers, hyphens, and underscores, like MyRace or awesome-marathon. Once the race is created, the ID cannot be edited!"
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
      {props.isUpdate ? (
        <p style={{ marginTop: 16 }}>
          If you forgot your passwords, you can{" "}
          <Link
            to={`/${raceDetails.raceId}/editpasswords`}
            className="highlight-button"
          >
            Change them now
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="container" style={{marginTop: 32}}>
            <h3>Security</h3>
            <p style={{ marginTop: 10, fontSize: 12 }}>
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
        </>
      )}
      {!hasStarted && (
        <div className="container" style={{marginTop: 32}}>
          <h3>Distances</h3>
          <p style={{ fontSize: 12 }}>
            For each race distance, add it here. Distances will always be in
            miles.
          </p>
          <div style={{ marginTop: 5, marginBottom: 5 }}>
            {raceDetails.raceDetails?.distances?.map(
              (distance: number, index: number) => (
                <React.Fragment key={distance}>
                  {`${distance} Mile${distance === 1 ? "" : "s"}`}
                  <button
                    className="highlight-button"
                    style={{
                      marginLeft: 2,
                      marginRight:
                        raceDetails.raceDetails?.distances &&
                        index !== raceDetails.raceDetails.distances.length - 1
                          ? 10
                          : 0,
                    }}
                    onClick={() => {
                      setRaceDetails({
                        ...raceDetails,
                        raceDetails: {
                          ...raceDetails.raceDetails,
                          distances:
                            raceDetails.raceDetails?.distances?.filter(
                              (oldDistance) => oldDistance !== distance
                            ) || [],
                        },
                      });
                    }}
                  >
                    remove
                  </button>
                </React.Fragment>
              )
            )}
          </div>
          <div>
            <span>Add New Distance:</span>
            <input
              style={{ marginLeft: 10 }}
              type="number"
              step="any"
              min={0}
              value={newDistanceValue}
              onChange={(e) => {
                const newDistance = Number.parseFloat(e.target.value);
                if (!newDistance) return;
                setNewDistanceValue(newDistance);
              }}
            />
            <button
              style={{ marginLeft: 10 }}
              className="highlight-button"
              onClick={() => {
                if (
                  !newDistanceValue ||
                  raceDetails.raceDetails?.distances.includes(
                    newDistanceValue
                  )
                )
                  return;
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
                setNewDistanceValue(0);
              }}
            >
              Add
            </button>
          </div>
        
        </div>
      )}
      <div className="container" style={{marginTop: 32}}>
        <h3>Extra Information</h3>
        <p style={{ margin: 0 }}>The following information is all optional:</p>
        {getFormInputField("website", "Website", undefined, true)}
        {getFormInputField(
          "registration",
          "Registration Link",
          undefined,
          true
        )}
        {getFormInputField("raceEmail", "Race Email Address", "", true)}
      </div>
      <div style={{ marginTop: 32 }}>
        <button onClick={onSubmit} className="clickable-button">
          {props.isUpdate ? "Save Race Details" : "Create Race!"}
        </button>
      </div>
    </>
  );
}
