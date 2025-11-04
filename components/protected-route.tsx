"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/types"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: UserRole[]
  requiredBranch?: string
  requiredDepartment?: string
  fallback?: ReactNode
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requiredBranch,
  requiredDepartment,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    router.push("/auth/login")
    return fallback || null
  }

  // Check role access
  if (requiredRoles && !requiredRoles.includes(user?.role!)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <button onClick={() => router.back()} className="text-accent hover:underline">
            Go back
          </button>
        </div>
      </div>
    )
  }

  // Check branch access
  if (requiredBranch && user?.branch !== requiredBranch && user?.role !== "ceo" && user?.role !== "executive") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Branch Access Denied</h1>
          <p className="text-muted-foreground mb-4">You only have access to {user?.branch} branch.</p>
        </div>
      </div>
    )
  }

  // Check department access
  if (
    requiredDepartment &&
    user?.department !== requiredDepartment &&
    user?.role !== "ceo" &&
    user?.role !== "executive" &&
    user?.role !== "manager"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Department Access Denied</h1>
          <p className="text-muted-foreground mb-4">You only have access to {user?.department} department.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook for programmatic access checks
export function useAccessControl() {
  const { user } = useAuth()

  const canAccessBranch = (branchId: string): boolean => {
    if (!user) return false
    if (user.role === "ceo" || user.role === "executive") return true
    return user.branch === branchId
  }

  const canAccessDepartment = (deptId: string): boolean => {
    if (!user) return false
    if (user.role === "ceo" || user.role === "executive" || user.role === "manager") return true
    if (user.role === "department_head") return user.department === deptId
    return user.department === deptId
  }

  const canManageUsers = (): boolean => {
    return user?.role === "ceo" || user?.role === "executive" || user?.role === "manager"
  }

  const canReviewWork = (): boolean => {
    return (
      user?.role === "ceo" || user?.role === "executive" || user?.role === "manager" || user?.role === "department_head"
    )
  }

  const canSubmitWork = (): boolean => {
    return user?.role === "employee"
  }

  return {
    canAccessBranch,
    canAccessDepartment,
    canManageUsers,
    canReviewWork,
    canSubmitWork,
  }
}
