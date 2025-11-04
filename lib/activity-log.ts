/**
 * Activity Logging System
 * Provides utilities for logging user actions and system events
 */

import { createClient } from '@/lib/supabase/server'

export type ActivitySeverity = 'info' | 'warning' | 'error' | 'critical'

export interface ActivityLogInput {
  userId: string | null
  action: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  severity?: ActivitySeverity
  ipAddress?: string
  userAgent?: string
}

/**
 * Log an activity to the database
 * @param input - Activity log input data
 * @returns Log ID if successful, null otherwise
 */
export async function logActivity(input: ActivityLogInput): Promise<string | null> {
  try {
    const supabase = await createClient()

    // Extract IP and user agent from request if available
    const { data, error } = await supabase.rpc('log_activity', {
      p_user_id: input.userId,
      p_action: input.action,
      p_resource_type: input.resourceType || null,
      p_resource_id: input.resourceId || null,
      p_details: input.details || {},
      p_severity: input.severity || 'info',
    })

    if (error) {
      console.error('Error logging activity:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error logging activity:', error)
    return null
  }
}

/**
 * Log activity from API route (server-side)
 * Automatically extracts IP address and user agent from request
 */
export async function logActivityFromRequest(
  request: Request,
  input: Omit<ActivityLogInput, 'ipAddress' | 'userAgent'>
): Promise<string | null> {
  const ipAddress = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'

  return logActivity({
    ...input,
    ipAddress,
    userAgent,
  })
}

/**
 * Common activity actions
 */
export const ActivityActions = {
  // User actions
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_PASSWORD_RESET: 'user.password_reset',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  
  // Admin actions
  ADMIN_PASSWORD_RESET: 'admin.password_reset',
  ADMIN_USER_CREATED: 'admin.user_created',
  ADMIN_USER_DELETED: 'admin.user_deleted',
  ADMIN_SETTINGS_CHANGED: 'admin.settings_changed',
  
  // Purchase request actions
  PURCHASE_REQUEST_CREATED: 'purchase_request.created',
  PURCHASE_REQUEST_APPROVED: 'purchase_request.approved',
  PURCHASE_REQUEST_REJECTED: 'purchase_request.rejected',
  
  // Task actions
  TASK_CREATED: 'task.created',
  TASK_COMPLETED: 'task.completed',
  TASK_ASSIGNED: 'task.assigned',
  
  // System actions
  SYSTEM_ERROR: 'system.error',
  SYSTEM_WARNING: 'system.warning',
} as const

/**
 * Helper to create activity log with common patterns
 */
export const ActivityLogger = {
  async userLogin(userId: string, ipAddress?: string, userAgent?: string) {
    return logActivity({
      userId,
      action: ActivityActions.USER_LOGIN,
      severity: 'info',
      ipAddress,
      userAgent,
    })
  },

  async userLogout(userId: string) {
    return logActivity({
      userId,
      action: ActivityActions.USER_LOGOUT,
      severity: 'info',
    })
  },

  async adminAction(adminId: string, action: string, details?: Record<string, any>) {
    return logActivity({
      userId: adminId,
      action,
      severity: 'warning',
      details,
    })
  },

  async criticalAction(userId: string | null, action: string, details?: Record<string, any>) {
    return logActivity({
      userId,
      action,
      severity: 'critical',
      details,
    })
  },
}

