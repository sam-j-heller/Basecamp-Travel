import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '../firebase'

const EMAIL_STORAGE_KEY = 'trapp:emailForSignIn'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [linkError, setLinkError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function completeEmailLinkSignInIfPresent() {
      if (!isSignInWithEmailLink(auth, window.location.href)) return

      let email = window.localStorage.getItem(EMAIL_STORAGE_KEY)
      if (!email) {
        email = window.prompt('Confirm your email to finish signing in:')
      }

      if (!email) return

      try {
        await signInWithEmailLink(auth, email, window.location.href)
        window.localStorage.removeItem(EMAIL_STORAGE_KEY)
        // Strip the sign-in query params from the URL without a reload.
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split('?')[0])
      } catch (err) {
        if (!cancelled) setLinkError(err.message)
      }
    }

    completeEmailLinkSignInIfPresent()

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!cancelled) {
        setUser(firebaseUser)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  async function sendLoginLink(email) {
    const actionCodeSettings = {
      url: window.location.origin + window.location.pathname,
      handleCodeInApp: true,
    }
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    window.localStorage.setItem(EMAIL_STORAGE_KEY, email)
  }

  // If this email already has a password set (e.g. via "Set a password"), Google sign-in
  // would otherwise throw auth/account-exists-with-different-credential and create a
  // second, disconnected account. Detect that and link the Google credential onto the
  // existing account instead, so both methods always resolve to the same user.
  async function signInWithGoogle() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (err) {
      if (err.code !== 'auth/account-exists-with-different-credential') throw err

      const pendingCredential = GoogleAuthProvider.credentialFromError(err)
      const email = err.customData?.email
      const methods = email ? await fetchSignInMethodsForEmail(auth, email) : []

      if (!methods.includes('password')) throw err

      const password = window.prompt(
        `You already have a password set for ${email}. Enter it to link Google sign-in to that account:`
      )
      if (!password) throw err

      const result = await signInWithEmailAndPassword(auth, email, password)
      await linkWithCredential(result.user, pendingCredential)
    }
  }

  async function getSignInMethods(email) {
    return fetchSignInMethodsForEmail(auth, email)
  }

  async function signInWithPassword(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  // Adds a password credential to the currently signed-in account, so future
  // sign-ins can skip the email-link round trip.
  async function setAccountPassword(password) {
    if (!auth.currentUser) throw new Error('You need to be signed in first.')
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password)
    await linkWithCredential(auth.currentUser, credential)
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  const value = {
    user,
    loading,
    linkError,
    sendLoginLink,
    signInWithGoogle,
    getSignInMethods,
    signInWithPassword,
    setAccountPassword,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
