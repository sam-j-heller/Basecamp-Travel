import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { TripPage } from './pages/TripPage'
import { SetupNeeded } from './pages/SetupNeeded'
import { isFirebaseConfigured } from './firebase'

function Gate() {
  const { user, loading } = useAuth()

  if (loading) return <div className="app-loading">Loading…</div>
  if (!user) return <Login />

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/trip/:tripId" element={<TripPage />} />
    </Routes>
  )
}

export default function App() {
  if (!isFirebaseConfigured) return <SetupNeeded />

  return (
    <AuthProvider>
      <HashRouter>
        <Gate />
      </HashRouter>
    </AuthProvider>
  )
}
