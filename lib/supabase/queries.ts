import { createClient } from './client'
import type { Database } from './database.types'

type User = Database['public']['Tables']['users']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Branch = Database['public']['Tables']['branches']['Row']
type Message = Database['public']['Tables']['messages']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']
type Workflow = Database['public']['Tables']['workflows']['Row']
type WorkSubmission = Database['public']['Tables']['work_submissions']['Row']

const supabase = createClient()

// =====================================================
// USER QUERIES
// =====================================================

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
    
    return data || null
  } catch (err) {
    console.error('Exception in getUserByEmail:', err)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching user by id:', error)
      return null
    }
    
    return data || null
  } catch (err) {
    console.error('Exception in getUserById:', err)
    return null
  }
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  return data || []
}

export async function createUser(userData: Database['public']['Tables']['users']['Insert']): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()
  
  if (error || !data) return null
  return data
}

export async function updateUser(id: string, updates: Database['public']['Tables']['users']['Update']): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error || !data) return null
  return data
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  return !error
}

// Check if a position is already filled
export async function isPositionFilled(
  position: string,
  department: string,
  branch: string,
  excludeUserId?: string
): Promise<boolean> {
  try {
    let query = supabase
      .from('users')
      .select('id')
      .eq('position', position)
      .eq('department', department)
      .eq('branch', branch)
      .eq('is_active', true)
    
    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error checking position availability:', error)
      return false // Assume available if error
    }
    
    return (data?.length || 0) > 0
  } catch (err) {
    console.error('Exception in isPositionFilled:', err)
    return false
  }
}

// =====================================================
// TASK QUERIES
// =====================================================

export async function getTasks(filters?: {
  branch?: string
  assignee_id?: string
  status?: string
  priority?: string
}): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*')
  
  if (filters?.branch) {
    query = query.eq('branch', filters.branch)
  }
  if (filters?.assignee_id) {
    query = query.eq('assignee_id', filters.assignee_id)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  return data || []
}

export async function createTask(taskData: Database['public']['Tables']['tasks']['Insert']): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single()
  
  if (error || !data) return null
  return data
}

export async function updateTask(id: string, updates: Database['public']['Tables']['tasks']['Update']): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error || !data) return null
  return data
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
  
  return !error
}

export function subscribeToTasks(callback: (payload: { eventType: string; new?: any; old?: any }) => void) {
  return supabase
    .channel('tasks_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'tasks' 
    }, (payload) => {
      callback({
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
      })
    })
    .subscribe()
}

// =====================================================
// WORK SUBMISSION QUERIES
// =====================================================

export async function getWorkSubmissions(employeeId?: string, department?: string): Promise<WorkSubmission[]> {
  let query = supabase
    .from('work_submissions')
    .select('*')
  
  if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }
  if (department) {
    query = query.eq('department', department)
  }
  
  const { data, error } = await query.order('submitted_at', { ascending: false })
  
  return data || []
}

export async function getWorkSubmissionsForReview(departmentHeadId: string) {
  // Get department head's department
  const { data: user } = await supabase
    .from('users')
    .select('department')
    .eq('id', departmentHeadId)
    .single()

  if (!user) return []

  // Get all work submissions from that department that need review
  const { data, error } = await supabase
    .from('work_submissions')
    .select(`
      *,
      employee:employee_id (
        id,
        name,
        email,
        avatar
      ),
      task:task_id (
        id,
        title,
        description
      )
    `)
    .eq('department', user.department)
    .in('status', ['submitted', 'under_review'])
    .order('submitted_at', { ascending: false })

  return data || []
}

