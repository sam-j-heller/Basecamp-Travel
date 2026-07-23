export function ProgressBar({ packed, total, size = 'md', label = 'packed' }) {
  const pct = total > 0 ? Math.round((packed / total) * 100) : 0
  return (
    <div className={`progress progress-${size}`}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-label">
        {packed}/{total} {label}
      </span>
    </div>
  )
}
