import { createSlice } from '@reduxjs/toolkit'

const loadAuthFromStorage = () => {
  try {
    const storedAuth = localStorage.getItem('nagaralert_auth')
    return storedAuth ? JSON.parse(storedAuth) : null
  } catch (error) {
    console.error('Failed to load auth from storage:', error)
    return null
  }
}

const initialState = {
  user: loadAuthFromStorage()?.user || null,
  token: loadAuthFromStorage()?.token || null,
  refreshToken: loadAuthFromStorage()?.refreshToken || null,
  isAuthenticated: !!loadAuthFromStorage()?.token,
  loading: false,
  error: null,
  lastLogin: loadAuthFromStorage()?.lastLogin || null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload
      state.user = user
      state.token = token
      state.refreshToken = refreshToken
      state.isAuthenticated = true
      state.error = null
      state.lastLogin = new Date().toISOString()
      
      // Save to localStorage
      localStorage.setItem('nagaralert_auth', JSON.stringify({ 
        user, 
        token, 
        refreshToken,
        lastLogin: state.lastLogin
      }))
    },
    
    logout: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.error = null
      state.lastLogin = null
      
      // Clear localStorage
      localStorage.removeItem('nagaralert_auth')
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    
    setError: (state, action) => {
      state.error = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        // Update localStorage
        const storedAuth = JSON.parse(localStorage.getItem('nagaralert_auth') || '{}')
        storedAuth.user = state.user
        localStorage.setItem('nagaralert_auth', JSON.stringify(storedAuth))
      }
    },
    
    updateToken: (state, action) => {
      state.token = action.payload.token
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken
      }
      
      // Update localStorage
      const storedAuth = JSON.parse(localStorage.getItem('nagaralert_auth') || '{}')
      storedAuth.token = state.token
      if (action.payload.refreshToken) {
        storedAuth.refreshToken = state.refreshToken
      }
      localStorage.setItem('nagaralert_auth', JSON.stringify(storedAuth))
    },
  },
})

export const {
  setCredentials,
  logout,
  setLoading,
  setError,
  clearError,
  updateUser,
  updateToken,
} = authSlice.actions

// Selectors
export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
export const selectRefreshToken = (state) => state.auth.refreshToken
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error
export const selectLastLogin = (state) => state.auth.lastLogin
export const selectUserRole = (state) => state.auth.user?.role

export default authSlice.reducer