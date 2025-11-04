/**
 * Input Sanitization Utilities
 * Provides functions to sanitize user inputs and prevent XSS attacks
 */

/**
 * Sanitize string input - remove HTML tags and dangerous characters
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')

  // Remove script tags and event handlers
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  // Trim whitespace
  sanitized = sanitized.trim()

  // Limit length (prevent DoS)
  const maxLength = 10000
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  // Remove whitespace and convert to lowercase
  return email.trim().toLowerCase()
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: string | number): number | null {
  if (typeof input === 'number') {
    return isNaN(input) ? null : input
  }

  if (typeof input !== 'string') {
    return null
  }

  const num = parseFloat(input)
  return isNaN(num) ? null : num
}

/**
 * Sanitize integer input
 */
export function sanitizeInteger(input: string | number): number | null {
  const num = sanitizeNumber(input)
  return num === null ? null : Math.floor(num)
}

/**
 * Sanitize object with string values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj } as T

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      (sanitized as any)[key] = sanitizeString(sanitized[key] as string)
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      if (Array.isArray(sanitized[key])) {
        (sanitized as any)[key] = (sanitized[key] as any[]).map((item: any) =>
          typeof item === 'string' ? sanitizeString(item) : item
        )
      } else {
        (sanitized as any)[key] = sanitizeObject(sanitized[key])
      }
    }
  }

  return sanitized
}

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(arr: string[]): string[] {
  if (!Array.isArray(arr)) {
    return []
  }

  return arr.map((item) => (typeof item === 'string' ? sanitizeString(item) : String(item)))
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }

  return text.replace(/[&<>"']/g, (char) => map[char] || char)
}

/**
 * Sanitize SQL-like patterns (basic protection)
 * Note: Always use parameterized queries with Supabase
 */
export function sanitizeSQLPattern(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Remove SQL comment patterns
  let sanitized = input.replace(/--/g, '')
  sanitized = sanitized.replace(/\/\*/g, '')
  sanitized = sanitized.replace(/\*\//g, '')

  // Remove SQL injection patterns
  sanitized = sanitized.replace(/;/g, '')
  sanitized = sanitized.replace(/'/g, "''")

  return sanitized
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    const urlObj = new URL(url)
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return null
    }
    return urlObj.toString()
  } catch {
    return null
  }
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'file'
  }

  // Remove path separators and dangerous characters
  let sanitized = filename.replace(/[\/\\\?\*\|<>:"']/g, '')

  // Remove leading dots
  sanitized = sanitized.replace(/^\.+/, '')

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255)
  }

  return sanitized || 'file'
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string): string | null {
  if (!phone || typeof phone !== 'string') {
    return null
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Basic validation (10-15 digits)
  if (digits.length < 10 || digits.length > 15) {
    return null
  }

  return digits
}

/**
 * Sanitize text for display (preserves newlines)
 */
export function sanitizeTextForDisplay(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  // Escape HTML but preserve newlines
  let sanitized = escapeHtml(text)

  // Convert newlines to <br> tags (if needed for HTML display)
  // For plain text, just return sanitized
  return sanitized
}

