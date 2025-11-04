/**
 * Bulk Operations Utilities
 * Provides utilities for performing bulk operations on users, tasks, etc.
 */

import { createClient } from '@/lib/supabase/server'
import { logActivity, ActivityActions } from '@/lib/activity-log'

export interface BulkUserCreate {
  email: string
  name: string
  role: string
  department: string
  branch: string
  position: string
  manager_id?: string
  hire_date: string
}

export interface BulkOperationResult {
  success: boolean
  total: number
  succeeded: number
  failed: number
  errors: Array<{ item: any; error: string }>
}

/**
 * Bulk create users
 * @param users - Array of user data
 * @param createdBy - Admin user ID who created these users
 * @returns Operation result
 */
export async function bulkCreateUsers(
  users: BulkUserCreate[],
  createdBy: string
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: true,
    total: users.length,
    succeeded: 0,
    failed: 0,
    errors: [],
  }

  const supabase = await createClient()

  for (const userData of users) {
    try {
      // Create auth user first
      const authResponse = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email.toLowerCase(),
          password: generateTempPassword(),
          name: userData.name,
        }),
      })

      if (!authResponse.ok) {
        const error = await authResponse.json()
        result.failed++
        result.errors.push({
          item: userData,
          error: error.error || 'Failed to create auth user',
        })
        continue
      }

      const { userId } = await authResponse.json()

      // Create user profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: userData.email.toLowerCase(),
          name: userData.name,
          role: userData.role,
          department: userData.department,
          branch: userData.branch,
          position: userData.position,
          manager_id: userData.manager_id || null,
          hire_date: userData.hire_date,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
          is_active: true,
        })
        .select()
        .single()

      if (error || !data) {
        result.failed++
        result.errors.push({
          item: userData,
          error: error?.message || 'Failed to create user profile',
        })
        continue
      }

      // Log activity
      await logActivity({
        userId: createdBy,
        action: ActivityActions.ADMIN_USER_CREATED,
        resourceType: 'user',
        resourceId: userId,
        details: { email: userData.email, name: userData.name },
      })

      result.succeeded++
    } catch (error: any) {
      result.failed++
      result.errors.push({
        item: userData,
        error: error?.message || 'Unknown error',
      })
    }
  }

  result.success = result.failed === 0
  return result
}

/**
 * Bulk update user status
 */
export async function bulkUpdateUserStatus(
  userIds: string[],
  isActive: boolean,
  updatedBy: string
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: true,
    total: userIds.length,
    succeeded: 0,
    failed: 0,
    errors: [],
  }

  const supabase = await createClient()

  for (const userId of userIds) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) {
        result.failed++
        result.errors.push({
          item: { userId },
          error: error.message,
        })
        continue
      }

      await logActivity({
        userId: updatedBy,
        action: ActivityActions.USER_UPDATED,
        resourceType: 'user',
        resourceId: userId,
        details: { isActive },
      })

      result.succeeded++
    } catch (error: any) {
      result.failed++
      result.errors.push({
        item: { userId },
        error: error?.message || 'Unknown error',
      })
    }
  }

  result.success = result.failed === 0
  return result
}

/**
 * Bulk delete users (soft delete)
 */
export async function bulkDeleteUsers(
  userIds: string[],
  deletedBy: string
): Promise<BulkOperationResult> {
  return bulkUpdateUserStatus(userIds, false, deletedBy)
}

/**
 * Bulk password reset requests
 */
export async function bulkCreatePasswordResetRequests(
  userIds: string[],
  requestedBy: string
): Promise<BulkOperationResult> {
  const result: BulkOperationResult = {
    success: true,
    total: userIds.length,
    succeeded: 0,
    failed: 0,
    errors: [],
  }

  const supabase = await createClient()

  // Get user emails
  const { data: users } = await supabase
    .from('users')
    .select('id, email, name')
    .in('id', userIds)

  if (!users) {
    result.success = false
    return result
  }

  for (const user of users) {
    try {
      const { error } = await supabase
        .from('password_reset_requests')
        .insert({
          user_id: user.id,
          user_email: user.email,
          user_name: user.name,
          status: 'pending',
        })

      if (error) {
        result.failed++
        result.errors.push({
          item: { userId: user.id, email: user.email },
          error: error.message,
        })
        continue
      }

      await logActivity({
        userId: requestedBy,
        action: ActivityActions.ADMIN_PASSWORD_RESET,
        resourceType: 'password_reset_request',
        details: { userId: user.id, email: user.email },
      })

      result.succeeded++
    } catch (error: any) {
      result.failed++
      result.errors.push({
        item: { userId: user.id },
        error: error?.message || 'Unknown error',
      })
    }
  }

  result.success = result.failed === 0
  return result
}

/**
 * Generate temporary password
 */
function generateTempPassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  
  let password = ''
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
  
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Parse CSV file for bulk user import
 */
export function parseUserCSV(csvContent: string): BulkUserCreate[] {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  
  const users: BulkUserCreate[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const user: any = {}
    
    headers.forEach((header, index) => {
      user[header] = values[index] || ''
    })
    
    if (user.email && user.name) {
      users.push({
        email: user.email,
        name: user.name,
        role: user.role || 'employee',
        department: user.department || '',
        branch: user.branch || '',
        position: user.position || '',
        manager_id: user.manager_id || undefined,
        hire_date: user.hire_date || new Date().toISOString(),
      })
    }
  }
  
  return users
}

