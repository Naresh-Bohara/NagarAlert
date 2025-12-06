import { ROUTES } from '../../utils/constants/routes'

export const dashboardRoutes = {
  citizen: [
    {
      path: ROUTES.CITIZEN.DASHBOARD,
      title: 'Dashboard',
      icon: 'Dashboard',
      roles: ['citizen'],
    },
    {
      path: ROUTES.CITIZEN.REPORTS,
      title: 'My Reports',
      icon: 'FileText',
      roles: ['citizen'],
    },
    {
      path: ROUTES.CITIZEN.CREATE_REPORT,
      title: 'Report Issue',
      icon: 'PlusCircle',
      roles: ['citizen'],
    },
  ],
  'municipality-admin': [
    {
      path: ROUTES.MUNICIPALITY_ADMIN.DASHBOARD,
      title: 'Dashboard',
      icon: 'Dashboard',
      roles: ['municipality-admin'],
    },
    {
      path: ROUTES.MUNICIPALITY_ADMIN.REPORTS,
      title: 'Reports',
      icon: 'FileText',
      roles: ['municipality-admin'],
    },
    {
      path: ROUTES.MUNICIPALITY_ADMIN.USERS,
      title: 'Users',
      icon: 'Users',
      roles: ['municipality-admin'],
    },
  ],
  // Add other roles similarly
}