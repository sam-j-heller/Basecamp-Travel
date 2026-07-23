import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTrips } from '../hooks/useTrips'
import { useOwnedSharedTrips } from '../hooks/useOwnedSharedTrips'
import { useShoppingCart } from '../hooks/useShoppingCart'
import { createTrip, updateTripMeta, deleteTrip, duplicateTrip, saveLists } from '../lib/tripsApi'
import { TripCard } from '../components/TripCard'
import { TripFormModal } from '../components/TripFormModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { SetPasswordModal } from '../components/SetPasswordModal'
import { ShoppingCartModal } from '../components/ShoppingCartModal'
import { sampleTrip } from '../data/sampleTrip'

function getShareUrl(tripId) {
  return `${window.location.origin}${window.location.pathname}#/shared/${tripId}`
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { trips, loading } = useTrips(user.uid)
  const sharedTrips = useOwnedSharedTrips(user.uid)
  const cart = useShoppingCart(user.uid)

  const [showCreate, setShowCreate] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [renamingTrip, setRenamingTrip] = useState(null)
  const [duplicatingTrip, setDuplicatingTrip] = useState(null)
  const [deletingTrip, setDeletingTrip] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const [showSetPassword, setShowSetPassword] = useState(false)
  const [copiedTripId, setCopiedTripId] = useState(null)

  async function handleCopyShareLink(tripId) {
    try {
      await navigator.clipboard.writeText(getShareUrl(tripId))
      setCopiedTripId(tripId)
      setTimeout(() => setCopiedTripId(null), 2000)
    } catch {
      window.prompt('Copy this link:', getShareUrl(tripId))
    }
  }

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
          <button className="btn btn-ghost cart-btn" onClick={() => setShowCart(true)} title="Shopping cart">
            🛒
            {cart.totalCount > 0 && <span className="cart-badge">{cart.totalCount}</span>}
          </button>
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

      {sharedTrips.length > 0 && (
        <>
          <h2 style={{ margin: '2rem 0 1rem' }}>Shared trips you own</h2>
          <div className="trip-grid">
            {sharedTrips.map((trip) => (
              <div key={trip.id} className={`trip-card motif-${trip.themeMotif || 'mountain'}`} style={{ '--trip-color': trip.themeColor }}>
                <Link to={`/shared/${trip.id}`} className="trip-card-link">
                  <div className="trip-card-header">
                    <h3>{trip.name}</h3>
                  </div>
                </Link>
                <div className="trip-card-actions">
                  <button className="btn btn-ghost" onClick={() => handleCopyShareLink(trip.id)}>
                    {copiedTripId === trip.id ? 'Copied!' : '🔗 Copy share link'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
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

      {showCart && (
        <ShoppingCartModal
          groups={cart.groups}
          onUpdateQuantity={cart.updateQuantity}
          onGotIt={cart.markGotIt}
          onClose={() => setShowCart(false)}
        />
      )}
    </div>
  )
}
