import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Key, ArrowRight, Loader2, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useActivateUserMutation, useResendOtpMutation } from '../../../store/api/authApi'
import { ROUTES } from '../../../utils/constants/routes'
import AuthLayout from '../../../components/templates/AuthLayout/AuthLayout'
import Button from '../../../components/atoms/Button/Button'
import Input from '../../../components/atoms/Input/Input'
import Card from '../../../components/atoms/Card/Card'

const OTP_DURATION = 300; // 5 minutes
const RESEND_COOLDOWN = 30; // 30 seconds

const ActivateAccountPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation()
  const [resendOtp, { isLoading: isResending, error: resendError }] = useResendOtpMutation()
  
  const [formData, setFormData] = useState({
    email: location.state?.email || localStorage.getItem('pending_activation_email') || '',
    otp: '',
  })
  
  const [errors, setErrors] = useState({})
  const [isActivated, setIsActivated] = useState(false)
  const [otpTimer, setOtpTimer] = useState(() => getInitialTimer())
  const [lastResendTime, setLastResendTime] = useState(() => localStorage.getItem('last_resend_time') || null)

  // Get initial timer from localStorage
  function getInitialTimer() {
    const savedTimer = localStorage.getItem('otp_timer')
    if (savedTimer) {
      const savedTime = parseInt(savedTimer, 10)
      const timePassed = Math.floor((Date.now() - parseInt(localStorage.getItem('otp_timer_start'), 10)) / 1000)
      const remainingTime = Math.max(0, savedTime - timePassed)
      return remainingTime
    }
    return OTP_DURATION
  }

  // Load email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('pending_activation_email')
    if (storedEmail && !formData.email) {
      setFormData(prev => ({ ...prev, email: storedEmail }))
    }
  }, [])

  // Handle timer
  useEffect(() => {
    if (otpTimer === OTP_DURATION) {
      localStorage.setItem('otp_timer_start', Date.now().toString())
      localStorage.setItem('otp_timer', otpTimer.toString())
    }

    let timer
    if (otpTimer > 0 && !isActivated) {
      timer = setTimeout(() => {
        const newTimer = otpTimer - 1
        setOtpTimer(newTimer)
        localStorage.setItem('otp_timer', newTimer.toString())
      }, 1000)
    } else if (otpTimer === 0) {
      localStorage.removeItem('otp_timer')
      localStorage.removeItem('otp_timer_start')
    }

    return () => timer && clearTimeout(timer)
  }, [otpTimer, isActivated])

  // Format timer to MM:SS
  const formatTimer = (seconds) => {
    if (seconds <= 0) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Check if resend is allowed
  const canResend = () => {
    if (!lastResendTime) return true
    const timeSinceLastResend = Date.now() - parseInt(lastResendTime, 10)
    return timeSinceLastResend >= RESEND_COOLDOWN * 1000
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'otp') {
      const alphanumericValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
      setFormData(prev => ({ ...prev, otp: alphanumericValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!formData.otp) {
      newErrors.otp = 'OTP is required'
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 characters'
    } else if (!/^[A-Z0-9]{6}$/.test(formData.otp)) {
      newErrors.otp = 'OTP must be 6 alphanumeric characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      const result = await activateUser({
        email: formData.email.trim(),
        otp: formData.otp.trim()
      }).unwrap()
      
      toast.success('Account activated successfully!')
      setIsActivated(true)
      
      localStorage.removeItem('pending_activation_email')
      localStorage.removeItem('otp_timer')
      localStorage.removeItem('otp_timer_start')
      localStorage.removeItem('last_resend_time')
      
      setTimeout(() => {
        navigate(ROUTES.LOGIN, { 
          state: { 
            message: 'Account activated successfully! Please login.',
            email: formData.email
          }
        })
      }, 3000)
      
    } catch (error) {
      if (error.data?.errors) {
        const backendErrors = {}
        error.data.errors.forEach(err => {
          if (err.path && err.path.includes('email')) backendErrors.email = err.msg
          if (err.path && err.path.includes('otp')) backendErrors.otp = err.msg
        })
        setErrors(backendErrors)
      }
      
      toast.error(error.data?.message || error.error || 'Invalid OTP or activation failed')
    }
  }

  const handleResendOtp = async () => {
    const email = formData.email.trim()
    
    if (!email) {
      toast.error('Email is required')
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email format')
      return
    }
    
    if (!canResend()) {
      const timeSinceLastResend = Date.now() - parseInt(lastResendTime, 10)
      const cooldownRemaining = Math.ceil((RESEND_COOLDOWN * 1000 - timeSinceLastResend) / 1000)
      toast.error(`Please wait ${cooldownRemaining} seconds before requesting another OTP`)
      return
    }
    
    try {
      const result = await resendOtp({ email }).unwrap()
      
      toast.success('New OTP sent to your email')
      
      setOtpTimer(OTP_DURATION)
      localStorage.setItem('otp_timer', OTP_DURATION.toString())
      localStorage.setItem('otp_timer_start', Date.now().toString())
      
      const currentTime = Date.now().toString()
      setLastResendTime(currentTime)
      localStorage.setItem('last_resend_time', currentTime)
      
    } catch (error) {
      if (error.data?.detail?.email) {
        toast.error(`Email error: ${error.data.detail.email}`)
      } else if (error.data?.errors) {
        const backendErrors = {}
        error.data.errors.forEach(err => {
          if (err.path && err.path.includes('email')) backendErrors.email = err.msg
        })
        setErrors(backendErrors)
        toast.error(backendErrors.email || 'Email validation failed')
      } else {
        toast.error(error.data?.message || error.error || 'Failed to resend OTP')
      }
    }
  }

  const getCooldownRemaining = () => {
    if (!lastResendTime || canResend()) return 0
    const timeSinceLastResend = Date.now() - parseInt(lastResendTime, 10)
    const cooldownRemaining = Math.max(0, RESEND_COOLDOWN * 1000 - timeSinceLastResend)
    return Math.ceil(cooldownRemaining / 1000)
  }

  const cooldownRemaining = getCooldownRemaining()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  }

  return (
    <AuthLayout
      title="Activate Your Account"
      subtitle="Enter the 6-digit OTP sent to your email to complete registration"
      backLink={ROUTES.LOGIN}
      backText="Back to login"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {isActivated ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6"
              >
                <CheckCircle className="w-10 h-10" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Account Activated!
              </h3>
              
              <p className="text-gray-600 mb-6">
                Your account has been successfully activated.
                <br />
                Redirecting to login page...
              </p>
              
              <div className="inline-flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Please wait...</span>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Activate Account
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  We sent a 6-character OTP to your email address
                </p>
              </motion.div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
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
                    disabled={isActivating}
                  />
                </motion.div>
                
                <motion.div variants={itemVariants}>
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
                    disabled={isActivating}
                    rightIcon={
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-600">
                          {formatTimer(otpTimer)}
                        </span>
                      </div>
                    }
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the 6-character code (letters and numbers) sent to your email
                  </p>
                  
                  <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                    <span className="font-medium">Example formats:</span>
                    <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">A1B2C3</code>
                    <code className="px-2 py-1 bg-gray-100 rounded text-gray-700">XYZ789</code>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs font-medium text-blue-900">
                          OTP Expires in {formatTimer(otpTimer)}
                        </p>
                        <p className="text-xs text-blue-700">
                          {cooldownRemaining > 0 
                            ? `Resend available in ${cooldownRemaining}s` 
                            : 'Didn\'t receive code?'}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResendOtp}
                      loading={isResending}
                      disabled={isResending || !canResend() || otpTimer === 0}
                      className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {isResending ? 'Sending...' : 'Resend OTP'}
                    </Button>
                  </div>
                  
                  {cooldownRemaining > 0 && (
                    <p className="mt-2 text-xs text-orange-600 text-center">
                      ⏳ Resend cooldown: {cooldownRemaining} seconds remaining
                    </p>
                  )}
                  
                  {otpTimer === 0 && (
                    <p className="mt-2 text-xs text-red-600 text-center">
                      ⚠️ OTP has expired. Please request a new one.
                    </p>
                  )}
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isActivating}
                    disabled={isActivating || otpTimer === 0}
                  >
                    {isActivating ? 'Activating...' : 'Activate Account'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      OTP Information
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• OTP is 6 characters long (letters A-Z and numbers 0-9)</li>
                      <li>• Letters are automatically converted to uppercase</li>
                      <li>• Check your spam folder if you don't see the email</li>
                      <li>• Make sure you entered the correct email address</li>
                      <li>• OTP expires in 5 minutes</li>
                      <li>• 30-second cooldown between resend requests</li>
                      <li>• Contact support if you continue having issues</li>
                    </ul>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Already activated?{' '}
                      <button
                        type="button"
                        onClick={() => navigate(ROUTES.LOGIN)}
                        className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Login here
                      </button>
                    </p>
                  </div>
                </motion.div>
              </form>
            </>
          )}
        </Card>
        
        <motion.div variants={itemVariants} className="mt-6">
          <Card className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Key className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Security Notice
                </h4>
                <p className="text-xs text-gray-600">
                  Never share your OTP with anyone. NagarAlert will never ask for your OTP via phone, email, or text message.
                  <br />
                  <span className="font-medium">Note:</span> OTPs may contain both letters (A-Z) and numbers (0-9).
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AuthLayout>
  )
}

export default ActivateAccountPage