import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTrip } from '../hooks/useTrip'
import { CategorySection } from '../components/CategorySection'
import { ProgressBar } from '../components/ProgressBar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { StickFigureWave } from '../components/StickFigureWave'
import {
  addCategory,
  renameCategory,
  deleteCategory,
  moveCategory,
  addItem,
  updateItem,
  deleteItem,
  moveItem,
  makeItem,
  tripProgress,
  normalizeLists,
  addList,
  renameList,
  deleteList,
} from '../lib/tripModel'

export function TripPage() {
  const { tripId } = useParams()
  const { user } = useAuth()
  const { trip, loading, mutateLists } = useTrip(user.uid, tripId)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [activeListId, setActiveListId] = useState(null)
  const [addingList, setAddingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [editingListName, setEditingListName] = useState(false)
  const [listNameDraft, setListNameDraft] = useState('')
  const [confirmDeleteList, setConfirmDeleteList] = useState(false)

  if (loading) return <p className="dashboard-empty">Loading trip…</p>
  if (!trip) return <p className="dashboard-empty">Trip not found.</p>

  const lists = normalizeLists(trip)
  const activeList = lists.find((l) => l.id === activeListId) || lists[0]
  const categories = activeList.categories
  const { packed, total } = tripProgress(categories)

  const samList = lists.find((l) => l.name === 'Follow along with Sam')
  const showSamBanner =
    samList && activeList.id !== samList.id && total > 0 && packed / total < 0.5

  function mutateActiveListCategories(transform) {
    mutateLists((currentLists) =>
      currentLists.map((l) => (l.id === activeList.id ? { ...l, categories: transform(l.categories) } : l))
    )
  }

  function handleAddCategory(e) {
    e.preventDefault()
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    mutateActiveListCategories((cats) => addCategory(cats, trimmed))
    setNewCategoryName('')
  }

  function handleAddList(e) {
    e.preventDefault()
    const trimmed = newListName.trim()
    if (!trimmed) return
    mutateLists((currentLists) => addList(currentLists, trimmed))
    setNewListName('')
    setAddingList(false)
  }

  function commitListRename() {
    const trimmed = listNameDraft.trim()
    setEditingListName(false)
    if (trimmed && trimmed !== activeList.name) {
      mutateLists((currentLists) => renameList(currentLists, activeList.id, trimmed))
    }
  }

  function handleDeleteList() {
    mutateLists((currentLists) => deleteList(currentLists, activeList.id))
    setActiveListId(null)
    setConfirmDeleteList(false)
  }

  return (
    <div className={`trip-page motif-${trip.themeMotif || 'mountain'}`} style={{ '--trip-color': trip.themeColor }}>
      <header className="trip-page-header">
        <Link to="/" className="back-link">
          ← All trips
        </Link>
        <h1>{trip.name}</h1>
        <ProgressBar packed={packed} total={total} size="lg" />
      </header>

      <div className="list-tabs">
        {lists.map((list) => (
          <button
            key={list.id}
            className={`list-tab ${list.id === activeList.id ? 'active' : ''}`}
            onClick={() => setActiveListId(list.id)}
          >
            {list.name}
          </button>
        ))}
        {addingList ? (
          <form className="list-tab-add-form" onSubmit={handleAddList}>
            <input
              autoFocus
              placeholder="List name…"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onBlur={() => !newListName.trim() && setAddingList(false)}
            />
          </form>
        ) : (
          <button className="list-tab list-tab-add" onClick={() => setAddingList(true)}>
            + New list
          </button>
        )}
      </div>

      <div className="list-toolbar">
        {editingListName ? (
          <input
            className="category-title-input"
            autoFocus
            value={listNameDraft}
            onChange={(e) => setListNameDraft(e.target.value)}
            onBlur={commitListRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitListRename()
              if (e.key === 'Escape') setEditingListName(false)
            }}
          />
        ) : (
          <button
            className="icon-btn"
            title="Rename list"
            onClick={() => {
              setListNameDraft(activeList.name)
              setEditingListName(true)
            }}
          >
            ✎ Rename list
          </button>
        )}
        {lists.length > 1 && (
          <button className="icon-btn icon-btn-danger" title="Delete list" onClick={() => setConfirmDeleteList(true)}>
            🗑 Delete list
          </button>
        )}
      </div>

      {showSamBanner && (
        <div className="sam-banner">
          <StickFigureWave />
          <span>Sam is outpacing you!</span>
        </div>
      )}

      <div className="category-list">
        {categories.map((category, i) => (
          <CategorySection
            key={category.id}
            category={category}
            isFirst={i === 0}
            isLast={i === categories.length - 1}
            onRenameCategory={(name) => mutateActiveListCategories((cats) => renameCategory(cats, category.id, name))}
            onDeleteCategory={() => mutateActiveListCategories((cats) => deleteCategory(cats, category.id))}
            onMoveCategoryUp={() => mutateActiveListCategories((cats) => moveCategory(cats, category.id, -1))}
            onMoveCategoryDown={() => mutateActiveListCategories((cats) => moveCategory(cats, category.id, 1))}
            onAddItem={(name) => mutateActiveListCategories((cats) => addItem(cats, category.id, makeItem(name)))}
            onToggleItem={(itemId, isPacked) =>
              mutateActiveListCategories((cats) => updateItem(cats, category.id, itemId, { packed: isPacked }))
            }
            onItemQuantityChange={(itemId, quantity) =>
              mutateActiveListCategories((cats) => updateItem(cats, category.id, itemId, { quantity }))
            }
            onItemNotesChange={(itemId, notes) =>
              mutateActiveListCategories((cats) => updateItem(cats, category.id, itemId, { notes }))
            }
            onRenameItem={(itemId, name) =>
              mutateActiveListCategories((cats) => updateItem(cats, category.id, itemId, { name }))
            }
            onDeleteItem={(itemId) => mutateActiveListCategories((cats) => deleteItem(cats, category.id, itemId))}
            onMoveItemUp={(itemId) => mutateActiveListCategories((cats) => moveItem(cats, category.id, itemId, -1))}
            onMoveItemDown={(itemId) => mutateActiveListCategories((cats) => moveItem(cats, category.id, itemId, 1))}
          />
        ))}
      </div>

      <form className="add-category-form" onSubmit={handleAddCategory}>
        <input
          placeholder="New category name…"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          Add category
        </button>
      </form>

      {confirmDeleteList && (
        <ConfirmDialog
          title="Delete list"
          message={`Delete the "${activeList.name}" list and everything in it? This can't be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDeleteList}
          onCancel={() => setConfirmDeleteList(false)}
        />
      )}
    </div>
  )
}
