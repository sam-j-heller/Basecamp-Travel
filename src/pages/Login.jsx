import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { sendLoginLink, linkError } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    setError(null)
    try {
      await sendLoginLink(email.trim())
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
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
          <form onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Email</span>
              <input
                type="email"
                required
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary btn-block" disabled={sending}>
              {sending ? 'Sending link…' : 'Send sign-in link'}
            </button>
          </form>
        )}

        {(error || linkError) && <p className="login-error">{error || linkError}</p>}
      </div>
    </div>
  )
}
