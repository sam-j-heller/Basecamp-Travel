import { useEffect, useState } from 'react'
import { listenToTrip, mutateTripListsTransaction } from '../lib/tripsApi'
import { normalizeLists } from '../lib/tripModel'

export function useTrip(uid, tripId) {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid || !tripId) return
    setLoading(true)
    const unsubscribe = listenToTrip(uid, tripId, (data) => {
      setTrip(data)
      setLoading(false)
    })
    return unsubscribe
  }, [uid, tripId])

  // Optimistically update the local view for instant feedback, but persist
  // via a transaction that re-applies the same transform to the CURRENT
  // server data — so a stale tab can't clobber a newer edit made elsewhere.
  function mutateLists(transform) {
    setTrip((current) => {
      if (!current) return current
      return { ...current, lists: transform(normalizeLists(current)) }
    })
    mutateTripListsTransaction(uid, tripId, (currentLists) => transform(currentLists))
  }

  return { trip, loading, mutateLists }
}
