import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
    
    // Log error to error tracking service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
        >
          <div className="max-w-md w-full text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-4"
            >
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
            </p>

            {import.meta.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 text-left">
                <details className="bg-gray-100 rounded-lg p-4">
                  <summary className="font-medium text-gray-700 cursor-pointer">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-sm text-red-600 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="btn-primary"
              >
                Reload Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="btn-secondary"
              >
                Go to Home
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              If the problem persists, please contact support.
            </p>
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary