import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { sendLoginLink, signInWithGoogle, getSignInMethods, signInWithPassword, linkError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleEmailSubmit(e) {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return
    setBusy(true)
    setError(null)
    try {
      if (needsPassword) {
        await signInWithPassword(trimmedEmail, password)
        return
      }
      const methods = await getSignInMethods(trimmedEmail)
      if (methods.includes('password')) {
        setNeedsPassword(true)
        return
      }
      await sendLoginLink(trimmedEmail)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogleClick() {
    setBusy(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Basecamp</h1>
        <p className="login-subtitle">Packing lists for your next trip.</p>

        {sent ? (
          <p className="login-sent">
            Check <strong>{email}</strong> for a sign-in link. You can close this tab.
          </p>
        ) : (
          <>
            <button type="button" className="btn btn-secondary btn-block" onClick={handleGoogleClick} disabled={busy}>
              Continue with Google
            </button>

            <div className="login-divider">or</div>

            <form onSubmit={handleEmailSubmit}>
              <label className="field">
                <span className="field-label">Email</span>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setNeedsPassword(false)
                  }}
                />
              </label>

              {needsPassword && (
                <label className="field">
                  <span className="field-label">Password</span>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
                {busy ? 'One moment…' : needsPassword ? 'Sign in' : 'Continue'}
              </button>
            </form>
          </>
        )}

        {(error || linkError) && <p className="login-error">{error || linkError}</p>}
      </div>
    </div>
  )
}
