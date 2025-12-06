export const USER_ROLES = {
  CITIZEN: 'citizen',
  MUNICIPALITY_ADMIN: 'municipality-admin',
  MUNICIPALITY_STAFF: 'municipality-staff',
  SYSTEM_ADMIN: 'system-admin',
}

export const ROLE_LABELS = {
  [USER_ROLES.CITIZEN]: 'Citizen',
  [USER_ROLES.MUNICIPALITY_ADMIN]: 'Municipality Admin',
  [USER_ROLES.MUNICIPALITY_STAFF]: 'Municipality Staff',
  [USER_ROLES.SYSTEM_ADMIN]: 'System Admin',
}

export const ROLE_HIERARCHY = {
  [USER_ROLES.CITIZEN]: 1,
  [USER_ROLES.MUNICIPALITY_STAFF]: 2,
  [USER_ROLES.MUNICIPALITY_ADMIN]: 3,
  [USER_ROLES.SYSTEM_ADMIN]: 4,
}

// Permissions for each role
export const ROLE_PERMISSIONS = {
  [USER_ROLES.CITIZEN]: [
    'view_dashboard',
    'create_report',
    'view_own_reports',
    'comment_on_reports',
    'upvote_reports',
    'view_rewards',
    'redeem_rewards',
    'edit_profile',
  ],
  
  [USER_ROLES.MUNICIPALITY_STAFF]: [
    'view_dashboard',
    'view_assigned_reports',
    'update_report_status',
    'add_comments',
    'upload_media',
    'view_citizen_profiles',
    'edit_profile',
  ],
  
  [USER_ROLES.MUNICIPALITY_ADMIN]: [
    'view_dashboard',
    'manage_reports',
    'manage_staff',
    'view_analytics',
    'manage_categories',
    'assign_reports',
    'export_data',
    'view_all_users',
    'manage_municipality_settings',
  ],
  
  [USER_ROLES.SYSTEM_ADMIN]: [
    'view_dashboard',
    'manage_municipalities',
    'manage_all_users',
    'view_system_logs',
    'manage_system_settings',
    'manage_roles',
    'backup_restore',
    'view_all_analytics',
  ],
}

// Check if user has specific permission
export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || []
  return permissions.includes(permission)
}

// Check if user can access role-based route
export const canAccess = (userRole, targetRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[targetRole]
}

// Get readable role name
export const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || 'Unknown Role'
}