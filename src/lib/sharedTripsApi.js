import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore'
import { db } from '../firebase'

const STATUS_FIELD = { packed: 'packedItemIds', owned: 'ownedItemIds', buy: 'buyItemIds' }

function sharedTripsCollection() {
  return collection(db, 'sharedTrips')
}

function sharedTripDoc(tripId) {
  return doc(db, 'sharedTrips', tripId)
}

function itemStatusDoc(tripId, uid) {
  return doc(db, 'sharedTrips', tripId, 'packedStatus', uid)
}

function personalItemsDoc(tripId, uid) {
  return doc(db, 'sharedTrips', tripId, 'personalItems', uid)
}

function bookmarkDoc(uid, tripId) {
  return doc(db, 'users', uid, 'sharedTripBookmarks', tripId)
}

export async function createSharedTrip(
  ownerUid,
  { name, startDate, endDate, themeColor, themeMotif, headerImageUrl, lists }
) {
  const ref = await addDoc(sharedTripsCollection(), {
    name,
    startDate: startDate || null,
    endDate: endDate || null,
    themeColor: themeColor || '#c96f34',
    themeMotif: themeMotif || 'mountain',
    headerImageUrl: headerImageUrl || null,
    ownerUid,
    lists,
    guestEditableListIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export function listenToSharedTrip(tripId, onChange) {
  return onSnapshot(sharedTripDoc(tripId), (snap) => {
    onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export function listenToOwnedSharedTrips(uid, onChange) {
  const q = query(sharedTripsCollection(), where('ownerUid', '==', uid))
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function updateSharedTripLists(tripId, lists) {
  await updateDoc(sharedTripDoc(tripId), { lists, updatedAt: serverTimestamp() })
}

// Reads the CURRENT server value of `lists` and applies transform inside a
// transaction, so a stale tab can't clobber a newer edit made elsewhere
// (e.g. by a family member editing the same list moments apart).
export async function mutateSharedTripListsTransaction(tripId, transform) {
  const ref = sharedTripDoc(tripId)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    const currentLists = snap.data().lists || []
    tx.update(ref, { lists: transform(currentLists), updatedAt: serverTimestamp() })
  })
}

// Owner-only in practice (same rule as updateSharedTripLists) — name, dates,
// theme, header photo. Deliberately separate from the per-list guest-editing
// door: renaming/re-theming a trip is an owner action, not something a
// guest-editable list should imply.
export async function updateSharedTripMeta(tripId, patch) {
  await updateDoc(sharedTripDoc(tripId), { ...patch, updatedAt: serverTimestamp() })
}

// Admin-only in practice (enforced by firestore.rules, not just this call) —
// opens or closes structure-editing for one specific list, to anyone with
// the trip's link.
export async function setListGuestEditable(tripId, currentIds, listId, enabled) {
  const next = enabled ? [...new Set([...currentIds, listId])] : currentIds.filter((id) => id !== listId)
  await updateDoc(sharedTripDoc(tripId), { guestEditableListIds: next })
}

// Returns { packedItemIds, ownedItemIds, buyItemIds } (each defaulting to []).
export function listenToItemStatus(tripId, uid, onChange) {
  return onSnapshot(itemStatusDoc(tripId, uid), (snap) => {
    const data = snap.exists() ? snap.data() : {}
    onChange({
      packedItemIds: data.packedItemIds || [],
      ownedItemIds: data.ownedItemIds || [],
      buyItemIds: data.buyItemIds || [],
    })
  })
}

export async function initItemStatus(tripId, uid, { packedItemIds = [], ownedItemIds = [], buyItemIds = [] }) {
  await setDoc(itemStatusDoc(tripId, uid), { packedItemIds, ownedItemIds, buyItemIds })
}

// field is 'packed' | 'owned' | 'buy'.
export async function setItemStatus(tripId, uid, field, itemId, value) {
  const key = STATUS_FIELD[field]
  await setDoc(itemStatusDoc(tripId, uid), { [key]: value ? arrayUnion(itemId) : arrayRemove(itemId) }, { merge: true })
}

export function listenToPersonalItems(tripId, uid, onChange) {
  return onSnapshot(personalItemsDoc(tripId, uid), (snap) => {
    onChange(snap.exists() ? snap.data() : {})
  })
}

export async function savePersonalItems(tripId, uid, byListId) {
  await setDoc(personalItemsDoc(tripId, uid), byListId)
}

// Reads the CURRENT server value for this list's personal items and applies
// transform inside a transaction, same rationale as mutateSharedTripListsTransaction.
export async function mutatePersonalItemsTransaction(tripId, uid, listId, transform) {
  const ref = personalItemsDoc(tripId, uid)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const current = snap.exists() ? snap.data() : {}
    const currentItems = current[listId] || []
    tx.set(ref, { ...current, [listId]: transform(currentItems) })
  })
}

export async function getSharedTrip(tripId) {
  const snap = await getDoc(sharedTripDoc(tripId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// Records that this user has opened a shared trip, so their own dashboard/cart
// can find trips they don't own (owners already get theirs via listenToOwnedSharedTrips).
export async function recordSharedTripVisit(uid, tripId, tripName) {
  await setDoc(bookmarkDoc(uid, tripId), { tripId, tripName, visitedAt: serverTimestamp() })
}

export function listenToSharedTripBookmarks(uid, onChange) {
  const q = collection(db, 'users', uid, 'sharedTripBookmarks')
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => d.data()))
  })
}
