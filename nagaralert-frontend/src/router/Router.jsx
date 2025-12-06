import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice'
import { getRoleDashboard } from '../utils/constants/routes'
import { publicRoutes } from './routes/publicRoutes'
import { protectedRoutes } from './routes/protectedRoutes'
import { RouteRenderer } from './components/RouteRenderer'
import NotFoundPage from './pages/NotFoundPage'

// Lazy load dashboard pages for better performance
const DashboardLoader = ({ role }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold capitalize">{role} Dashboard</h1>
      <p className="text-gray-600">Dashboard loading...</p>
    </div>
  )
}

const Router = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  return (
    <Routes>
      {/* Dynamic Public Routes */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<RouteRenderer route={route} />}
        />
      ))}

      {/* Dynamic Protected Routes */}
      {protectedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<RouteRenderer route={route} />}
        />
      ))}

      {/* Dashboard Routes - Lazy Loaded */}
      <Route
        path="/dashboard/citizen"
        element={
          <RouteRenderer
            route={{
              path: '/dashboard/citizen',
              element: () => <DashboardLoader role="Citizen" />,
              requireAuth: true,
              allowedRoles: ['citizen'],
            }}
          />
        }
      />

      <Route
        path="/dashboard/municipality-admin"
        element={
          <RouteRenderer
            route={{
              path: '/dashboard/municipality-admin',
              element: () => <DashboardLoader role="Municipality Admin" />,
              requireAuth: true,
              allowedRoles: ['municipality-admin'],
            }}
          />
        }
      />

      {/* Root Redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? getRoleDashboard(user?.role) : '/login'}
            replace
          />
        }
      />

      {/* Dashboard Redirect */}
      <Route
        path="/dashboard"
        element={
          <Navigate
            to={isAuthenticated ? getRoleDashboard(user?.role) : '/login'}
            replace
          />
        }
      />

      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default Router