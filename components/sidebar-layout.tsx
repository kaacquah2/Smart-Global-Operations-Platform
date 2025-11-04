"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  CheckSquare2,
  BarChart3,
  Brain,
  Settings,
  Zap,
  Users,
  Bell,
  Layers,
  Calendar,
  Kanban,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState, useEffect } from "react"
import { APP_NAME } from "@/lib/constants"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface NavItem {
  label: string
  href: string
  icon: any
  badge?: string
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Branches", href: "/branches", icon: Building2 },
  { label: "Tasks", href: "/tasks", icon: CheckSquare2, badge: "List" },
  { label: "Board", href: "/tasks/board", icon: Kanban, badge: "Kanban" },
  { label: "Calendar", href: "/tasks/calendar", icon: Calendar, badge: "Calendar" },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "AI Insights", href: "/ai-insights", icon: Brain },
  { label: "Workflows", href: "/workflows", icon: Zap },
  { label: "Team", href: "/team", icon: Users },
  { label: "Resources", href: "/resources", icon: Layers },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-accent">
          <Layers className="h-6 w-6 text-white" />
        </div>
        {sidebarOpen && !isMobile && <span className="text-lg font-bold">{APP_NAME}</span>}
        {isMobile && <span className="text-lg font-bold">{APP_NAME}</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} onClick={onItemClick}>
              <button
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                }`}
                title={item.label}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {(sidebarOpen || isMobile) && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs bg-sidebar-primary/20 px-2 py-1 rounded">{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-sidebar-border p-4">
        <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/10 transition-all">
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {(sidebarOpen || isMobile) && <span>Logout</span>}
        </button>
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/10 transition-all"
          >
            {sidebarOpen ? (
              <>
                <X className="h-5 w-5 flex-shrink-0" />
                <span>Collapse</span>
              </>
            ) : (
              <Menu className="h-5 w-5 flex-shrink-0 mx-auto" />
            )}
          </button>
        )}
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground border border-sidebar-border shadow-lg">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <NavContent onItemClick={() => setMobileMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={`hidden md:block border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ${
            sidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="flex h-full flex-col">
            <NavContent />
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full md:w-auto">
        <div className="p-4 md:px-8 md:py-6">{children}</div>
      </main>
    </div>
  )
}

export default SidebarLayout
