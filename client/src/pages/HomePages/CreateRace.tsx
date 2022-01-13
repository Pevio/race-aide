import React from "react";
import { useDispatch } from "react-redux";
import { HomePageWrapper } from "../HomePageWrapper";
import { FullRace } from "../../types/generalTypes";
import { createRace } from "../../state/actions/RaceDetails";
import { RaceDetailsForm } from "../../components/RaceDetailsForm";

export function CreateRace() {
  const dispatch = useDispatch();

  const onSubmit = (details: Partial<FullRace>) => {
    dispatch(
      createRace(details)
    );
  };

  return (
    <HomePageWrapper>
      <RaceDetailsForm
        isUpdate={false}
        onClickSubmit={onSubmit}
      />
    </HomePageWrapper>
  );
}
