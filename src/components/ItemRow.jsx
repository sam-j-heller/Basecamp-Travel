import { useState } from 'react'

export function ItemRow({ item, onToggle, onQuantityChange, onNotesChange, onRename, onDelete, onMoveUp, onMoveDown }) {
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
        <input type="checkbox" checked={item.packed} onChange={(e) => onToggle(e.target.checked)} />

        {editingName ? (
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
          <span className="item-name" onClick={() => setEditingName(true)}>
            {item.name}
          </span>
        )}

        <div className="quantity-stepper">
          <button type="button" onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}>
            −
          </button>
          <span>{item.quantity}</span>
          <button type="button" onClick={() => onQuantityChange(item.quantity + 1)}>
            +
          </button>
        </div>

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
      </div>

      {showNotes && (
        <input
          className="item-notes-input"
          placeholder="Notes…"
          value={item.notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      )}
    </li>
  )
}
