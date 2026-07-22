import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTrips } from '../hooks/useTrips'
import { createTrip, updateTripMeta, deleteTrip, duplicateTrip, saveLists } from '../lib/tripsApi'
import { TripCard } from '../components/TripCard'
import { TripFormModal } from '../components/TripFormModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { SetPasswordModal } from '../components/SetPasswordModal'
import { sampleTrip } from '../data/sampleTrip'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { trips, loading } = useTrips(user.uid)

  const [showCreate, setShowCreate] = useState(false)
  const [renamingTrip, setRenamingTrip] = useState(null)
  const [duplicatingTrip, setDuplicatingTrip] = useState(null)
  const [deletingTrip, setDeletingTrip] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const [showSetPassword, setShowSetPassword] = useState(false)

  const hasPassword = user.providerData.some((p) => p.providerId === 'password')

  async function handleCreate(values) {
    await createTrip(user.uid, values)
    setShowCreate(false)
  }

  async function handleRename(values) {
    await updateTripMeta(user.uid, renamingTrip.id, values)
    setRenamingTrip(null)
  }

  async function handleDuplicateConfirm(values) {
    await duplicateTrip(user.uid, duplicatingTrip.id, values.name)
    setDuplicatingTrip(null)
  }

  async function handleDelete() {
    await deleteTrip(user.uid, deletingTrip.id)
    setDeletingTrip(null)
  }

  async function handleLoadSample() {
    setSeeding(true)
    try {
      const tripId = await createTrip(user.uid, {
        name: sampleTrip.name,
        startDate: sampleTrip.startDate,
        endDate: sampleTrip.endDate,
        themeColor: sampleTrip.themeColor,
        themeMotif: sampleTrip.themeMotif,
      })
      await saveLists(user.uid, tripId, sampleTrip.lists)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Basecamp</h1>
          <p className="dashboard-subtitle">{user.email || 'Signed in'}</p>
        </div>
        <div className="dashboard-header-actions">
          {!hasPassword && (
            <button className="btn btn-ghost" onClick={() => setShowSetPassword(true)}>
              Set a password
            </button>
          )}
          <button className="btn btn-ghost" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <div className="dashboard-toolbar">
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New trip
        </button>
        {trips.length === 0 && !loading && (
          <button className="btn btn-secondary" onClick={handleLoadSample} disabled={seeding}>
            {seeding ? 'Loading…' : '+ Load Galápagos & Peru starter list'}
          </button>
        )}
      </div>

      {loading ? (
        <p className="dashboard-empty">Loading trips…</p>
      ) : trips.length === 0 ? (
        <p className="dashboard-empty">No trips yet. Create one to start packing.</p>
      ) : (
        <div className="trip-grid">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onRename={setRenamingTrip}
              onDuplicate={setDuplicatingTrip}
              onDelete={setDeletingTrip}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <TripFormModal
          title="New trip"
          submitLabel="Create trip"
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {renamingTrip && (
        <TripFormModal
          title="Edit trip"
          initial={renamingTrip}
          submitLabel="Save"
          onSubmit={handleRename}
          onCancel={() => setRenamingTrip(null)}
        />
      )}

      {duplicatingTrip && (
        <TripFormModal
          title={`Duplicate "${duplicatingTrip.name}"`}
          initial={{ ...duplicatingTrip, name: `${duplicatingTrip.name} (copy)` }}
          submitLabel="Duplicate"
          onSubmit={handleDuplicateConfirm}
          onCancel={() => setDuplicatingTrip(null)}
        />
      )}

      {deletingTrip && (
        <ConfirmDialog
          title="Delete trip"
          message={`Delete "${deletingTrip.name}" and all its categories and items? This can't be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeletingTrip(null)}
        />
      )}

      {showSetPassword && <SetPasswordModal onClose={() => setShowSetPassword(false)} />}
    </div>
  )
}
