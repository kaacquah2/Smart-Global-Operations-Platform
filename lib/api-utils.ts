/**
 * API Validation & Error Handling Utilities
 * Provides consistent validation and error responses for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { sanitizeEmail, sanitizeString } from './sanitize'

// Re-export sanitization functions for convenience
export { sanitizeEmail, sanitizeString }

export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  error: string
  message?: string
  details?: ValidationError[]
  code?: string
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  details?: ValidationError[],
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error,
      ...(details && { details }),
      ...(code && { code }),
    },
    { status }
  )
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<{ success: true; data: T; message?: string }> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  )
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate request body has required fields
 */
export function validateRequiredFields(
  body: any,
  fields: string[]
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push({
        field,
        message: `${field} is required`,
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate request body types
 */
export function validateFieldTypes(
  body: any,
  schema: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'>
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  for (const [field, type] of Object.entries(schema)) {
    if (body[field] === undefined) continue // Skip if not present

    const value = body[field]
    let isValid = false

    switch (type) {
      case 'string':
        isValid = typeof value === 'string'
        break
      case 'number':
        isValid = typeof value === 'number' && !isNaN(value)
        break
      case 'boolean':
        isValid = typeof value === 'boolean'
        break
      case 'object':
        isValid = typeof value === 'object' && !Array.isArray(value) && value !== null
        break
      case 'array':
        isValid = Array.isArray(value)
        break
    }

    if (!isValid) {
      errors.push({
        field,
        message: `${field} must be of type ${type}`,
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Parse and validate JSON request body
 */
export async function parseRequestBody<T = any>(
  request: NextRequest
): Promise<{ data: T | null; error: string | null }> {
  try {
    const body = await request.json()
    return { data: body, error: null }
  } catch (error) {
    return {
      data: null,
      error: 'Invalid JSON in request body',
    }
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' }
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  return { isValid: true }
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): { isValid: boolean; error?: string } {
  if (!uuid || typeof uuid !== 'string') {
    return { isValid: false, error: 'UUID is required' }
  }

  if (!isValidUUID(uuid)) {
    return { isValid: false, error: 'Invalid UUID format' }
  }

  return { isValid: true }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' }
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' }
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' }
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' }
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*)' }
  }

  return { isValid: true }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Handle API route errors consistently
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error('API Error:', error)

  if (error instanceof Error) {
    // Handle known error types
    if (error.message.includes('Unauthorized') || error.message.includes('auth')) {
      return createErrorResponse('Unauthorized', 401, undefined, 'UNAUTHORIZED')
    }

    if (error.message.includes('Not found')) {
      return createErrorResponse('Resource not found', 404, undefined, 'NOT_FOUND')
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return createErrorResponse(error.message, 400, undefined, 'VALIDATION_ERROR')
    }

    return createErrorResponse(
      error.message || 'An error occurred',
      500,
      undefined,
      'INTERNAL_ERROR'
    )
  }

  return createErrorResponse('Internal server error', 500, undefined, 'INTERNAL_ERROR')
}

