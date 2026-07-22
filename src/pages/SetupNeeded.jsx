export function SetupNeeded() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Basecamp</h1>
        <p className="login-subtitle">Firebase isn't configured yet.</p>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Copy <code>.env.example</code> to <code>.env.local</code>, fill in your Firebase project's
          config values, and restart the dev server. See the README's "Firebase setup" section for
          step-by-step instructions.
        </p>
      </div>
    </div>
  )
}
