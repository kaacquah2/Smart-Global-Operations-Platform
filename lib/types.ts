// Comprehensive type definitions for the SGOAP system
export type UserRole = "employee" | "department_head" | "manager" | "executive" | "ceo" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department: string
  branch: string
  manager_id?: string | null
  avatar?: string | null
  phone?: string | null
  position?: string | null
  hire_date?: string | null
  is_active: boolean
}

export interface DepartmentHead {
  id: string
  name: string
  department: string
  email: string
  reports_count: number
  team: User[]
}

export interface WorkSubmission {
  id: string
  employee_id: string
  title: string
  description: string
  file_urls: string[]
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected"
  submitted_at?: Date
  deadline: Date
  department: string
  task_id?: string
  comments?: WorkComment[]
}

export interface WorkComment {
  id: string
  author_id: string
  author_name: string
  content: string
  created_at: Date
}

export interface EmailMessage {
  id: string
  from_id: string
  to_id: string
  subject: string
  body: string
  sent_at: Date
  read: boolean
  attachments?: string[]
  thread_id?: string
}

export interface DepartmentData {
  id: string
  name: string
  head_id: string
  branch_id: string
  employees: User[]
  performance_rating: number
  pending_submissions: number
}

export interface AdminUser extends User {
  role: "admin"
  permissions: {
    create_users: boolean
    manage_roles: boolean
    delete_users: boolean
    view_audit_logs: boolean
  }
}

export interface CreateEmployeePayload {
  name: string
  email: string
  department: string
  branch: string
  position: string
  role: UserRole
  manager_id?: string
  hire_date: string
}
