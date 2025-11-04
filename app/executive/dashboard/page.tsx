"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  DollarSign,
  Users,
  BarChart3,
  Target,
  Building2,
  FileText,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getAllUsers, getAllDepartments, getBranches, getTasks } from "@/lib/supabase/queries"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { SidebarLayout } from "@/components/sidebar-layout"

export default function ExecutiveDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const [usersData, deptsData, branchesData, tasksData] = await Promise.all([
          getAllUsers(),
          getAllDepartments(),
          getBranches(),
          getTasks()
        ])
        setUsers(usersData)
        setDepartments(deptsData)
        setBranches(branchesData)
        setTasks(tasksData)
      } catch (error) {
        console.error('Error loading executive data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Calculate company-wide stats
  const totalEmployees = users.length
  const totalDepartments = departments.length
  const totalBranches = branches.length
  
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length
  }

  const companyEfficiency = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0

  // Department performance
  const departmentPerformance = departments.map(dept => {
    const deptUsers = users.filter(u => u.department === dept.name)
    const deptTasks = tasks.filter(t => {
      const assignee = users.find(u => u.id === t.assignee_id)
      return assignee?.department === dept.name
    })
    const completed = deptTasks.filter(t => t.status === 'completed').length
    const total = deptTasks.length
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      name: dept.name,
      employees: deptUsers.length,
      tasks: total,
      completed,
      efficiency
    }
  }).sort((a, b) => b.efficiency - a.efficiency)

  // Branch performance
  const branchPerformance = branches.map(branch => {
    const branchUsers = users.filter(u => u.branch === branch.name)
    const branchTasks = tasks.filter(t => t.branch === branch.name)
    const completed = branchTasks.filter(t => t.status === 'completed').length
    const total = branchTasks.length
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      name: branch.name,
      employees: branchUsers.length,
      tasks: total,
      efficiency
    }
  })

  const stats = [
    { 
      icon: Users, 
      label: "Total Employees", 
      value: totalEmployees.toString(), 
      change: "Across all branches",
      color: "text-blue-600"
    },
    { 
      icon: Building2, 
      label: "Departments", 
      value: totalDepartments.toString(), 
      change: "Active departments",
      color: "text-purple-600"
    },
    { 
      icon: TrendingUp, 
      label: "Company Efficiency", 
      value: `${companyEfficiency}%`, 
      change: `${taskStats.completed}/${taskStats.total} tasks completed`,
      color: "text-green-600"
    },
    { 
      icon: Target, 
      label: "Total Tasks", 
      value: taskStats.total.toString(), 
      change: `${taskStats.inProgress} in progress`,
      color: "text-orange-600"
    },
  ]

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Executive Dashboard</h1>
            <p className="text-muted-foreground">
              Company-wide overview and strategic metrics
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            {stats.map((stat, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="mb-2 text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`mb-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-accent">{stat.change}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Charts */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentPerformance.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100} 
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="efficiency" fill="hsl(var(--accent))" name="Efficiency %" />
                      <Bar dataKey="tasks" fill="hsl(var(--primary))" name="Tasks" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Branch Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Branch Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={branchPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="efficiency" fill="hsl(var(--accent))" name="Efficiency %" />
                      <Bar dataKey="employees" fill="hsl(var(--primary))" name="Employees" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/organization">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    View Organization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View all employees, departments, and branches
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/purchases">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Purchase Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Review and approve purchase requests
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tasks">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    All Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    View company-wide task overview
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
