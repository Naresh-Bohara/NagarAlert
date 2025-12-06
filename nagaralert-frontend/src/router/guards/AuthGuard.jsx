import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../../store/slices/authSlice'
import { ROUTES } from '../../utils/constants/routes'
import Loader from '../../components/shared/Loader/Loader'

const AuthGuard = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(state => state.auth.loading)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" message="Checking authentication..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return children
}

export default AuthGuard