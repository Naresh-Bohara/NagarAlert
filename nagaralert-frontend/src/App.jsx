import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { store } from './store/store'
import MainRouter from './router/Router'  // Changed from Router
import ErrorBoundary from './components/shared/ErrorBoundary/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <MainRouter />  {/* Changed from Router */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App