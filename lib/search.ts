/**
 * Advanced Search & Filtering Utilities
 * Provides search functionality across multiple entities
 */

import { createClient } from '@/lib/supabase/server'

export interface SearchFilters {
  query?: string
  entityType?: 'user' | 'task' | 'purchase_request' | 'all'
  status?: string
  department?: string
  branch?: string
  dateFrom?: string
  dateTo?: string
  role?: string
  limit?: number
  offset?: number
}

export interface SearchResult {
  users?: any[]
  tasks?: any[]
  purchaseRequests?: any[]
  total: number
}

/**
 * Full-text search across multiple entities
 */
export async function advancedSearch(filters: SearchFilters): Promise<SearchResult> {
  const supabase = await createClient()
  const result: SearchResult = {
    total: 0,
  }

  const { query, entityType = 'all', limit = 20, offset = 0 } = filters

  try {
    // Search users
    if (entityType === 'all' || entityType === 'user') {
      let userQuery = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      if (query) {
        userQuery = userQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%,position.ilike.%${query}%`)
      }

      if (filters.department) {
        userQuery = userQuery.eq('department', filters.department)
      }

      if (filters.branch) {
        userQuery = userQuery.eq('branch', filters.branch)
      }

      if (filters.role) {
        userQuery = userQuery.eq('role', filters.role)
      }

      const { data: users, count: userCount } = await userQuery
        .range(offset, offset + limit - 1)

      result.users = users || []
      result.total += userCount || 0
    }

    // Search tasks
    if (entityType === 'all' || entityType === 'task') {
      let taskQuery = supabase
        .from('tasks')
        .select('*', { count: 'exact' })

      if (query) {
        taskQuery = taskQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      }

      if (filters.status) {
        taskQuery = taskQuery.eq('status', filters.status)
      }

      if (filters.department) {
        taskQuery = taskQuery.eq('department', filters.department)
      }

      const { data: tasks, count: taskCount } = await taskQuery
        .range(offset, offset + limit - 1)

      result.tasks = tasks || []
      result.total += taskCount || 0
    }

    // Search purchase requests
    if (entityType === 'all' || entityType === 'purchase_request') {
      let purchaseQuery = supabase
        .from('purchase_requests')
        .select('*', { count: 'exact' })

      if (query) {
        purchaseQuery = purchaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,vendor_name.ilike.%${query}%`)
      }

      if (filters.status) {
        purchaseQuery = purchaseQuery.eq('status', filters.status)
      }

      if (filters.dateFrom) {
        purchaseQuery = purchaseQuery.gte('created_at', filters.dateFrom)
      }

      if (filters.dateTo) {
        purchaseQuery = purchaseQuery.lte('created_at', filters.dateTo)
      }

      const { data: purchaseRequests, count: purchaseCount } = await purchaseQuery
        .range(offset, offset + limit - 1)

      result.purchaseRequests = purchaseRequests || []
      result.total += purchaseCount || 0
    }

    return result
  } catch (error) {
    console.error('Search error:', error)
    return result
  }
}

/**
 * Search users with filters
 */
export async function searchUsers(filters: SearchFilters) {
  return advancedSearch({ ...filters, entityType: 'user' })
}

/**
 * Search tasks with filters
 */
export async function searchTasks(filters: SearchFilters) {
  return advancedSearch({ ...filters, entityType: 'task' })
}

/**
 * Search purchase requests with filters
 */
export async function searchPurchaseRequests(filters: SearchFilters) {
  return advancedSearch({ ...filters, entityType: 'purchase_request' })
}

