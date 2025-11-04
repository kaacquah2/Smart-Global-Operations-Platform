"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { RoleBasedNav } from "@/components/role-based-nav"

const performanceData = [
  { month: "Jan", performance: 78, target: 85 },
  { month: "Feb", performance: 82, target: 85 },
  { month: "Mar", performance: 88, target: 85 },
  { month: "Apr", performance: 84, target: 85 },
  { month: "May", performance: 91, target: 85 },
  { month: "Jun", performance: 94, target: 85 },
]

const tasksData = [
  { status: "Completed", value: 156 },
  { status: "In Progress", value: 89 },
  { status: "Pending", value: 34 },
]

const branchPerformance = [
  { name: "New York", completion: 94 },
  { name: "London", completion: 87 },
  { name: "Tokyo", completion: 91 },
  { name: "Sydney", completion: 85 },
  { name: "Toronto", completion: 88 },
]

const COLORS = ["#a78bfa", "#fbbf24", "#f87171"]

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth/login")
      return
    }

    // Redirect to role-specific dashboard
    if (user?.role === "admin") {
      router.push("/admin/dashboard")
    } else if (user?.role === "employee") {
      router.push("/employee/dashboard")
    } else if (user?.role === "department_head") {
      // Department heads get redirected to their department-specific dashboard
      const department = user.department || ""
      if (department.includes("Finance") || department === "Finance & Accounting") {
        router.push("/finance/dashboard")
      } else if (department.includes("Procurement") || department === "Procurement & Supply-Chain") {
        router.push("/procurement/dashboard")
      } else if (department.includes("Legal") || department === "Legal & Compliance") {
        router.push("/legal/dashboard")
      } else if (department.includes("Audit") || department === "Audit") {
        router.push("/audit/dashboard")
      } else {
        router.push("/department/dashboard")
      }
    } else if (user?.role === "manager") {
      router.push("/manager/dashboard")
    } else if (user?.role === "executive") {
      router.push("/executive/dashboard")
    } else if (user?.role === "ceo") {
      router.push("/ceo/dashboard")
    }
  }, [user, isLoggedIn, router])

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNav />
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 rounded-full bg-accent/20 mx-auto animate-spin"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    </div>
  )
}
