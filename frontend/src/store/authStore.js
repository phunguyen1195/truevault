import { create } from 'zustand'
import { api } from '../lib/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: true,

  initAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ loading: false })
      return
    }

    try {
      const response = await api.get('/auth/me')
      set({ user: response.data, loading: false })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, token: null, loading: false })
    }
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', response.data.token)
    set({ user: response.data.user, token: response.data.token })
    return response.data
  },

  register: async (email, password, name) => {
    const response = await api.post('/auth/register', { email, password, name })
    localStorage.setItem('token', response.data.token)
    set({ user: response.data.user, token: response.data.token })
    return response.data
  },

  loginWithToken: async (token) => {
    localStorage.setItem('token', token)
    const response = await api.get('/auth/me')
    set({ user: response.data, token })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  updateUser: (user) => {
    set({ user })
  }
}))

