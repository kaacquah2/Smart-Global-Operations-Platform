"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Workflow,
  Mail,
  Layers,
  Lock,
  Calendar,
  Megaphone,
  Building2,
  ShoppingCart,
  DollarSign,
  Package,
  Scale,
  Shield,
  Activity,
  Clock,
  Plug,
} from "lucide-react"
import { useState } from "react"
import { GlobalSearch } from "@/components/global-search"
import { APP_NAME } from "@/lib/constants"

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  roles: UserRole[]
  condition?: (user: any) => boolean
}

const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
    href: "/dashboard",
    roles: ["employee", "department_head", "manager", "executive", "ceo", "admin"],
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: "Submit Work",
    href: "/employee/submit-work",
    roles: ["employee"],
  },
  {
    icon: <Layers className="h-5 w-5" />,
    label: "My Submissions",
    href: "/employee/my-submissions",
    roles: ["employee"],
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "My Department",
    href: "/employee/my-department",
    roles: ["employee"],
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: "Reviews",
    href: "/department/reviews",
    roles: ["department_head", "manager", "executive", "ceo", "admin"],
  },
  {
    icon: <ShoppingCart className="h-5 w-5" />,
    label: "Purchases",
    href: "/purchases",
    roles: ["department_head", "manager", "executive", "ceo", "admin"],
  },
  {
    icon: <DollarSign className="h-5 w-5" />,
    label: "Finance",
    href: "/finance/dashboard",
    roles: ["department_head", "manager", "executive", "ceo", "admin"],
    condition: (user) => user?.department?.includes("Finance") || user?.department === "Finance & Accounting",
  },
  {
    icon: <Package className="h-5 w-5" />,
    label: "Procurement",
    href: "/procurement/dashboard",
    roles: ["department_head", "manager", "executive", "ceo", "admin"],
    condition: (user) => user?.department?.includes("Procurement") || user?.department === "Procurement & Supply-Chain",
  },
  {
    icon: <Scale className="h-5 w-5" />,
    label: "Legal",
    href: "/legal/dashboard",
    roles: ["department_head", "manager", "executive", "ceo", "admin"],
    condition: (user) => user?.department?.includes("Legal") || user?.department === "Legal & Compliance",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    label: "Audit",
    href: "/audit/dashboard",
    roles: ["department_head", "manager", "executive", "ceo", "admin"],
    condition: (user) => user?.department?.includes("Audit"),
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Analytics",
    href: "/analytics",
    roles: ["manager", "executive", "ceo", "admin"],
  },
  {
    icon: <Workflow className="h-5 w-5" />,
    label: "Workflows",
    href: "/workflows",
    roles: ["manager", "executive", "ceo", "admin"],
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    label: "Leave",
    href: "/leave",
    roles: ["employee", "department_head", "manager", "executive", "ceo", "admin"],
  },
  {
    icon: <Mail className="h-5 w-5" />,
    label: "Messages",
    href: "/messages",
    roles: ["employee", "department_head", "manager", "executive", "ceo", "admin"],
  },
  {
    icon: <Megaphone className="h-5 w-5" />,
    label: "Announcements",
    href: "/announcements",
    roles: ["employee", "department_head", "manager", "executive", "ceo", "admin"],
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    label: "Organization",
    href: "/organization",
    roles: ["employee", "department_head", "manager", "executive", "ceo", "admin"],
  },
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Admin Dashboard",
    href: "/admin/dashboard",
    roles: ["admin"],
  },
  {
    icon: <Lock className="h-5 w-5" />,
    label: "Employees",
    href: "/admin/employees",
    roles: ["admin", "executive", "ceo"],
  },
  {
    icon: <Activity className="h-5 w-5" />,
    label: "Activity Logs",
    href: "/admin/activity-logs",
    roles: ["admin"],
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "User Activity",
    href: "/admin/user-activity",
    roles: ["admin"],
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: "Reports",
    href: "/admin/reports",
    roles: ["admin", "executive", "ceo"],
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: "System Settings",
    href: "/admin/system-settings",
    roles: ["admin"],
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: "Attendance",
    href: "/attendance",
    roles: ["employee", "department_head", "manager", "executive", "ceo", "admin"],
  },
  {
    icon: <Package className="h-5 w-5" />,
    label: "Assets",
    href: "/assets",
    roles: ["employee", "department_head", "manager", "executive", "ceo", "admin"],
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    label: "Vendors",
    href: "/vendors",
    roles: ["department_head", "manager", "executive", "ceo", "admin"],
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Advanced Analytics",
    href: "/admin/analytics",
    roles: ["admin", "executive", "ceo"],
  },
  {
    icon: <Plug className="h-5 w-5" />,
    label: "Integrations",
    href: "/admin/integrations",
    roles: ["admin"],
  },
  {
    icon: <Shield className="h-5 w-5" />,
    label: "Compliance",
    href: "/admin/compliance",
    roles: ["admin", "executive", "ceo"],
  },
  {
    icon: <Settings className="h-5 w-5" />,
    label: "Settings",
    href: "/settings",
    roles: ["employee", "department_head", "manager", "executive", "ceo", "admin"],
  },
]

export function RoleBasedNav() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const visibleItems = navItems.filter((item) => {
    // Check if user role is allowed
    if (!item.roles.includes(user?.role || "employee")) {
      return false
    }
    // Check additional condition if provided
    if (item.condition && !item.condition(user)) {
      return false
    }
    return true
  })

  const getRoleDisplay = (role: UserRole) => {
    const roleMap: Record<UserRole, string> = {
      employee: "Employee",
      department_head: "Department Head",
      manager: "Manager",
      executive: "Executive",
      ceo: "CEO",
      admin: "Administrator",
    }
    return roleMap[role]
  }

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="font-bold text-foreground text-lg">
            {APP_NAME}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 mx-8">
            {visibleItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" size="sm" className="gap-2">
                  {item.icon}
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Global Search */}
          <div className="hidden md:block mr-4">
            <GlobalSearch />
          </div>

          {/* User Info */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{getRoleDisplay(user?.role || "employee")}</p>
            </div>
            <Button onClick={logout} variant="outline" size="sm" className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Items */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            {visibleItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              variant="outline"
              className="w-full justify-start gap-2 mt-4"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
