import { useState } from 'react'
import { ThemePicker } from './ThemePicker'

export function TripFormModal({ title, initial, submitLabel = 'Save', onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [startDate, setStartDate] = useState(initial?.startDate || '')
  const [endDate, setEndDate] = useState(initial?.endDate || '')
  const [themeMotif, setThemeMotif] = useState(initial?.themeMotif || 'mountain')
  const [themeColor, setThemeColor] = useState(initial?.themeColor || '#c96f34')
  const [headerImageUrl, setHeaderImageUrl] = useState(initial?.headerImageUrl || '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), startDate, endDate, themeMotif, themeColor, headerImageUrl: headerImageUrl.trim() })
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{title}</h3>

        <label className="field">
          <span className="field-label">Trip name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Galápagos & Peru"
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field-label">Start date</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">End date</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>

        <ThemePicker
          motif={themeMotif}
          color={themeColor}
          onMotifChange={setThemeMotif}
          onColorChange={setThemeColor}
        />

        <label className="field">
          <span className="field-label">Header photo URL (optional)</span>
          <input
            type="url"
            value={headerImageUrl}
            onChange={(e) => setHeaderImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
