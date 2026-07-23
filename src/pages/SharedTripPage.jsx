import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSharedTrip } from '../hooks/useSharedTrip'
import { CategorySection } from '../components/CategorySection'
import { ItemRow } from '../components/ItemRow'
import { ProgressBar } from '../components/ProgressBar'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { StickFigureWave } from '../components/StickFigureWave'
import { ImportListModal } from '../components/ImportListModal'
import { isSiteAdmin } from '../lib/admin'
import { setListGuestEditable } from '../lib/sharedTripsApi'
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
  addList,
  renameList,
  deleteList,
  tripProgress,
  addFlatItem,
  updateFlatItem,
  deleteFlatItem,
  moveFlatItem,
  ownedPatch,
  buyPatch,
} from '../lib/tripModel'

function getShareUrl(tripId) {
  return `${window.location.origin}${window.location.pathname}#/shared/${tripId}`
}

export function SharedTripPage() {
  const { tripId } = useParams()
  const { user } = useAuth()
  const {
    trip,
    loading,
    isOwner,
    myPacked,
    myOwned,
    myBuy,
    ownerPacked,
    ownerOwned,
    ownerBuy,
    personalItems,
    mutateStructure,
    toggleMyStatus,
    mutatePersonalItems,
  } = useSharedTrip(tripId, user.uid)

  const [activeListId, setActiveListId] = useState(null)
  const [addingList, setAddingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [editingListName, setEditingListName] = useState(false)
  const [listNameDraft, setListNameDraft] = useState('')
  const [confirmDeleteList, setConfirmDeleteList] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newPersonalItemName, setNewPersonalItemName] = useState('')
  const [copied, setCopied] = useState(false)

  if (loading) return <p className="dashboard-empty">Loading trip…</p>
  if (!trip) return <p className="dashboard-empty">Trip not found, or you don't have access.</p>

  const lists = trip.lists || []
  if (lists.length === 0) return <p className="dashboard-empty">This trip has no lists yet.</p>

  const isAdmin = isSiteAdmin(user)
  const guestEditableListIds = trip.guestEditableListIds || []

  const activeList = lists.find((l) => l.id === activeListId) || lists[0]
  const canEditStructure = isOwner || guestEditableListIds.includes(activeList.id)
  const canToggleOwnedItems = isOwner || !activeList.synced
  const relevantPacked = new Set(activeList.synced ? ownerPacked : myPacked)
  const relevantOwned = new Set(activeList.synced ? ownerOwned : myOwned)
  const relevantBuy = new Set(activeList.synced ? ownerBuy : myBuy)

  const hydratedCategories = activeList.categories.map((c) => ({
    ...c,
    items: c.items.map((i) => ({
      ...i,
      packed: relevantPacked.has(i.id),
      owned: relevantOwned.has(i.id),
      buy: relevantBuy.has(i.id),
    })),
  }))

  const personalListItems = personalItems[activeList.id] || []
  const personalCategory = { id: 'personal', name: 'My additions', items: personalListItems }

  const { packed, total } = tripProgress([...hydratedCategories, personalCategory])

  const syncedList = lists.find((l) => l.synced)
  const showSamBanner =
    !isOwner && syncedList && activeList.id !== syncedList.id && total > 0 && packed / total < 0.5

  function mutateActiveListCategories(transform) {
    mutateStructure((currentLists) =>
      currentLists.map((l) => (l.id === activeList.id ? { ...l, categories: transform(l.categories) } : l))
    )
  }

  function mutatePersonal(transform) {
    mutatePersonalItems(activeList.id, transform)
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
    mutateStructure((currentLists) => addList(currentLists, trimmed))
    setNewListName('')
    setAddingList(false)
  }

  function commitListRename() {
    const trimmed = listNameDraft.trim()
    setEditingListName(false)
    if (trimmed && trimmed !== activeList.name) {
      mutateStructure((currentLists) => renameList(currentLists, activeList.id, trimmed))
    }
  }

  function handleDeleteList() {
    mutateStructure((currentLists) => deleteList(currentLists, activeList.id))
    setActiveListId(null)
    setConfirmDeleteList(false)
  }

  function handleImportText(importedCategories) {
    mutateActiveListCategories((cats) => [...cats, ...importedCategories])
    setShowImportModal(false)
  }

  function handleAddPersonalItem(e) {
    e.preventDefault()
    const trimmed = newPersonalItemName.trim()
    if (!trimmed) return
    mutatePersonal((items) => addFlatItem(items, makeItem(trimmed)))
    setNewPersonalItemName('')
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(getShareUrl(tripId))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', getShareUrl(tripId))
    }
  }

  function handleToggleGuestEditingForActiveList() {
    setListGuestEditable(tripId, guestEditableListIds, activeList.id, !guestEditableListIds.includes(activeList.id))
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

      {isOwner && (
        <div className="dashboard-toolbar" style={{ marginBottom: '1rem' }}>
          <button className="btn btn-ghost" onClick={handleCopyLink}>
            {copied ? 'Link copied!' : '🔗 Copy share link'}
          </button>
        </div>
      )}

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
        {canEditStructure &&
          (addingList ? (
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
          ))}
      </div>

      {isAdmin && (
        <div className="list-toolbar">
          <button className="icon-btn" title="Toggle guest editing for this list" onClick={handleToggleGuestEditingForActiveList}>
            {guestEditableListIds.includes(activeList.id)
              ? `🔓 Guests can edit "${activeList.name}"`
              : `🔒 Guests can't edit "${activeList.name}"`}
          </button>
        </div>
      )}

      {canEditStructure && (
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
            <button
              className="icon-btn icon-btn-danger"
              title="Delete list"
              onClick={() => setConfirmDeleteList(true)}
            >
              🗑 Delete list
            </button>
          )}
          <button className="icon-btn" title="Import list from text" onClick={() => setShowImportModal(true)}>
            ⬆ Import list
          </button>
        </div>
      )}

      {showSamBanner && (
        <div className="sam-banner">
          <StickFigureWave />
          <span>Sam is outpacing you!</span>
        </div>
      )}

      <div className="category-list">
        {hydratedCategories.map((category, i) => (
          <CategorySection
            key={category.id}
            category={category}
            isFirst={i === 0}
            isLast={i === hydratedCategories.length - 1}
            readOnly={!canEditStructure}
            onRenameCategory={(name) => mutateActiveListCategories((cats) => renameCategory(cats, category.id, name))}
            onDeleteCategory={() => mutateActiveListCategories((cats) => deleteCategory(cats, category.id))}
            onMoveCategoryUp={() => mutateActiveListCategories((cats) => moveCategory(cats, category.id, -1))}
            onMoveCategoryDown={() => mutateActiveListCategories((cats) => moveCategory(cats, category.id, 1))}
            onAddItem={(name) => mutateActiveListCategories((cats) => addItem(cats, category.id, makeItem(name)))}
            onTogglePacked={
              canToggleOwnedItems ? (itemId, v) => toggleMyStatus('packed', itemId, v) : undefined
            }
            onToggleOwned={
              canToggleOwnedItems
                ? (itemId, v) => {
                    toggleMyStatus('owned', itemId, v)
                    if (v) toggleMyStatus('buy', itemId, false)
                  }
                : undefined
            }
            onToggleBuy={
              canToggleOwnedItems
                ? (itemId, v) => {
                    toggleMyStatus('buy', itemId, v)
                    if (v) toggleMyStatus('owned', itemId, false)
                  }
                : undefined
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

      {canEditStructure && (
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
      )}

      <section className="category-section" style={{ marginTop: '1.5rem' }}>
        <header className="category-header">
          <h2>My additions</h2>
        </header>
        <ul className="item-list">
          {personalListItems.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onTogglePacked={(checked) => mutatePersonal((items) => updateFlatItem(items, item.id, { packed: checked }))}
              onToggleOwned={(checked) => mutatePersonal((items) => updateFlatItem(items, item.id, ownedPatch(checked)))}
              onToggleBuy={(checked) => mutatePersonal((items) => updateFlatItem(items, item.id, buyPatch(checked)))}
              onQuantityChange={(q) => mutatePersonal((items) => updateFlatItem(items, item.id, { quantity: q }))}
              onNotesChange={(notes) => mutatePersonal((items) => updateFlatItem(items, item.id, { notes }))}
              onRename={(name) => mutatePersonal((items) => updateFlatItem(items, item.id, { name }))}
              onDelete={() => mutatePersonal((items) => deleteFlatItem(items, item.id))}
              onMoveUp={() => mutatePersonal((items) => moveFlatItem(items, item.id, -1))}
              onMoveDown={() => mutatePersonal((items) => moveFlatItem(items, item.id, 1))}
            />
          ))}
        </ul>
        <form className="add-item-form" onSubmit={handleAddPersonalItem}>
          <input
            placeholder="Add your own item…"
            value={newPersonalItemName}
            onChange={(e) => setNewPersonalItemName(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            Add
          </button>
        </form>
      </section>

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

      {showImportModal && (
        <ImportListModal
          listName={activeList.name}
          onImport={handleImportText}
          onCancel={() => setShowImportModal(false)}
        />
      )}
    </div>
  )
}
