export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'employee' | 'department_head' | 'manager' | 'executive' | 'ceo' | 'admin'
          department: string
          branch: string
          manager_id: string | null
          avatar: string | null
          phone: string | null
          position: string | null
          hire_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'employee' | 'department_head' | 'manager' | 'executive' | 'ceo' | 'admin'
          department: string
          branch: string
          manager_id?: string | null
          avatar?: string | null
          phone?: string | null
          position?: string | null
          hire_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'employee' | 'department_head' | 'manager' | 'executive' | 'ceo' | 'admin'
          department?: string
          branch?: string
          manager_id?: string | null
          avatar?: string | null
          phone?: string | null
          position?: string | null
          hire_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      branches: {
        Row: {
          id: string
          name: string
          country: string
          city: string
          manager_id: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          city: string
          manager_id?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          city?: string
          manager_id?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'critical'
          branch: string
          assignee_id: string | null
          assignee_name: string | null
          due_date: string
          progress: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          branch: string
          assignee_id?: string | null
          assignee_name?: string | null
          due_date: string
          progress?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          branch?: string
          assignee_id?: string | null
          assignee_name?: string | null
          due_date?: string
          progress?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          sender_name: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          sender_name: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          sender_name?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          name: string
          is_group: boolean
          participants: string[]
          last_message_id: string | null
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          is_group?: boolean
          participants: string[]
          last_message_id?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_group?: boolean
          participants?: string[]
          last_message_id?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'alert' | 'update' | 'message' | 'achievement'
          title: string
          description: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'alert' | 'update' | 'message' | 'achievement'
          title: string
          description: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'alert' | 'update' | 'message' | 'achievement'
          title?: string
          description?: string
          read?: boolean
          created_at?: string
        }
      }
      workflows: {
        Row: {
          id: string
          name: string
          description: string
          trigger: string
          actions: string[]
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          trigger: string
          actions: string[]
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          trigger?: string
          actions?: string[]
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      work_submissions: {
        Row: {
          id: string
          employee_id: string
          title: string
          description: string
          file_urls: string[]
          status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          submitted_at: string | null
          deadline: string
          department: string
          task_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          title: string
          description: string
          file_urls?: string[]
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          submitted_at?: string | null
          deadline: string
          department: string
          task_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          title?: string
          description?: string
          file_urls?: string[]
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          submitted_at?: string | null
          deadline?: string
          department?: string
          task_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          head_id: string | null
          branch_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          head_id?: string | null
          branch_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          head_id?: string | null
          branch_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'employee' | 'department_head' | 'manager' | 'executive' | 'ceo' | 'admin'
      task_status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
      task_priority: 'low' | 'medium' | 'high' | 'critical'
      notification_type: 'alert' | 'update' | 'message' | 'achievement'
    }
  }
}

