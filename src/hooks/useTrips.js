import { useEffect, useState } from 'react'
import { listenToTrips } from '../lib/tripsApi'

export function useTrips(uid) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    setLoading(true)
    const unsubscribe = listenToTrips(uid, (data) => {
      setTrips(data)
      setLoading(false)
    })
    return unsubscribe
  }, [uid])

  return { trips, loading }
}
