import { useState } from 'react'
import { parseImportText } from '../lib/importParser'

const PLACEHOLDER = `Category Name
  Item one x3 - optional note
  Item two
Another Category
  Item three x2`

export function ImportListModal({ listName, onImport, onCancel }) {
  const [text, setText] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const categories = parseImportText(text)
    if (categories.length === 0) return
    onImport(categories)
  }

  const preview = text.trim() ? parseImportText(text) : []
  const itemCount = preview.reduce((n, c) => n + c.items.length, 0)

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>Import into “{listName}”</h3>
        <p>
          One category per line, items indented below it. Add <code>x3</code> for quantity and{' '}
          <code> - note</code> for notes. New categories are added alongside what's already there.
        </p>

        <textarea
          className="import-textarea"
          autoFocus
          rows={10}
          placeholder={PLACEHOLDER}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {text.trim() && (
          <p className="import-preview">
            {itemCount === 0
              ? 'No items recognized yet.'
              : `Found ${preview.length} categor${preview.length === 1 ? 'y' : 'ies'}, ${itemCount} item${itemCount === 1 ? '' : 's'}.`}
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={itemCount === 0}>
            Add {itemCount > 0 ? itemCount : ''} item{itemCount === 1 ? '' : 's'}
          </button>
        </div>
      </form>
    </div>
  )
}
