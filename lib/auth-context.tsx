"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { getUserByEmail, getUserById, getAllUsers, createUser, updateUser, deleteUser } from "@/lib/supabase/queries"
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
      if (session?.user?.id) {
        // Use user ID directly - faster than email lookup
        const userData = await getUserById(session.user.id)
        if (userData) {
          setUser(userData)
          setIsLoggedIn(true)
        }
      } else if (session?.user?.email) {
        // Fallback to email lookup if ID not available
        const userData = await getUserByEmail(session.user.email)
        if (userData) {
          setUser(userData)
          setIsLoggedIn(true)
        }
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user?.id) {
          const userData = await getUserById(session.user.id)
          if (userData) {
            setUser(userData)
            setIsLoggedIn(true)
          } else {
            setUser(null)
            setIsLoggedIn(false)
          }
        } else if (session?.user?.email) {
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
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Login request timed out. Please try again.")), 10000)
      )

      const signInPromise = supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      })

      const result = await Promise.race([
        signInPromise,
        timeoutPromise.then(() => ({ data: null, error: { message: 'Timeout' } }))
      ]) as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>

      const { data, error } = result

      if (error) {
        throw new Error(error.message || "Invalid email or password")
      }

      if (data.user?.id) {
        // Use user ID directly - faster than email lookup
        const userDataPromise = getUserById(data.user.id)
        const userDataTimeout = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("User data fetch timed out. Please try again.")), 5000)
        )
        const userData = await Promise.race([
          userDataPromise,
          userDataTimeout.then(() => null)
        ]) as Awaited<ReturnType<typeof getUserById>>
        
        if (!userData) {
          await supabase.auth.signOut()
          throw new Error("User profile not found")
        }
        setUser(userData)
        setIsLoggedIn(true)
      } else if (data.user?.email) {
        // Fallback to email lookup if ID not available
        const userDataPromise = getUserByEmail(data.user.email)
        const userDataTimeout = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("User data fetch timed out. Please try again.")), 5000)
        )
        const userData = await Promise.race([
          userDataPromise,
          userDataTimeout.then(() => null)
        ]) as Awaited<ReturnType<typeof getUserByEmail>>
        
        if (!userData) {
          await supabase.auth.signOut()
          throw new Error("User profile not found")
        }
        setUser(userData)
        setIsLoggedIn(true)
      }
    } catch (err) {
      // Re-throw error with better message
      if (err instanceof Error) {
        throw err
      }
      throw new Error("Login failed. Please check your connection and try again.")
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
