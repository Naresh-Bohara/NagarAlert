// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

// Phone number validation (Indian format)
export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

// Required field validation
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0
}

// Minimum length validation
export const validateMinLength = (value, min) => {
  return value && value.toString().length >= min
}

// Maximum length validation
export const validateMaxLength = (value, max) => {
  return value && value.toString().length <= max
}

// URL validation
export const validateUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Date validation (must be in past)
export const validatePastDate = (date) => {
  return new Date(date) < new Date()
}

// Date validation (must be in future)
export const validateFutureDate = (date) => {
  return new Date(date) > new Date()
}

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  } = options

  const errors = []

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
    errors.push(`File size must be less than ${maxSizeMB}MB`)
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`)
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    file,
  }
}

// Validation schemas for forms
export const validationSchemas = {
  login: {
    email: (value) => {
      if (!validateRequired(value)) return 'Email is required'
      if (!validateEmail(value)) return 'Please enter a valid email'
      return null
    },
    password: (value) => {
      if (!validateRequired(value)) return 'Password is required'
      if (!validateMinLength(value, 6)) return 'Password must be at least 6 characters'
      return null
    },
  },
  
  register: {
    name: (value) => {
      if (!validateRequired(value)) return 'Name is required'
      if (!validateMinLength(value, 2)) return 'Name must be at least 2 characters'
      if (!validateMaxLength(value, 50)) return 'Name must be less than 50 characters'
      return null
    },
    email: (value) => {
      if (!validateRequired(value)) return 'Email is required'
      if (!validateEmail(value)) return 'Please enter a valid email'
      return null
    },
    password: (value) => {
      if (!validateRequired(value)) return 'Password is required'
      if (!validatePassword(value)) return 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number'
      return null
    },
    confirmPassword: (value, formValues) => {
      if (!validateRequired(value)) return 'Please confirm your password'
      if (value !== formValues.password) return 'Passwords do not match'
      return null
    },
    phone: (value) => {
      if (value && !validatePhone(value)) return 'Please enter a valid phone number'
      return null
    },
  },
  
  report: {
    title: (value) => {
      if (!validateRequired(value)) return 'Title is required'
      if (!validateMinLength(value, 5)) return 'Title must be at least 5 characters'
      if (!validateMaxLength(value, 200)) return 'Title must be less than 200 characters'
      return null
    },
    description: (value) => {
      if (!validateRequired(value)) return 'Description is required'
      if (!validateMinLength(value, 10)) return 'Description must be at least 10 characters'
      if (!validateMaxLength(value, 1000)) return 'Description must be less than 1000 characters'
      return null
    },
    category: (value) => {
      if (!validateRequired(value)) return 'Category is required'
      return null
    },
  },
}