export async function reviewWorkSubmission(
  submissionId: string,
  reviewerId: string,
  action: 'approved' | 'rejected',
  reviewNotes?: string,
  reviewRating?: number
) {
  const updateData: any = {
    status: action === 'approved' ? 'approved' : 'rejected',
    reviewer_id: reviewerId,
    reviewed_at: new Date().toISOString(),
    review_notes: reviewNotes,
    updated_at: new Date().toISOString()
  }

  if (reviewRating) {
    updateData.review_rating = reviewRating
  }

  const { data, error } = await supabase
    .from('work_submissions')
    .update(updateData)
    .eq('id', submissionId)
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// PURCHASE REQUEST QUERIES
// =====================================================

export async function getPurchaseRequests(filters?: {
  requestor_id?: string
  status?: string
  department_id?: string
}) {
  let query = supabase
    .from('purchase_requests')
    .select(`
      *,
      requestor:requestor_id (
        id,
        name,
        email,
        department,
        branch
      ),
      department:department_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.requestor_id) {
    query = query.eq('requestor_id', filters.requestor_id)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.department_id) {
    query = query.eq('department_id', filters.department_id)
  }

  const { data, error } = await query
  return data || []
}

export async function getPurchaseRequestById(id: string) {
  const { data, error } = await supabase
    .from('purchase_requests')
    .select(`
      *,
      requestor:requestor_id (
        id,
        name,
        email,
        department,
        branch
      ),
      department:department_id (
        id,
        name
      )
    `)
    .eq('id', id)
    .single()

  return data || null
}

export async function createPurchaseRequest(requestData: {
  requestor_id: string
  department_id?: string
  title: string
  description: string
  category: string
  vendor_name?: string
  vendor_contact?: string
  estimated_cost: number
  currency?: string
  justification: string
  urgency?: string
  attachments?: string[]
}) {
  const { data, error } = await supabase
    .from('purchase_requests')
    .insert({
      ...requestData,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function submitPurchaseRequest(id: string) {
  const { data, error } = await supabase
    .from('purchase_requests')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function reviewPurchaseRequest(
  id: string,
  reviewerId: string,
  action: 'approved' | 'rejected' | 'requested_changes',
  reviewNotes?: string
) {
  const { data: request } = await supabase
    .from('purchase_requests')
    .select('status')
    .eq('id', id)
    .single()

  if (!request) throw new Error('Purchase request not found')

  let newStatus = request.status

  // Workflow progression
  if (action === 'approved') {
    if (request.status === 'submitted' || request.status === 'draft') {
      newStatus = 'finance_review'
    } else if (request.status === 'finance_review') {
      newStatus = 'procurement_review'
    } else if (request.status === 'procurement_review') {
      newStatus = 'legal_review'
    } else if (request.status === 'legal_review') {
      newStatus = 'audit_review'
    } else if (request.status === 'audit_review') {
      newStatus = 'approved'
    }
  } else {
    newStatus = 'rejected'
  }

  const { data, error } = await supabase
    .from('purchase_requests')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Log workflow action
  await supabase.from('purchase_workflow_log').insert({
    purchase_request_id: id,
    stage: newStatus,
    reviewer_id: reviewerId,
    action,
    comments: reviewNotes,
    reviewed_at: new Date().toISOString()
  })

  return data
}

export async function getPurchaseWorkflowLog(purchaseRequestId: string) {
  const { data, error } = await supabase
    .from('purchase_workflow_log')
    .select(`
      *,
      reviewer:reviewer_id (
        id,
        name,
        email
      )
    `)
    .eq('purchase_request_id', purchaseRequestId)
    .order('reviewed_at', { ascending: true })

  return data || []
}

export function subscribeToPurchaseRequests(callback: (payload: { eventType: string; new?: any; old?: any }) => void) {
  return supabase
    .channel('purchase_requests_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'purchase_requests' 
    }, (payload) => {
      callback({
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
      })
    })
    .subscribe()
}

// =====================================================
// DEPARTMENT QUERIES
// =====================================================

export async function getDepartmentById(id: string) {
  const { data, error } = await supabase
    .from('departments')
    .select(`
      *,
      head:head_id (
        id,
        name,
        email
      ),
      branch:branch_id (
        id,
        name,
        city,
        country
      )
    `)
    .eq('id', id)
    .single()

  return data || null
}

export async function getDepartmentByName(name: string, branchId?: string) {
  let query = supabase
    .from('departments')
    .select(`
      *,
      head:head_id (
        id,
        name,
        email
      ),
      branch:branch_id (
        id,
        name,
        city,
        country
      )
    `)
    .eq('name', name)

  if (branchId) {
    query = query.eq('branch_id', branchId)
  }

  const { data, error } = await query.maybeSingle()
  return data || null
}

export async function getAllDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select(`
      *,
      head:head_id (
        id,
        name,
        email
      ),
      branch:branch_id (
        id,
        name,
        city,
        country
      )
    `)
    .order('name')

  return data || []
}

// =====================================================
// BRANCH QUERIES
// =====================================================

export async function getBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('status', 'active')
    .order('name')
  
  return data || []
}

export async function getBranchStats(branchName: string) {
  // Get user count for branch
  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('branch', branchName)
    .eq('is_active', true)

  // Get task count
  const { count: taskCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('branch', branchName)

  // Get completed tasks
  const { count: completedTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('branch', branchName)
    .eq('status', 'completed')

  const efficiency = taskCount && taskCount > 0
    ? Math.round((completedTasks || 0) / taskCount * 100)
    : 0

  return {
    userCount: userCount || 0,
    taskCount: taskCount || 0,
    completedTasks: completedTasks || 0,
    efficiency
  }
}

// =====================================================
// LEAVE REQUEST QUERIES
// =====================================================

export async function getLeaveTypes() {
  const { data, error } = await supabase
    .from('leave_types')
    .select('*')
    .order('name')

  return data || []
}

export async function getLeaveBalance(userId: string) {
  const currentYear = new Date().getFullYear()
  const { data, error } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('user_id', userId)
    .eq('year', currentYear)

  return data || []
}

export async function getLeaveRequests(userId?: string, status?: string) {
  let query = supabase
    .from('leave_requests')
    .select(`
      *,
      user:user_id (
        id,
        name,
        email,
        avatar,
        department
      ),
      leave_type:leave_type_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  return data || []
}

export async function createLeaveRequest(requestData: {
  user_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  reason: string
  attachments?: string[]
}) {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert({
      ...requestData,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export function subscribeToLeaveRequests(userId: string, callback: (payload: { eventType: string; new?: any; old?: any }) => void) {
  return supabase
    .channel(`leave_requests_${userId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'leave_requests',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      callback({
        eventType: payload.eventType,
        new: payload.new,
        old: payload.old,
      })
    })
    .subscribe()
}

export async function approveLeaveRequest(requestId: string, approvedBy: string) {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function rejectLeaveRequest(requestId: string, rejectedBy: string, rejectionReason: string) {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({
      status: 'rejected',
      approved_by: rejectedBy,
      approved_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// ANNOUNCEMENTS QUERIES
// =====================================================

export async function getAnnouncements(userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('role, department, branch')
    .eq('id', userId)
    .single()

  let query = supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  const { data, error } = await query
  
  // Filter by target audience
  const filtered = (data || []).filter(announcement => {
    if (announcement.target_audience === 'all') return true
    if (announcement.target_audience === 'department' && announcement.target_department === user?.department) return true
    if (announcement.target_audience === 'branch' && announcement.target_branch === user?.branch) return true
    if (announcement.target_users && announcement.target_users.includes(userId)) return true
    return false
  })
  
  return filtered
}

export async function createAnnouncement(announcementData: {
  title: string
  content: string
  type: 'general' | 'important' | 'urgent' | 'event' | 'policy_update'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  target_audience?: 'all' | 'department' | 'branch' | 'role'
  target_department?: string
  target_branch?: string
  target_roles?: string[]
  is_pinned?: boolean
  start_date?: string
  end_date?: string
  attachments?: string[]
  created_by: string
}) {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      ...announcementData,
      priority: announcementData.priority || 'normal',
      target_audience: announcementData.target_audience || 'all',
      is_pinned: announcementData.is_pinned || false,
      start_date: announcementData.start_date || new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// EVENTS QUERIES
// =====================================================

export async function getEvents(userId: string, startDate?: string, endDate?: string) {
  const { data: user } = await supabase
    .from('users')
    .select('role, department, branch')
    .eq('id', userId)
    .single()

  let query = supabase
    .from('events')
    .select(`
      *,
      organizer:organizer_id (
        id,
        name,
        email
      )
    `)
    .order('start_time', { ascending: true })

  if (startDate) {
    query = query.gte('start_time', startDate)
  }
  if (endDate) {
    query = query.lte('start_time', endDate)
  }

  const { data, error } = await query
  
  // Filter by target audience
  const filtered = (data || []).filter(event => {
    if (event.target_audience === 'all') return true
    if (event.target_audience === 'department' && event.target_department === user?.department) return true
    if (event.target_audience === 'branch' && event.target_branch === user?.branch) return true
    if (event.target_users && event.target_users.includes(userId)) return true
    if (event.organizer_id === userId) return true
    return false
  })
  
  return filtered
}

// =====================================================
// POLICIES QUERIES
// =====================================================

export async function getPolicies() {
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .order('created_at', { ascending: false })

  return data || []
}

// =====================================================
// LEGAL & AUDIT QUERIES
// =====================================================

export async function getLegalReviews(filters?: {
  status?: string
  assigned_to?: string
}) {
  let query = supabase
    .from('legal_reviews')
    .select(`
      *,
      creator:created_by (
        id,
        name,
        email
      ),
      reviewer:reviewer_id (
        id,
        name,
        email
      ),
      assigned_user:assigned_to (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to)
  }

  const { data, error } = await query
  return data || []
}

export async function getAuditCases(filters?: {
  status?: string
  case_type?: string
  assigned_to?: string
}) {
  let query = supabase
    .from('audit_cases')
    .select(`
      *,
      creator:created_by (
        id,
        name,
        email
      ),
      assigned_user:assigned_to (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.case_type) {
    query = query.eq('case_type', filters.case_type)
  }
  if (filters?.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to)
  }

  const { data, error } = await query
  return data || []
}

// =====================================================
// TEAM MANAGEMENT QUERIES
// =====================================================

// Get team members for a manager/department head
export async function getTeamMembers(userId: string): Promise<User[]> {
  // Get users where this user is their manager
  const { data: directReports, error: directError } = await supabase
    .from('users')
    .select('*')
    .eq('manager_id', userId)
    .eq('is_active', true)
    .order('name')

  if (directError) return []

  // Also get users in same department if user is a department head
  const { data: currentUser } = await supabase
    .from('users')
    .select('department, role')
    .eq('id', userId)
    .single()

  if (currentUser?.department && (currentUser.role === 'department_head' || currentUser.role === 'manager')) {
    const { data: deptMembers, error: deptError } = await supabase
      .from('users')
      .select('*')
      .eq('department', currentUser.department)
      .eq('is_active', true)
      .neq('id', userId)
      .order('name')

    if (!deptError && deptMembers) {
      // Combine and deduplicate
      const allMembers = [...directReports, ...deptMembers]
      const uniqueMembers = allMembers.filter((member, index, self) =>
        index === self.findIndex((m) => m.id === member.id)
      )
      return uniqueMembers
    }
  }

  return directReports || []
}

// Get tasks for a team (all tasks assigned to team members)
export async function getTeamTasks(teamMemberIds: string[]) {
  if (teamMemberIds.length === 0) return []

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .in('assignee_id', teamMemberIds)
    .order('created_at', { ascending: false })

  return data || []
}
