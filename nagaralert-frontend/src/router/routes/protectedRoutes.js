import { ROUTES } from '../../utils/constants/routes'
import ProfilePage from '../../features/auth/pages/ProfilePage'

export const protectedRoutes = [
  {
    path: ROUTES.PROFILE,
    element: ProfilePage,
    requireAuth: true,
    title: 'My Profile',
  },
]