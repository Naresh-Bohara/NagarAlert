import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLoginMutation } from '../../../store/api/authApi'
import { setCredentials } from '../../../store/slices/authSlice'
import { useDispatch } from 'react-redux'
import { ROUTES } from '../../../utils/constants/routes'
import { getRoleDashboard } from '../../../utils/constants/routes'
import Button from '../../../components/atoms/Button/Button'
import { TextInput, PasswordInput } from '../../../components/shared/Form/FormComponents'
import Card from '../../../components/atoms/Card/Card'
import AuthLayout from '../../../components/templates/AuthLayout/AuthLayout'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [login, { isLoading }] = useLoginMutation()
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap()
      
      dispatch(setCredentials({
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      }))
      
      toast.success('Login successful!')
      
      const from = location.state?.from?.pathname || getRoleDashboard(result.user?.role) || ROUTES.DASHBOARD
      navigate(from, { replace: true })
      
    } catch (error) {
      if (error.data?.errors) {
        error.data.errors.forEach(err => {
          if (err.path.includes('email')) {
            setError('email', {
              type: 'manual',
              message: err.msg,
            })
          }
          if (err.path.includes('password')) {
            setError('password', {
              type: 'manual',
              message: err.msg,
            })
          }
        })
      }
      
      toast.error(error.data?.message || 'Login failed. Check credentials.')
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your NagarAlert account"
      backLink={ROUTES.HOME}
      backText="Back to home"
    >
      <div className="w-full max-w-md">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Sign In
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <TextInput
              control={control}
              name="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              required={true}
              icon={Mail}
              validation={{
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              }}
            />
            
            <PasswordInput
              control={control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              required={true}
              showToggle={true}
            />
            
            <div className="flex justify-end">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              className="mt-2"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              <LogIn className="w-5 h-5 ml-2" />
            </Button>
            
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to={ROUTES.REGISTER}
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </AuthLayout>
  )
}

export default LoginPage