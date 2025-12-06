import { format, formatDistanceToNow } from 'date-fns'

// Date formatting
export const formatDate = (date, formatString = 'dd MMM yyyy') => {
  if (!date) return ''
  try {
    return format(new Date(date), formatString)
  } catch {
    return 'Invalid date'
  }
}

// Relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return ''
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return 'Invalid date'
  }
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format phone number (Indian format)
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  
  return phone
}

// Format currency (Indian Rupees)
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0'
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength).trim() + '...'
}

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Format role name (from constant to display)
export const formatRole = (role) => {
  const roleMap = {
    'citizen': 'Citizen',
    'municipality-admin': 'Municipality Admin',
    'municipality-staff': 'Municipality Staff',
    'system-admin': 'System Admin',
  }
  
  return roleMap[role] || capitalize(role?.replace(/-/g, ' ') || '')
}

// Format report status with colors
export const formatReportStatus = (status) => {
  const statusMap = {
    'pending': { label: 'Pending', color: 'warning' },
    'in-progress': { label: 'In Progress', color: 'info' },
    'resolved': { label: 'Resolved', color: 'success' },
    'rejected': { label: 'Rejected', color: 'danger' },
    'closed': { label: 'Closed', color: 'secondary' },
  }
  
  return statusMap[status] || { label: capitalize(status), color: 'secondary' }
}

// Format priority level
export const formatPriority = (priority) => {
  const priorityMap = {
    'low': { label: 'Low', color: 'success' },
    'medium': { label: 'Medium', color: 'warning' },
    'high': { label: 'High', color: 'danger' },
    'critical': { label: 'Critical', color: 'danger' },
  }
  
  return priorityMap[priority] || { label: capitalize(priority), color: 'secondary' }
}

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '??'
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

// Format address (abbreviated)
export const formatAddress = (address, maxLength = 30) => {
  if (!address) return ''
  
  if (address.length <= maxLength) return address
  
  const parts = address.split(',')
  if (parts.length > 1) {
    return parts[0] + ', ' + parts[parts.length - 1]
  }
  
  return truncateText(address, maxLength)
}