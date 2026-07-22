import { useEffect, useState } from 'react'
import { listenToOwnedSharedTrips } from '../lib/sharedTripsApi'

export function useOwnedSharedTrips(uid) {
  const [sharedTrips, setSharedTrips] = useState([])

  useEffect(() => {
    if (!uid) return
    return listenToOwnedSharedTrips(uid, setSharedTrips)
  }, [uid])

  return sharedTrips
}
