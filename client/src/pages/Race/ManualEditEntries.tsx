import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "../../state/store";
import { Redirect, RouteComponentProps, useLocation } from "react-router";
import DataTable from "react-data-table-component";
import {
  getDistanceCheckpoints,
  raceHasStarted,
} from "../../util/resultsUtils";
import {
  Checkpoint,
  CheckpointDetails,
  CheckpointDistance,
  RaceDistance,
  RaceResult,
} from "../../types/generalTypes";
import { updateRaceCheckpoints } from "../../state/actions/RaceDetails";
import { displayTime } from "../../util/timeUtils";

interface CheckpointProps {
  raceId: string;
}

export function ManuelEditEntries({
  match,
  history,
}: RouteComponentProps<CheckpointProps>) {
  const { raceId } = match.params;
  const location: any = useLocation();
  const dispatch = useDispatch();
  const { race, authorization, password, loading, success, allResults } =
    useSelector((state: RootStore) => state.raceDetails);

  if (race && authorization !== "RACE_ADMIN") {
    return <Redirect to={`/${raceId}`} />;
  }

  return (
    <>
      <h1>Manually Edit Checkpoint Entries</h1>
      <p style={{ fontSize: 12 }}>
        If a volunteer misses a runner at a checkpoint, or enters the wrong bib
        number, use this page see reconcile issues and manually edit checkpoint
        information.
      </p>
    </>
  );
}
