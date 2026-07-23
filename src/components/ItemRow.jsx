import { useState } from 'react'

function StatusCheck({ label, checked, onToggle }) {
  return (
    <label className="status-check">
      <span className="status-check-label">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={!onToggle}
        onChange={onToggle ? (e) => onToggle(e.target.checked) : undefined}
      />
    </label>
  )
}

export function ItemRow({
  item,
  onTogglePacked,
  onToggleOwned,
  onToggleBuy,
  onQuantityChange,
  onNotesChange,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
  readOnly = false,
}) {
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(item.name)
  const [showNotes, setShowNotes] = useState(Boolean(item.notes))

  function commitName() {
    setEditingName(false)
    const trimmed = nameDraft.trim()
    if (trimmed && trimmed !== item.name) onRename(trimmed)
    else setNameDraft(item.name)
  }

  return (
    <li className={`item-row ${item.packed ? 'packed' : ''}`}>
      <div className="item-row-main">
        <div className="status-checks">
          <StatusCheck label="Own" checked={item.owned} onToggle={onToggleOwned} />
          <StatusCheck label="Buy" checked={item.buy} onToggle={onToggleBuy} />
          <StatusCheck label="Packed" checked={item.packed} onToggle={onTogglePacked} />
        </div>

        {!readOnly && editingName ? (
          <input
            className="item-name-input"
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitName()
              if (e.key === 'Escape') {
                setNameDraft(item.name)
                setEditingName(false)
              }
            }}
          />
        ) : (
          <span className="item-name" onClick={readOnly ? undefined : () => setEditingName(true)}>
            {item.name}
          </span>
        )}

        {readOnly ? (
          <span className="quantity-static">×{item.quantity}</span>
        ) : (
          <div className="quantity-stepper">
            <button type="button" onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}>
              −
            </button>
            <span>{item.quantity}</span>
            <button type="button" onClick={() => onQuantityChange(item.quantity + 1)}>
              +
            </button>
          </div>
        )}

        {!readOnly && (
          <>
            <button className="icon-btn" title="Notes" onClick={() => setShowNotes((s) => !s)}>
              {item.notes ? '📝' : '＋📝'}
            </button>
            <button className="icon-btn" title="Move up" onClick={onMoveUp}>
              ↑
            </button>
            <button className="icon-btn" title="Move down" onClick={onMoveDown}>
              ↓
            </button>
            <button className="icon-btn icon-btn-danger" title="Delete item" onClick={onDelete}>
              ✕
            </button>
          </>
        )}
      </div>

      {!readOnly && showNotes && (
        <input
          className="item-notes-input"
          placeholder="Notes…"
          value={item.notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      )}
      {readOnly && item.notes && <p className="item-notes-readonly">{item.notes}</p>}
    </li>
  )
}
