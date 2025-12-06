import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  sidebarOpen: false,
  notifications: [],
  isMobileMenuOpen: false,
  isLoading: false,
  loadingText: 'Loading...',
  toastQueue: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.theme)
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      if (state.notifications.length > 10) {
        state.notifications.pop()
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    setMobileMenuOpen: (state, action) => {
      state.isMobileMenuOpen = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload.isLoading
      state.loadingText = action.payload.text || 'Loading...'
    },
    addToast: (state, action) => {
      state.toastQueue.push(action.payload)
    },
    removeToast: (state, action) => {
      state.toastQueue = state.toastQueue.filter(
        (toast) => toast.id !== action.payload
      )
    },
  },
})

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleMobileMenu,
  setMobileMenuOpen,
  setLoading,
  addToast,
  removeToast,
} = uiSlice.actions

export const selectTheme = (state) => state.ui.theme
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectNotifications = (state) => state.ui.notifications
export const selectIsMobileMenuOpen = (state) => state.ui.isMobileMenuOpen
export const selectIsLoading = (state) => state.ui.isLoading
export const selectLoadingText = (state) => state.ui.loadingText
export const selectToastQueue = (state) => state.ui.toastQueue

export default uiSlice.reducer