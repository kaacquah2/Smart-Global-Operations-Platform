/**
 * Form Validation Utilities
 * Client-side validation helpers for forms
 */

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Validate form field
 */
export function validateField(
  value: any,
  rules: ValidationRule,
  fieldName?: string
): string | null {
  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    return rules.message || `${fieldName || 'Field'} is required`
  }

  // Skip other validations if field is empty and not required
  if (!rules.required && (value === undefined || value === null || value === '')) {
    return null
  }

  // Type check
  if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) {
    return rules.message || `${fieldName || 'Field'} must be at least ${rules.minLength} characters`
  }

  if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) {
    return rules.message || `${fieldName || 'Field'} must be no more than ${rules.maxLength} characters`
  }

  // Pattern check
  if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
    return rules.message || `${fieldName || 'Field'} format is invalid`
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value)
    if (customError) {
      return customError
    }
  }

  return null
}

/**
 * Validate form data
 */
export function validateForm(
  data: Record<string, any>,
  schema: Record<string, ValidationRule>
): ValidationResult {
  const errors: Record<string, string> = {}

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules, field)
    if (error) {
      errors[field] = error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  } as ValidationRule,

  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  } as ValidationRule,

  required: {
    required: true,
  } as ValidationRule,

  optional: {
    required: false,
  } as ValidationRule,

  phone: {
    pattern: /^[\d\s\-\(\)\+]{10,}$/,
    message: 'Please enter a valid phone number',
  } as ValidationRule,

  url: {
    pattern: /^https?:\/\/.+/,
    message: 'Please enter a valid URL',
  } as ValidationRule,

  uuid: {
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    message: 'Invalid UUID format',
  } as ValidationRule,

  positiveNumber: {
    custom: (value: any) => {
      const num = parseFloat(value)
      if (isNaN(num) || num <= 0) {
        return 'Must be a positive number'
      }
      return null
    },
  } as ValidationRule,

  nonNegativeNumber: {
    custom: (value: any) => {
      const num = parseFloat(value)
      if (isNaN(num) || num < 0) {
        return 'Must be a non-negative number'
      }
      return null
    },
  } as ValidationRule,
}

/**
 * Debounce function for input validation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Format validation error for display
 */
export function formatValidationError(field: string, errors: Record<string, string>): string | null {
  return errors[field] || null
}

/**
 * Check if form has errors
 */
export function hasFormErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Get first error message
 */
export function getFirstError(errors: Record<string, string>): string | null {
  const firstKey = Object.keys(errors)[0]
  return firstKey ? errors[firstKey] : null
}

/**
 * Clear field error
 */
export function clearFieldError(
  errors: Record<string, string>,
  field: string
): Record<string, string> {
  const newErrors = { ...errors }
  delete newErrors[field]
  return newErrors
}

