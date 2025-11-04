"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function RoleRedirect() {
  const router = useRouter()
  const { user, isLoggedIn } = useAuth()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth/login")
      return
    }

    if (user?.role === "admin") {
      router.push("/admin/employees")
    } else if (user?.role === "employee") {
      router.push("/employee/dashboard")
    } else if (user?.role === "department_head") {
      router.push("/department/dashboard")
    } else if (user?.role === "manager") {
      router.push("/manager/dashboard")
    } else if (user?.role === "executive") {
      router.push("/executive/dashboard")
    } else if (user?.role === "ceo") {
      router.push("/ceo/dashboard")
    }
  }, [user, isLoggedIn, router])

  return null
}
