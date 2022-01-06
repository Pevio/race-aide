import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { getRaceList } from "../../state/actions/RaceList"
import { RootStore } from "../../state/store"

export function RaceList() {
  const dispatch = useDispatch()

  const {races} = useSelector((state: RootStore) => state.raceList)

  useEffect(() => {
    dispatch(getRaceList())
  }, [])

  return (
    <div>
      {JSON.stringify(races)}
    </div>
  )
}