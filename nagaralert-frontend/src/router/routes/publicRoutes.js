import { ROUTES } from '../../utils/constants/routes'
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage'
import ActivateAccountPage from '../../features/auth/pages/ActivateAccountPage'
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage'

export const publicRoutes = [
  {
    path: ROUTES.LOGIN,
    element: LoginPage,
    redirectIfAuth: true,
  },
  {
    path: ROUTES.REGISTER,
    element: RegisterPage,
    redirectIfAuth: true,
  },
  {
    path: ROUTES.ACTIVATE_ACCOUNT,
    element: ActivateAccountPage,
    redirectIfAuth: true,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: ForgotPasswordPage,
    redirectIfAuth: true,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: ResetPasswordPage,
    redirectIfAuth: true,
  },
]