import { useEffect, useState } from 'react'
import {
  listenToSharedTrip,
  listenToItemStatus,
  listenToPersonalItems,
  mutateSharedTripListsTransaction,
  setItemStatus,
  mutatePersonalItemsTransaction,
  recordSharedTripVisit,
} from '../lib/sharedTripsApi'

const EMPTY_STATUS = { packedItemIds: [], ownedItemIds: [], buyItemIds: [] }

export function useSharedTrip(tripId, myUid) {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myStatus, setMyStatus] = useState(EMPTY_STATUS)
  const [ownerStatusRaw, setOwnerStatusRaw] = useState(EMPTY_STATUS)
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
    return listenToItemStatus(tripId, myUid, setMyStatus)
  }, [tripId, myUid])

  useEffect(() => {
    if (!tripId || !myUid) return
    return listenToPersonalItems(tripId, myUid, setPersonalItems)
  }, [tripId, myUid])

  const ownerUid = trip?.ownerUid
  const isOwner = Boolean(ownerUid) && ownerUid === myUid

  useEffect(() => {
    if (!tripId || !ownerUid || isOwner) return
    return listenToItemStatus(tripId, ownerUid, setOwnerStatusRaw)
  }, [tripId, ownerUid, isOwner])

  useEffect(() => {
    if (!tripId || !myUid || !trip) return
    recordSharedTripVisit(myUid, tripId, trip.name)
  }, [tripId, myUid, trip?.name])

  const ownerStatus = isOwner ? myStatus : ownerStatusRaw

  // Optimistically update the local view for instant feedback, but persist
  // via a transaction that re-applies transform to the CURRENT server data —
  // so a stale tab (e.g. a dev server left open) can't clobber a newer edit.
  function mutateStructure(transform) {
    if (!trip) return
    setTrip((current) => (current ? { ...current, lists: transform(current.lists) } : current))
    mutateSharedTripListsTransaction(tripId, (currentLists) => transform(currentLists))
  }

  function toggleMyStatus(field, itemId, value) {
    setItemStatus(tripId, myUid, field, itemId, value)
  }

  function mutatePersonalItems(listId, transform) {
    setPersonalItems((current) => ({ ...current, [listId]: transform(current[listId] || []) }))
    mutatePersonalItemsTransaction(tripId, myUid, listId, transform)
  }

  return {
    trip,
    loading,
    isOwner,
    myPacked: myStatus.packedItemIds,
    myOwned: myStatus.ownedItemIds,
    myBuy: myStatus.buyItemIds,
    ownerPacked: ownerStatus.packedItemIds,
    ownerOwned: ownerStatus.ownedItemIds,
    ownerBuy: ownerStatus.buyItemIds,
    personalItems,
    mutateStructure,
    toggleMyStatus,
    mutatePersonalItems,
  }
}
