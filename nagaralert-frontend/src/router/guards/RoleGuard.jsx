import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice'
import { ROUTES, getRoleDashboard } from '../../utils/constants/routes'
import { canAccess } from '../../utils/constants/roles'
import Loader from '../../components/shared/Loader/Loader'

const RoleGuard = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const isLoading = useSelector(state => state.auth.loading)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" message="Checking permissions..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Check if user has any of the allowed roles
  const hasRequiredRole = allowedRoles.some(role => 
    user?.role === role || canAccess(user?.role, role)
  )

  if (!hasRequiredRole && user?.role) {
    // Redirect to user's own dashboard if they don't have access
    return <Navigate to={getRoleDashboard(user.role) || ROUTES.DASHBOARD} replace />
  }

  return children
}

export default RoleGuard