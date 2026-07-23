import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { makeList, normalizeLists, cloneListsAsTemplate } from './tripModel'

function tripsCollection(uid) {
  return collection(db, 'users', uid, 'trips')
}

function tripDoc(uid, tripId) {
  return doc(db, 'users', uid, 'trips', tripId)
}

export function listenToTrips(uid, onChange) {
  const q = query(tripsCollection(uid), orderBy('updatedAt', 'desc'))
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function listenToTrip(uid, tripId, onChange) {
  return onSnapshot(tripDoc(uid, tripId), (snap) => {
    onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export async function createTrip(uid, { name, startDate, endDate, themeColor, themeMotif, headerImageUrl }) {
  const ref = await addDoc(tripsCollection(uid), {
    name,
    startDate: startDate || null,
    endDate: endDate || null,
    themeColor: themeColor || '#c96f34',
    themeMotif: themeMotif || 'mountain',
    headerImageUrl: headerImageUrl || null,
    lists: [makeList('Recommended'), makeList('Follow along with Sam')],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTripMeta(uid, tripId, patch) {
  await updateDoc(tripDoc(uid, tripId), { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteTrip(uid, tripId) {
  await deleteDoc(tripDoc(uid, tripId))
}

export async function saveLists(uid, tripId, lists) {
  await updateDoc(tripDoc(uid, tripId), { lists, updatedAt: serverTimestamp() })
}

export async function duplicateTrip(uid, tripId, newName) {
  const snap = await getDoc(tripDoc(uid, tripId))
  if (!snap.exists()) throw new Error('Trip not found')
  const original = snap.data()
  const ref = await addDoc(tripsCollection(uid), {
    name: newName,
    startDate: null,
    endDate: null,
    themeColor: original.themeColor || '#c96f34',
    themeMotif: original.themeMotif || 'mountain',
    headerImageUrl: original.headerImageUrl || null,
    lists: cloneListsAsTemplate(normalizeLists(original)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}
