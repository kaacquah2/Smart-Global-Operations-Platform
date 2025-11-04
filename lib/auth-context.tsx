"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getUserByEmail, getAllUsers, createUser, updateUser, deleteUser } from "@/lib/supabase/queries"
import type { User, UserRole, CreateEmployeePayload } from "./types"

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasAccess: (requiredRoles: UserRole[]) => boolean
  canView: (resource: "branch" | "department", resourceId: string) => boolean
  setUser: (user: User) => void
  createEmployee: (payload: CreateEmployeePayload) => Promise<User>
  getAllUsers: () => Promise<User[]>
  deleteUser: (userId: string) => Promise<void>
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  // Load user session on mount
  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        const userData = await getUserByEmail(session.user.email)
        if (userData) {
          setUser(userData)
          setIsLoggedIn(true)
        }
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user?.email) {
          const userData = await getUserByEmail(session.user.email)
          if (userData) {
            setUser(userData)
            setIsLoggedIn(true)
          } else {
            setUser(null)
            setIsLoggedIn(false)
          }
        } else {
          setUser(null)
          setIsLoggedIn(false)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    loadSession()
  }, [supabase])

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    })

    if (error) {
      throw new Error(error.message || "Invalid email or password")
    }

    if (data.user?.email) {
      const userData = await getUserByEmail(data.user.email)
      if (!userData) {
        await supabase.auth.signOut()
        throw new Error("User profile not found")
      }
      setUser(userData)
      setIsLoggedIn(true)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsLoggedIn(false)
  }

  const hasAccess = (requiredRoles: UserRole[]) => {
    if (!user) return false
    return requiredRoles.includes(user.role)
  }

  const canView = (resource: "branch" | "department", resourceId: string) => {
    if (!user) return false
    if (user.role === "ceo" || user.role === "admin") return true

    if (resource === "branch") {
      return user.branch === resourceId || user.role === "executive"
    }

    if (resource === "department") {
      return user.department === resourceId || user.role === "manager" || user.role === "executive"
    }

    return false
  }

  const createEmployee = async (payload: CreateEmployeePayload): Promise<User> => {
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can create employees")
    }

    // Generate a secure temporary password
    const generateTempPassword = () => {
      const length = 12
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
      let password = ''
      
      // Ensure at least one of each required type
      password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
      password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
      password += '0123456789'[Math.floor(Math.random() * 10)]
      password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
      
      for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)]
      }
      
      return password.split('').sort(() => Math.random() - 0.5).join('')
    }

    const tempPassword = generateTempPassword()

    // Create auth user using Admin API via server action
    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email.toLowerCase(),
        password: tempPassword,
        name: payload.name,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create auth user' }))
      throw new Error(errorData.error || 'Failed to create auth user')
    }

    const { userId } = await response.json()

    if (!userId) {
      throw new Error("Failed to create user")
    }

    // Then create user profile
    const newUser = await createUser({
      id: userId,
      email: payload.email.toLowerCase(),
      name: payload.name,
      role: payload.role,
      department: payload.department,
      branch: payload.branch,
      position: payload.position,
      manager_id: payload.manager_id || null,
      hire_date: payload.hire_date,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.name}`,
      phone: null,
      is_active: true,
    })

    if (!newUser) {
      throw new Error("Failed to create user profile")
    }

    // Send credentials email
    try {
      await fetch('/api/send-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: payload.email.toLowerCase(),
          name: payload.name,
          tempPassword: tempPassword,
        }),
      })
    } catch (emailError) {
      // Don't fail employee creation if email fails, but log it
      console.error('Failed to send credentials email:', emailError)
      // In production, you might want to queue this for retry
    }

    return newUser
  }

  const getAllUsersList = async (): Promise<User[]> => {
    return await getAllUsers()
  }

  const deleteUserHandler = async (userId: string) => {
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can delete users")
    }

    await deleteUser(userId)
  }

  const updateUserHandler = async (userId: string, updates: Partial<User>) => {
    if (!user || user.role !== "admin") {
      throw new Error("Only admins can update users")
    }

    await updateUser(userId, updates)
    if (userId === user.id) {
      const updatedUser = await getUserByEmail(user.email)
      if (updatedUser) {
        setUser(updatedUser)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        logout,
        hasAccess,
        canView,
        setUser,
        createEmployee,
        getAllUsers: getAllUsersList,
        deleteUser: deleteUserHandler,
        updateUser: updateUserHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
