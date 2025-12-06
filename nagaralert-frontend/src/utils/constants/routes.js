export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  ACTIVATE_ACCOUNT: '/activate-account',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Citizen routes
  CITIZEN: {
    DASHBOARD: '/dashboard/citizen',
    REPORTS: '/dashboard/citizen/reports',
    CREATE_REPORT: '/dashboard/citizen/reports/create',
    REWARDS: '/dashboard/citizen/rewards',
    LEADERBOARD: '/dashboard/citizen/leaderboard',
  },
  
  // Municipality Admin routes
  MUNICIPALITY_ADMIN: {
    DASHBOARD: '/dashboard/municipality-admin',
    REPORTS: '/dashboard/municipality-admin/reports',
    USERS: '/dashboard/municipality-admin/users',
    STAFF: '/dashboard/municipality-admin/staff',
    ANALYTICS: '/dashboard/municipality-admin/analytics',
  },
  
  // Municipality Staff routes
  MUNICIPALITY_STAFF: {
    DASHBOARD: '/dashboard/municipality-staff',
    TASKS: '/dashboard/municipality-staff/tasks',
    ASSIGNMENTS: '/dashboard/municipality-staff/assignments',
    REPORTS: '/dashboard/municipality-staff/reports',
  },
  
  // System Admin routes
  SYSTEM_ADMIN: {
    DASHBOARD: '/dashboard/system-admin',
    MUNICIPALITIES: '/dashboard/system-admin/municipalities',
    USERS: '/dashboard/system-admin/users',
    SYSTEM_LOGS: '/dashboard/system-admin/logs',
    SETTINGS: '/dashboard/system-admin/settings',
  },
  
  // Report routes
  REPORTS: {
    LIST: '/reports',
    CREATE: '/reports/create',
    DETAILS: '/reports/:id',
    EDIT: '/reports/:id/edit',
  },
  
  // Emergency routes
  EMERGENCY: {
    CONTACTS: '/emergency/contacts',
    REPORT: '/emergency/report',
  },
  
  // Static pages
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  FAQ: '/faq',
}

// Helper function to get role-specific dashboard
export const getRoleDashboard = (role) => {
  switch (role?.toLowerCase()) {
    case 'citizen':
      return ROUTES.CITIZEN.DASHBOARD
    case 'municipality-admin':
      return ROUTES.MUNICIPALITY_ADMIN.DASHBOARD
    case 'municipality-staff':
      return ROUTES.MUNICIPALITY_STAFF.DASHBOARD
    case 'system-admin':
      return ROUTES.SYSTEM_ADMIN.DASHBOARD
    default:
      return ROUTES.HOME
  }
}