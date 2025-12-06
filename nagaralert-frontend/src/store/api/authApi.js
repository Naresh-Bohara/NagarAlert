import { baseApi } from './baseApi'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => {
        return {
          user: response.data?.detail || response.detail || response.user || {},
          token: response.data?.token || response.token,
          refreshToken: response.data?.refreshToken || response.refreshToken,
        }
      },
    }),
    
    register: builder.mutation({
      query: (userData) => {
        const isFormData = userData instanceof FormData
        
        return {
          url: '/auth/register',
          method: 'POST',
          body: userData,
          extraOptions: { isFormData },
        }
      },
      transformResponse: (response) => ({
        user: response.data?.detail || response.detail || response.user || {},
        token: response.data?.token || response.token,
        refreshToken: response.data?.refreshToken || response.refreshToken,
      }),
    }),
    
    activateUser: builder.mutation({
      query: ({ otp, email }) => ({
        url: '/auth/activate',
        method: 'POST',
        body: { otp, email },
      }),
    }),
    
    resendOtp: builder.mutation({
      query: (data) => {
        let email;
        
        if (typeof data === 'string') {
          email = data;
        } else if (data && typeof data === 'object' && data.email) {
          email = data.email;
        } else {
          email = '';
        }
        
        return {
          url: '/auth/resend-otp',
          method: 'POST',
          body: { email },
        };
      },
    }),
    
    getMe: builder.query({
      query: () => '/auth/me',
      transformResponse: (response) => response.data || response.detail || response.user || {},
    }),
    
    updateProfile: builder.mutation({
      query: (userData) => {
        const isFormData = userData instanceof FormData
        return {
          url: '/auth/profile',
          method: 'PUT',
          body: userData,
          extraOptions: { isFormData },
        }
      },
    }),
    
    forgotPassword: builder.mutation({
      query: ({ email }) => ({
        url: '/auth/forget-password',
        method: 'POST',
        body: { email },
      }),
    }),
    
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: { email, otp, newPassword },
      }),
    }),
    
    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: { currentPassword, newPassword },
      }),
    }),
    
    refreshToken: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'GET',
      }),
    }),
    
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    
    healthCheck: builder.query({
      query: () => '/health',
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useActivateUserMutation,
  useResendOtpMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useHealthCheckQuery,
  useLazyHealthCheckQuery,
} = authApi