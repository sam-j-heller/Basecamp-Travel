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
import { cloneCategoriesAsTemplate } from './tripModel'

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

export async function createTrip(uid, { name, startDate, endDate, themeColor, themeMotif }) {
  const ref = await addDoc(tripsCollection(uid), {
    name,
    startDate: startDate || null,
    endDate: endDate || null,
    themeColor: themeColor || '#3f6b52',
    themeMotif: themeMotif || 'mountain',
    categories: [],
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

export async function saveCategories(uid, tripId, categories) {
  await updateDoc(tripDoc(uid, tripId), { categories, updatedAt: serverTimestamp() })
}

export async function duplicateTrip(uid, tripId, newName) {
  const snap = await getDoc(tripDoc(uid, tripId))
  if (!snap.exists()) throw new Error('Trip not found')
  const original = snap.data()
  const ref = await addDoc(tripsCollection(uid), {
    name: newName,
    startDate: null,
    endDate: null,
    themeColor: original.themeColor || '#3f6b52',
    themeMotif: original.themeMotif || 'mountain',
    categories: cloneCategoriesAsTemplate(original.categories || []),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}
