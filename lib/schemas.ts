/**
 * Zod Schemas for Type Safety
 * Centralized validation schemas for API requests and forms
 */

import { z } from 'zod'

// User schemas
export const userCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['employee', 'department_head', 'manager', 'executive', 'ceo', 'admin']),
  department: z.string().uuid('Invalid department ID'),
  branch: z.string().uuid('Invalid branch ID'),
  position: z.string().min(1, 'Position is required'),
  manager_id: z.string().uuid().optional().nullable(),
  hire_date: z.string().datetime('Invalid hire date'),
})

export const userUpdateSchema = userCreateSchema.partial()

export const userBulkCreateSchema = z.array(userCreateSchema)

// Password reset schemas
export const passwordResetRequestSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  processedBy: z.string().uuid('Invalid user ID'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// 2FA schemas
export const setup2FASchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})

export const verify2FASchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  token: z.string().length(6, 'Token must be 6 digits').optional(),
  backupCode: z.string().min(8, 'Invalid backup code').optional(),
}).refine(data => data.token || data.backupCode, {
  message: 'Either token or backupCode must be provided',
})

export const enable2FASchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  verificationToken: z.string().length(6, 'Token must be 6 digits'),
})

// Activity log schemas
export const activityLogSchema = z.object({
  userId: z.string().uuid().nullable(),
  action: z.string().min(1, 'Action is required'),
  resourceType: z.string().optional(),
  resourceId: z.string().uuid().optional(),
  details: z.record(z.string(), z.any()).optional(),
  severity: z.enum(['info', 'warning', 'error', 'critical']).optional(),
})

// Search schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  entityType: z.enum(['user', 'task', 'purchase_request', 'all']).optional(),
  status: z.string().optional(),
  department: z.string().uuid().optional(),
  branch: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  role: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
})

// Bulk operations schemas
export const bulkUserCreateSchema = z.array(
  z.object({
    email: z.string().email(),
    name: z.string().min(2),
    role: z.string(),
    department: z.string(),
    branch: z.string(),
    position: z.string(),
    manager_id: z.string().optional(),
    hire_date: z.string(),
  })
)

export const bulkUpdateStatusSchema = z.object({
  userIds: z.array(z.string().uuid()),
  isActive: z.boolean(),
})

// Export schemas
export const exportOptionsSchema = z.object({
  filename: z.string().optional(),
  includeHeaders: z.boolean().optional(),
  format: z.enum(['csv', 'excel']).optional(),
})

// Type inference helpers
export type UserCreate = z.infer<typeof userCreateSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>
export type ForgotPassword = z.infer<typeof forgotPasswordSchema>
export type Setup2FA = z.infer<typeof setup2FASchema>
export type Verify2FA = z.infer<typeof verify2FASchema>
export type ActivityLog = z.infer<typeof activityLogSchema>
export type SearchFilters = z.infer<typeof searchSchema>
export type BulkUserCreate = z.infer<typeof bulkUserCreateSchema>
export type BulkUpdateStatus = z.infer<typeof bulkUpdateStatusSchema>
export type ExportOptions = z.infer<typeof exportOptionsSchema>

