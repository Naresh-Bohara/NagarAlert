import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import Button from '../../components/atoms/Button/Button'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/')}
            leftIcon={<Home className="w-5 h-5" />}
          >
            Go to Homepage
          </Button>

          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Go Back
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            If you believe this is an error, please{' '}
            <a
              href="/contact"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage