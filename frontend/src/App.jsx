import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import Markets from './pages/Markets'
import CreateMarket from './pages/CreateMarket'
import Portfolio from './pages/Portfolio'
import Leaderboard from './pages/Leaderboard'
import { useEffect } from 'react'

function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return user?.role === 'admin' ? children : <Navigate to="/" />
}

function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Markets />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="create-market" element={
            <AdminRoute>
              <CreateMarket />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

