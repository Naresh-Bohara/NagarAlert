import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice'
import { getRoleDashboard } from '../../utils/constants/routes'
import AuthGuard from '../guards/AuthGuard'
import RoleGuard from '../guards/RoleGuard'

export const RouteRenderer = ({ route }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const {
    path,
    element: Element,
    requireAuth = false,
    allowedRoles = [],
    redirectIfAuth = false,
    layout: Layout,
  } = route

  // Redirect if authenticated and route should redirect
  if (redirectIfAuth && isAuthenticated) {
    return <Navigate to={getRoleDashboard(user?.role)} replace />
  }

  // Handle protected routes
  if (requireAuth) {
    return (
      <AuthGuard>
        {allowedRoles.length > 0 ? (
          <RoleGuard allowedRoles={allowedRoles}>
            {Layout ? (
              <Layout>
                <Element />
              </Layout>
            ) : (
              <Element />
            )}
          </RoleGuard>
        ) : (
          <Element />
        )}
      </AuthGuard>
    )
  }

  // Handle public routes
  return <Element />
}