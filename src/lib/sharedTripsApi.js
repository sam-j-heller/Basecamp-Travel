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

function sharedTripsCollection() {
  return collection(db, 'sharedTrips')
}

function sharedTripDoc(tripId) {
  return doc(db, 'sharedTrips', tripId)
}

function packedStatusDoc(tripId, uid) {
  return doc(db, 'sharedTrips', tripId, 'packedStatus', uid)
}

function personalItemsDoc(tripId, uid) {
  return doc(db, 'sharedTrips', tripId, 'personalItems', uid)
}

export async function createSharedTrip(ownerUid, { name, startDate, endDate, themeColor, themeMotif, lists }) {
  const ref = await addDoc(sharedTripsCollection(), {
    name,
    startDate: startDate || null,
    endDate: endDate || null,
    themeColor: themeColor || '#3f6b52',
    themeMotif: themeMotif || 'mountain',
    ownerUid,
    lists,
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

export function listenToPackedStatus(tripId, uid, onChange) {
  return onSnapshot(packedStatusDoc(tripId, uid), (snap) => {
    onChange(snap.exists() ? snap.data().packedItemIds || [] : [])
  })
}

export async function initPackedStatus(tripId, uid, packedItemIds) {
  await setDoc(packedStatusDoc(tripId, uid), { packedItemIds })
}

export async function setItemPacked(tripId, uid, itemId, packed) {
  await setDoc(
    packedStatusDoc(tripId, uid),
    { packedItemIds: packed ? arrayUnion(itemId) : arrayRemove(itemId) },
    { merge: true }
  )
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
