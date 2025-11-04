/**
 * @fileoverview Example test file for API utilities
 * This demonstrates how to write tests for the codebase
 */

import { validateEmail, sanitizeEmail, createErrorResponse } from '@/lib/api-utils'

describe('API Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const result = validateEmail('test@example.com')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid email addresses', () => {
      const result = validateEmail('invalid-email')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject empty email', () => {
      const result = validateEmail('')
      expect(result.isValid).toBe(false)
    })

    it('should reject email without @ symbol', () => {
      const result = validateEmail('testexample.com')
      expect(result.isValid).toBe(false)
    })
  })

  describe('sanitizeEmail', () => {
    it('should sanitize email addresses', () => {
      const sanitized = sanitizeEmail('  TEST@EXAMPLE.COM  ')
      expect(sanitized).toBe('test@example.com')
    })

    it('should handle null/undefined', () => {
      expect(sanitizeEmail(null as any)).toBe('')
      expect(sanitizeEmail(undefined as any)).toBe('')
    })
  })

  describe('createErrorResponse', () => {
    it('should create error response with status code', () => {
      const response = createErrorResponse('Test error', 400)
      expect(response.status).toBe(400)
    })

    it('should include error message in response', async () => {
      const response = createErrorResponse('Test error', 400)
      const data = await response.json()
      expect(data.error).toBe('Test error')
    })
  })
})

