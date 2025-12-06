import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logout, setCredentials } from '../slices/authSlice'

// Create a proper custom base query
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9005/api/v1',
  credentials: 'include',
  prepareHeaders: (headers, { getState, extra }) => {
    const token = getState().auth.token
    
    // Add auth token if available
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    
    // If extra indicates it's FormData, don't set Content-Type
    // Let the browser set it automatically for FormData
    if (extra?.isFormData) {
      // Remove Content-Type header for FormData
      if (headers.has('Content-Type')) {
        headers.delete('Content-Type')
      }
    } else if (!headers.has('Content-Type')) {
      // Default to JSON for non-FormData requests
      headers.set('Content-Type', 'application/json')
    }
    
    return headers
  }
})

// Custom base query wrapper
const baseQueryWithFormData = async (args, api, extraOptions) => {
  const { isFormData } = extraOptions || {}
  
  // Prepare the request
  const requestArgs = { ...args }
  
  // If it's FormData and body is an object (not already FormData), convert it
  if (isFormData && requestArgs.body && typeof requestArgs.body === 'object' && !(requestArgs.body instanceof FormData)) {
    const formData = new FormData()
    Object.entries(requestArgs.body).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (Array.isArray(value)) {
          value.forEach(item => {
            if (item instanceof File) {
              formData.append(key, item)
            } else {
              formData.append(key, JSON.stringify(item))
            }
          })
        } else {
          formData.append(key, value)
        }
      }
    })
    requestArgs.body = formData
  }
  
  // Execute the request
  return rawBaseQuery(requestArgs, api, { ...extraOptions, isFormData })
}

// Re-auth wrapper
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQueryWithFormData(args, api, extraOptions)
  
  // If 401 => try refresh
  if (result?.error?.status === 401) {
    console.log('🔄 Token expired — refreshing...')
    
    const refreshToken = api.getState().auth.refreshToken
    if (!refreshToken) {
      api.dispatch(logout())
      return result
    }
    
    // Request new tokens (use JSON for this)
    const refreshResult = await baseQueryWithFormData(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: { token: refreshToken },
      },
      api,
      { isFormData: false }
    )
    
    if (refreshResult?.data) {
      const { user, accessToken, refreshToken: newRefresh } = refreshResult.data
      
      // Store new tokens
      api.dispatch(
        setCredentials({
          user,
          token: accessToken,
          refreshToken: newRefresh
        })
      )
      
      // Retry original failed request with same options
      result = await baseQueryWithFormData(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }
  
  return result
}

// API Instance
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth', 'User', 'Report', 'Category', 'Notification',
    'Reward', 'Emergency', 'Sponsor', 'Analytics', 'Upload'
  ],
  endpoints: () => ({})
})