import { Link } from 'react-router-dom'
import { ProgressBar } from './ProgressBar'
import { allListsProgress, normalizeLists } from '../lib/tripModel'

function formatDateRange(start, end) {
  if (!start && !end) return null
  const opts = { month: 'short', day: 'numeric' }
  const startLabel = start ? new Date(start + 'T00:00:00').toLocaleDateString(undefined, opts) : null
  const endLabel = end ? new Date(end + 'T00:00:00').toLocaleDateString(undefined, opts) : null
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`
  return startLabel || endLabel
}

export function TripCard({ trip, onRename, onDuplicate, onDelete }) {
  const { packed, total } = allListsProgress(normalizeLists(trip))
  const dateLabel = formatDateRange(trip.startDate, trip.endDate)

  return (
    <div className={`trip-card motif-${trip.themeMotif || 'mountain'}`} style={{ '--trip-color': trip.themeColor }}>
      <Link to={`/trip/${trip.id}`} className="trip-card-link">
        <div className="trip-card-header">
          <h3>{trip.name}</h3>
          {dateLabel && <span className="trip-dates">{dateLabel}</span>}
        </div>
        <ProgressBar packed={packed} total={total} />
      </Link>
      <div className="trip-card-actions">
        <button className="icon-btn" title="Rename" onClick={() => onRename(trip)}>
          ✎
        </button>
        <button className="icon-btn" title="Duplicate" onClick={() => onDuplicate(trip)}>
          ⎘
        </button>
        <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => onDelete(trip)}>
          🗑
        </button>
      </div>
    </div>
  )
}
