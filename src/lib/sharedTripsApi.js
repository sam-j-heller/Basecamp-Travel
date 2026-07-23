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

export async function createSharedTrip(ownerUid, { name, startDate, endDate, themeColor, themeMotif, lists }) {
  const ref = await addDoc(sharedTripsCollection(), {
    name,
    startDate: startDate || null,
    endDate: endDate || null,
    themeColor: themeColor || '#c96f34',
    themeMotif: themeMotif || 'mountain',
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
