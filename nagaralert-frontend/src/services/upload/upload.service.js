/**
 * Simple Upload Service for NagarAlert
 */

// Create preview URL
export const createPreviewUrl = (file) => {
  if (!file) return ''
  return URL.createObjectURL(file)
}

// Clean up preview URLs
export const revokePreviewUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

// Basic file validation (matches your backend)
export const validateFile = (file, type = 'image') => {
  const errors = []
  
  if (!file) {
    errors.push('No file selected')
    return { isValid: false, errors }
  }
  
  // Check file size based on type
  let maxSize = 5 * 1024 * 1024 // 5MB default
  
  if (type === 'video') maxSize = 50 * 1024 * 1024 // 50MB
  if (type === 'document') maxSize = 10 * 1024 * 1024 // 10MB
  
  if (file.size > maxSize) {
    errors.push(`File too large. Max ${maxSize / (1024 * 1024)}MB`)
  }
  
  // Check file type
  if (type === 'image' && !file.type.startsWith('image/')) {
    errors.push('Only image files allowed')
  }
  
  if (type === 'video' && !file.type.startsWith('video/')) {
    errors.push('Only video files allowed')
  }
  
  if (type === 'document' && !file.type.includes('pdf') && !file.type.includes('document')) {
    errors.push('Only PDF/DOC files allowed')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    file
  }
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' Bytes'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Get file icon
export const getFileIcon = (file) => {
  if (file.type.startsWith('image/')) return '🖼️'
  if (file.type.startsWith('video/')) return '🎥'
  if (file.type.includes('pdf')) return '📄'
  return '📎'
}