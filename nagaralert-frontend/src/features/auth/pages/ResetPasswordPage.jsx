import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Key, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useResetPasswordMutation } from '../../../store/api/authApi'
import { ROUTES } from '../../../utils/constants/routes'
import AuthLayout from '../../../components/templates/AuthLayout/AuthLayout'
import Button from '../../../components/atoms/Button/Button'
import Input from '../../../components/atoms/Input/Input'
import Card from '../../../components/atoms/Card/Card'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'otp') {
      // Alphanumeric OTP
      const alphanumericValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
      setFormData(prev => ({ ...prev, [name]: alphanumericValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Simple validation
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email required'
    }
    
    if (!formData.otp || formData.otp.length !== 6) {
      newErrors.otp = 'Enter 6-character OTP'
    }
    
    if (!formData.newPassword || formData.newPassword.length < 6) {
      newErrors.newPassword = 'Minimum 6 characters'
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    try {
      await resetPassword({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword
      }).unwrap()
      
      toast.success('Password reset successful!')
      
      // Redirect to login
      setTimeout(() => {
        navigate(ROUTES.LOGIN, {
          state: { message: 'Password reset successful' }
        })
      }, 1500)
      
    } catch (error) {
      toast.error(error.data?.message || 'Failed to reset password')
    }
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter OTP and create new password"
      backLink={ROUTES.FORGOT_PASSWORD}
      backText="Back to forgot password"
    >
      <div className="w-full max-w-md">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Create New Password
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              required
              icon={<Mail className="w-5 h-5" />}
              disabled={isLoading}
            />
            
            <div>
              <Input
                label="6-character OTP"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                placeholder="ABC123"
                maxLength={6}
                error={errors.otp}
                required
                icon={<Key className="w-5 h-5" />}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the OTP sent to your email
              </p>
            </div>
            
            <Input
              label="New Password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              error={errors.newPassword}
              required
              icon={<Lock className="w-5 h-5" />}
              disabled={isLoading}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />
            
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              error={errors.confirmPassword}
              required
              icon={<Lock className="w-5 h-5" />}
              disabled={isLoading}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              className="mt-4"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
            
            <div className="text-center pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Back to login
              </button>
            </div>
          </form>
        </Card>
      </div>
    </AuthLayout>
  )
}

export default ResetPasswordPage