import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTrip } from '../hooks/useTrip'
import { CategorySection } from '../components/CategorySection'
import { ProgressBar } from '../components/ProgressBar'
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
} from '../lib/tripModel'

export function TripPage() {
  const { tripId } = useParams()
  const { user } = useAuth()
  const { trip, loading, mutateCategories } = useTrip(user.uid, tripId)
  const [newCategoryName, setNewCategoryName] = useState('')

  if (loading) return <p className="dashboard-empty">Loading trip…</p>
  if (!trip) return <p className="dashboard-empty">Trip not found.</p>

  const categories = trip.categories || []
  const { packed, total } = tripProgress(categories)

  function handleAddCategory(e) {
    e.preventDefault()
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    mutateCategories((cats) => addCategory(cats, trimmed))
    setNewCategoryName('')
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

      <div className="category-list">
        {categories.map((category, i) => (
          <CategorySection
            key={category.id}
            category={category}
            isFirst={i === 0}
            isLast={i === categories.length - 1}
            onRenameCategory={(name) => mutateCategories((cats) => renameCategory(cats, category.id, name))}
            onDeleteCategory={() => mutateCategories((cats) => deleteCategory(cats, category.id))}
            onMoveCategoryUp={() => mutateCategories((cats) => moveCategory(cats, category.id, -1))}
            onMoveCategoryDown={() => mutateCategories((cats) => moveCategory(cats, category.id, 1))}
            onAddItem={(name) => mutateCategories((cats) => addItem(cats, category.id, makeItem(name)))}
            onToggleItem={(itemId, isPacked) =>
              mutateCategories((cats) => updateItem(cats, category.id, itemId, { packed: isPacked }))
            }
            onItemQuantityChange={(itemId, quantity) =>
              mutateCategories((cats) => updateItem(cats, category.id, itemId, { quantity }))
            }
            onItemNotesChange={(itemId, notes) =>
              mutateCategories((cats) => updateItem(cats, category.id, itemId, { notes }))
            }
            onRenameItem={(itemId, name) =>
              mutateCategories((cats) => updateItem(cats, category.id, itemId, { name }))
            }
            onDeleteItem={(itemId) => mutateCategories((cats) => deleteItem(cats, category.id, itemId))}
            onMoveItemUp={(itemId) => mutateCategories((cats) => moveItem(cats, category.id, itemId, -1))}
            onMoveItemDown={(itemId) => mutateCategories((cats) => moveItem(cats, category.id, itemId, 1))}
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
    </div>
  )
}
