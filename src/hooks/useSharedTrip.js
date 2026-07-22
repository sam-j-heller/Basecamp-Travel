import { useEffect, useState } from 'react'
import {
  listenToSharedTrip,
  listenToPackedStatus,
  listenToPersonalItems,
  updateSharedTripLists,
  setItemPacked,
  savePersonalItems,
} from '../lib/sharedTripsApi'

export function useSharedTrip(tripId, myUid) {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myPacked, setMyPacked] = useState([])
  const [ownerPackedRaw, setOwnerPackedRaw] = useState([])
  const [personalItems, setPersonalItems] = useState({})

  useEffect(() => {
    if (!tripId) return
    setLoading(true)
    return listenToSharedTrip(tripId, (data) => {
      setTrip(data)
      setLoading(false)
    })
  }, [tripId])

  useEffect(() => {
    if (!tripId || !myUid) return
    return listenToPackedStatus(tripId, myUid, setMyPacked)
  }, [tripId, myUid])

  useEffect(() => {
    if (!tripId || !myUid) return
    return listenToPersonalItems(tripId, myUid, setPersonalItems)
  }, [tripId, myUid])

  const ownerUid = trip?.ownerUid
  const isOwner = Boolean(ownerUid) && ownerUid === myUid

  useEffect(() => {
    if (!tripId || !ownerUid || isOwner) return
    return listenToPackedStatus(tripId, ownerUid, setOwnerPackedRaw)
  }, [tripId, ownerUid, isOwner])

  const ownerPacked = isOwner ? myPacked : ownerPackedRaw

  function mutateStructure(transform) {
    if (!trip) return
    updateSharedTripLists(tripId, transform(trip.lists))
  }

  function toggleMyPacked(itemId, packed) {
    setItemPacked(tripId, myUid, itemId, packed)
  }

  function mutatePersonalItems(listId, transform) {
    const current = personalItems[listId] || []
    const next = { ...personalItems, [listId]: transform(current) }
    setPersonalItems(next)
    savePersonalItems(tripId, myUid, next)
  }

  return {
    trip,
    loading,
    isOwner,
    myPacked,
    ownerPacked,
    personalItems,
    mutateStructure,
    toggleMyPacked,
    mutatePersonalItems,
  }
}
