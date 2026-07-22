import { useEffect, useState } from 'react'
import { listenToTrip, saveLists } from '../lib/tripsApi'
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

  // Apply a local lists transform, optimistically update, then persist.
  function mutateLists(transform) {
    setTrip((current) => {
      if (!current) return current
      const nextLists = transform(normalizeLists(current))
      saveLists(uid, tripId, nextLists)
      return { ...current, lists: nextLists }
    })
  }

  return { trip, loading, mutateLists }
}
