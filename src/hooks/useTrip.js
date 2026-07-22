import { useEffect, useState } from 'react'
import { listenToTrip, saveCategories } from '../lib/tripsApi'

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

  // Apply a local categories transform, optimistically update, then persist.
  function mutateCategories(transform) {
    setTrip((current) => {
      if (!current) return current
      const nextCategories = transform(current.categories || [])
      saveCategories(uid, tripId, nextCategories)
      return { ...current, categories: nextCategories }
    })
  }

  return { trip, loading, mutateCategories }
}
