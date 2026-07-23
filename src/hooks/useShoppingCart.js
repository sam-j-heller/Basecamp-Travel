import { useEffect, useMemo, useState } from 'react'
import { useTrips } from './useTrips'
import { useOwnedSharedTrips } from './useOwnedSharedTrips'
import {
  listenToSharedTripBookmarks,
  listenToSharedTrip,
  listenToItemStatus,
  updateSharedTripLists,
  setItemStatus,
} from '../lib/sharedTripsApi'
import { saveLists } from '../lib/tripsApi'
import { normalizeLists, collectBuyItems, updateItemInLists, ownedPatch } from '../lib/tripModel'

// Aggregates every "buy" item across a user's private trips and shared trips
// (owned, or just visited as a guest) into one cart, grouped by trip.
export function useShoppingCart(uid) {
  const { trips: privateTrips } = useTrips(uid)
  const ownedSharedTrips = useOwnedSharedTrips(uid)
  const [bookmarks, setBookmarks] = useState([])
  const [guestTripDocs, setGuestTripDocs] = useState({})
  const [myStatusByTrip, setMyStatusByTrip] = useState({})

  useEffect(() => {
    if (!uid) return
    return listenToSharedTripBookmarks(uid, setBookmarks)
  }, [uid])

  const ownedIds = ownedSharedTrips.map((t) => t.id)
  const ownedIdsKey = ownedIds.join(',')
  const guestIds = bookmarks.map((b) => b.tripId).filter((id) => !ownedIds.includes(id))
  const guestIdsKey = guestIds.join(',')
  const allSharedIds = [...new Set([...ownedIds, ...guestIds])]
  const allSharedIdsKey = allSharedIds.join(',')

  useEffect(() => {
    const unsubs = guestIds.map((id) =>
      listenToSharedTrip(id, (t) => setGuestTripDocs((prev) => ({ ...prev, [id]: t })))
    )
    return () => unsubs.forEach((u) => u())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestIdsKey])

  useEffect(() => {
    if (!uid) return
    const unsubs = allSharedIds.map((id) =>
      listenToItemStatus(id, uid, (status) => setMyStatusByTrip((prev) => ({ ...prev, [id]: status })))
    )
    return () => unsubs.forEach((u) => u())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, allSharedIdsKey])

  function findSharedTrip(tripId) {
    return ownedIds.includes(tripId) ? ownedSharedTrips.find((t) => t.id === tripId) : guestTripDocs[tripId]
  }

  const groups = useMemo(() => {
    const result = []

    for (const trip of privateTrips) {
      const lists = normalizeLists(trip)
      const items = lists.flatMap((l) =>
        collectBuyItems(l.categories).map((item) => ({ ...item, tripId: trip.id, listId: l.id, tripKind: 'private' }))
      )
      if (items.length > 0) result.push({ tripId: trip.id, tripName: trip.name, kind: 'private', items })
    }

    for (const tripId of allSharedIds) {
      const trip = findSharedTrip(tripId)
      if (!trip) continue
      const isOwner = trip.ownerUid === uid
      const buyIds = new Set(myStatusByTrip[tripId]?.buyItemIds || [])
      const items = (trip.lists || []).flatMap((l) =>
        l.categories.flatMap((c) =>
          c.items
            .filter((i) => buyIds.has(i.id))
            .map((i) => ({
              ...i,
              categoryName: c.name,
              tripId,
              listId: l.id,
              categoryId: c.id,
              tripKind: 'shared',
              isOwner,
            }))
        )
      )
      if (items.length > 0) result.push({ tripId, tripName: trip.name, kind: 'shared', items })
    }

    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privateTrips, ownedIdsKey, allSharedIdsKey, guestTripDocs, myStatusByTrip, ownedSharedTrips, uid])

  const totalCount = groups.reduce((n, g) => n + g.items.length, 0)

  // Quantity is only editable for items you fully control (your private trip,
  // or a shared trip you own) — a guest's quantity is the owner's structure.
  async function updateQuantity(item, quantity) {
    if (item.tripKind === 'private') {
      const trip = privateTrips.find((t) => t.id === item.tripId)
      if (!trip) return
      const next = updateItemInLists(normalizeLists(trip), item.listId, item.categoryId, item.id, { quantity })
      await saveLists(uid, trip.id, next)
    } else if (item.isOwner) {
      const trip = findSharedTrip(item.tripId)
      if (!trip) return
      const next = updateItemInLists(trip.lists, item.listId, item.categoryId, item.id, { quantity })
      await updateSharedTripLists(trip.id, next)
    }
  }

  // Marks an item as acquired: owned=true, buy=false.
  async function markGotIt(item) {
    if (item.tripKind === 'private') {
      const trip = privateTrips.find((t) => t.id === item.tripId)
      if (!trip) return
      const next = updateItemInLists(normalizeLists(trip), item.listId, item.categoryId, item.id, ownedPatch(true))
      await saveLists(uid, trip.id, next)
    } else {
      await setItemStatus(item.tripId, uid, 'owned', item.id, true)
      await setItemStatus(item.tripId, uid, 'buy', item.id, false)
    }
  }

  return { groups, totalCount, updateQuantity, markGotIt }
}
