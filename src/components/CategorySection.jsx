import { useState } from 'react'
import { ItemRow } from './ItemRow'
import { ProgressBar } from './ProgressBar'
import { categoryProgress } from '../lib/tripModel'

export function CategorySection({
  category,
  isFirst,
  isLast,
  onRenameCategory,
  onDeleteCategory,
  onMoveCategoryUp,
  onMoveCategoryDown,
  onAddItem,
  onToggleItem,
  onItemQuantityChange,
  onItemNotesChange,
  onRenameItem,
  onDeleteItem,
  onMoveItemUp,
  onMoveItemDown,
}) {
  const [newItemName, setNewItemName] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(category.name)
  const { packed, total } = categoryProgress(category)

  function commitTitle() {
    setEditingTitle(false)
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== category.name) onRenameCategory(trimmed)
    else setTitleDraft(category.name)
  }

  function handleAddItem(e) {
    e.preventDefault()
    const trimmed = newItemName.trim()
    if (!trimmed) return
    onAddItem(trimmed)
    setNewItemName('')
  }

  return (
    <section className="category-section">
      <header className="category-header">
        {editingTitle ? (
          <input
            className="category-title-input"
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle()
              if (e.key === 'Escape') {
                setTitleDraft(category.name)
                setEditingTitle(false)
              }
            }}
          />
        ) : (
          <h2 onClick={() => setEditingTitle(true)}>{category.name}</h2>
        )}

        <div className="category-header-actions">
          <button className="icon-btn" title="Move up" disabled={isFirst} onClick={onMoveCategoryUp}>
            ↑
          </button>
          <button className="icon-btn" title="Move down" disabled={isLast} onClick={onMoveCategoryDown}>
            ↓
          </button>
          <button className="icon-btn icon-btn-danger" title="Delete category" onClick={onDeleteCategory}>
            🗑
          </button>
        </div>
      </header>

      <ProgressBar packed={packed} total={total} size="sm" />

      <ul className="item-list">
        {category.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onToggle={(checked) => onToggleItem(item.id, checked)}
            onQuantityChange={(q) => onItemQuantityChange(item.id, q)}
            onNotesChange={(notes) => onItemNotesChange(item.id, notes)}
            onRename={(name) => onRenameItem(item.id, name)}
            onDelete={() => onDeleteItem(item.id)}
            onMoveUp={() => onMoveItemUp(item.id)}
            onMoveDown={() => onMoveItemDown(item.id)}
          />
        ))}
      </ul>

      <form className="add-item-form" onSubmit={handleAddItem}>
        <input
          placeholder="Add item…"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          Add
        </button>
      </form>
    </section>
  )
}
