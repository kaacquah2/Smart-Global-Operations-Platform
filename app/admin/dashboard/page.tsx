"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Briefcase,
  ShoppingCart,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Building2,
  Shield,
  Zap,
  Activity,
  PieChart,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback, useMemo } from "react"
import { getTasks, getAllUsers } from "@/lib/supabase/queries"
import { SidebarLayout } from "@/components/sidebar-layout"
import { RefreshCw } from "lucide-react"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const [employeesData, tasksData] = await Promise.all([
        getAllUsers().catch(() => []).then(users => users || []),
        getTasks().catch(() => []).then(tasks => tasks || [])
      ])
      
      setEmployees(employeesData || [])
      setTasks(tasksData || [])
    } catch (error) {
      console.error('Error loading admin dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user?.id, loadData])

  // Calculate statistics
  const stats = useMemo(() => {
    const activeEmployees = employees.filter(e => e.is_active).length
    const departments = new Set(employees.map(e => e.department)).size
    const branches = new Set(employees.map(e => e.branch)).size
    
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      overdue: tasks.filter(t => {
        if (t.status === 'completed') return false
        return new Date(t.due_date) < new Date()
      }).length
    }

    const roleDistribution = employees.reduce((acc, emp) => {
      acc[emp.role] = (acc[emp.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      employees: { total: employees.length, active: activeEmployees },
      departments,
      branches,
      tasks: taskStats,
      roleDistribution
    }
  }, [employees, tasks])

  const adminResponsibilities = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Create, edit, and manage all employees",
      count: `${stats.employees.active} active employees`,
      href: "/admin/employees",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900"
    },
    {
      icon: Target,
      title: "Task Management",
      description: "Create, assign, and oversee all tasks",
      count: `${stats.tasks.total} total tasks`,
      href: "/tasks",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "View system-wide analytics and generate reports",
      count: `${stats.departments} departments`,
      href: "/analytics",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900"
    },
    {
      icon: ShoppingCart,
      title: "Purchase Oversight",
      description: "Review and manage all purchase requests",
      count: "All requests",
      href: "/purchases",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900"
    },
    {
      icon: Building2,
      title: "Department Management",
      description: "Manage departments and organizational structure",
      count: `${stats.departments} departments`,
      href: "/organization",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900"
    },
    {
      icon: Settings,
      title: "System Configuration",
      description: "Configure system settings and permissions",
      count: "System wide",
      href: "/admin/permissions",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900"
    },
    {
      icon: Activity,
      title: "Activity Logs",
      description: "Monitor system activities and audit trails",
      count: "Real-time",
      href: "/admin/activity-logs",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900"
    },
    {
      icon: Users,
      title: "User Activity",
      description: "Track user activities and login statistics",
      count: `${stats.employees.active} users`,
      href: "/admin/user-activity",
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900"
    },
    {
      icon: FileText,
      title: "Reports & Export",
      description: "Generate comprehensive reports and exports",
      count: "Multiple formats",
      href: "/admin/reports",
      color: "text-teal-600",
      bgColor: "bg-teal-100 dark:bg-teal-900"
    }
  ]

  const quickActions = [
    { icon: Users, label: "Create Employee", href: "/admin/employees/create", variant: "default" as const },
    { icon: Target, label: "Assign Task", href: "/tasks", variant: "outline" as const },
    { icon: FileText, label: "Generate Report", href: "/analytics", variant: "outline" as const },
    { icon: Settings, label: "System Settings", href: "/admin/permissions", variant: "outline" as const }
  ]

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-8 w-8 text-accent" />
                Administrator Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage all aspects of the SGOAP system
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Key Statistics */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="mb-2 text-sm text-muted-foreground">Total Employees</p>
                    <p className="mb-1 text-3xl font-bold text-foreground">{stats.employees.total}</p>
                    <p className="text-xs text-green-600">{stats.employees.active} active</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="mb-2 text-sm text-muted-foreground">Total Tasks</p>
                    <p className="mb-1 text-3xl font-bold text-foreground">{stats.tasks.total}</p>
                    <p className="text-xs text-accent">
                      {stats.tasks.completed} completed
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="mb-2 text-sm text-muted-foreground">Departments</p>
                    <p className="mb-1 text-3xl font-bold text-foreground">{stats.departments}</p>
                    <p className="text-xs text-muted-foreground">Across {stats.branches} branches</p>
                  </div>
                  <Building2 className="h-8 w-8 text-cyan-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="mb-2 text-sm text-muted-foreground">Pending Tasks</p>
                    <p className="mb-1 text-3xl font-bold text-foreground">{stats.tasks.pending}</p>
                    <p className={`text-xs ${stats.tasks.overdue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {stats.tasks.overdue} overdue
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Responsibilities */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 text-accent" />
              Your Responsibilities
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {adminResponsibilities.map((resp, idx) => (
                <Link key={idx} href={resp.href}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-accent">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-3 rounded-lg ${resp.bgColor}`}>
                          <resp.icon className={`h-6 w-6 ${resp.color}`} />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {resp.count}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{resp.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{resp.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            {/* Task Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    System Task Overview
                  </CardTitle>
                  <Link href="/tasks">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading tasks...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900">
                        <div className="text-2xl font-bold text-green-600">{stats.tasks.completed}</div>
                        <div className="text-xs text-muted-foreground mt-1">Completed</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-blue-100 dark:bg-blue-900">
                        <div className="text-2xl font-bold text-blue-600">{stats.tasks.inProgress}</div>
                        <div className="text-xs text-muted-foreground mt-1">In Progress</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                        <div className="text-2xl font-bold text-yellow-600">{stats.tasks.pending}</div>
                        <div className="text-xs text-muted-foreground mt-1">Pending</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Task Completion Rate</span>
                        <span className="text-sm font-bold">
                          {stats.tasks.total > 0 
                            ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
                            : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={stats.tasks.total > 0 
                          ? (stats.tasks.completed / stats.tasks.total) * 100 
                          : 0} 
                        className="h-2" 
                      />
                    </div>
                    {stats.tasks.overdue > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-600">
                            {stats.tasks.overdue} tasks are overdue
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action, idx) => (
                  <Link key={idx} href={action.href}>
                    <Button className="w-full justify-start gap-2" variant={action.variant}>
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Role Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Role Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.roleDistribution).map(([role, count]) => {
                    const countValue = typeof count === 'number' ? count : 0
                    return (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent"></div>
                        <span className="text-sm font-medium capitalize">
                          {role.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(countValue / stats.employees.total) * 100} 
                          className="w-24 h-2" 
                        />
                        <span className="text-sm font-bold w-8 text-right">{countValue}</span>
                      </div>
                    </div>
                  )})}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-100 dark:bg-green-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">System Status</span>
                    </div>
                    <Badge className="bg-green-600">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Active Users</span>
                    </div>
                    <span className="text-sm font-bold">{stats.employees.active}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium">Total Tasks</span>
                    </div>
                    <span className="text-sm font-bold">{stats.tasks.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
