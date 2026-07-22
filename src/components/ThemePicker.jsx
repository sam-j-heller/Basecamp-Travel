export const MOTIFS = [
  { id: 'mountain', label: 'Mountain' },
  { id: 'jungle', label: 'Jungle' },
  { id: 'desert', label: 'Desert' },
]

export const COLOR_SWATCHES = ['#3f6b52', '#a05c3b', '#2f6f70', '#c98a3a', '#5a4a7a', '#4a5d8a']

export function ThemePicker({ motif, color, onMotifChange, onColorChange }) {
  return (
    <div className="theme-picker">
      <div className="theme-picker-row">
        <span className="field-label">Motif</span>
        <div className="motif-options">
          {MOTIFS.map((m) => (
            <button
              type="button"
              key={m.id}
              className={`motif-chip motif-${m.id} ${motif === m.id ? 'selected' : ''}`}
              onClick={() => onMotifChange(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="theme-picker-row">
        <span className="field-label">Color</span>
        <div className="color-swatches">
          {COLOR_SWATCHES.map((c) => (
            <button
              type="button"
              key={c}
              className={`swatch ${color === c ? 'selected' : ''}`}
              style={{ background: c }}
              onClick={() => onColorChange(c)}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
