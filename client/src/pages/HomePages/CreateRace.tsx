import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FullRace } from "../../types/generalTypes";
import { createRace } from "../../state/actions/RaceDetails";
import { RaceDetailsForm } from "../../components/RaceDetailsForm";
import { RootStore } from "../../state/store";
import { useHistory } from "react-router";

export function CreateRace() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { race, loading, success, errorResponse } = useSelector(
    (state: RootStore) => state.raceDetails
  );

  const onSubmit = (details: Partial<FullRace>) => {
    setErrorMessage("");
    setSubmitClicked(true);
    dispatch(createRace(details));
  };

  const [submitClicked, setSubmitClicked] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!loading && submitClicked) {
      if (success && race) {
        history.push(`/${race.raceId}`);
      } else {
        setErrorMessage(`The race was unable to be created. ${errorResponse || ""}`);
      }
    }
  }, [loading]);

  return (
    <>
      <h1>Create a New Race</h1>
      <RaceDetailsForm isUpdate={false} onClickSubmit={onSubmit} />
      {errorMessage && <p className="response-info">{errorMessage}</p>}
    </>
  );
}
