import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      loginWithToken(token)
        .then(() => navigate('/'))
        .catch(() => navigate('/login'))
    } else {
      navigate('/login')
    }
  }, [searchParams, navigate, loginWithToken])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}

