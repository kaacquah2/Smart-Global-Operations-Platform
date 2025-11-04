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
  Globe,
  Award,
  Activity
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getAllUsers, getAllDepartments, getBranches, getTasks, getPurchaseRequests } from "@/lib/supabase/queries"
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
  ComposedChart,
  Area,
  AreaChart
} from "recharts"
import { SidebarLayout } from "@/components/sidebar-layout"

export default function CEODashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const [usersData, deptsData, branchesData, tasksData, purchasesData] = await Promise.all([
          getAllUsers(),
          getAllDepartments(),
          getBranches(),
          getTasks(),
          getPurchaseRequests()
        ])
        setUsers(usersData)
        setDepartments(deptsData)
        setBranches(branchesData)
        setTasks(tasksData)
        setPurchaseRequests(purchasesData)
      } catch (error) {
        console.error('Error loading CEO data:', error)
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

  // Purchase request stats
  const purchaseStats = {
    total: purchaseRequests.length,
    pending: purchaseRequests.filter(p => ['submitted', 'finance_review', 'procurement_review', 'legal_review', 'audit_review'].includes(p.status)).length,
    approved: purchaseRequests.filter(p => p.status === 'approved').length,
    totalValue: purchaseRequests.reduce((sum, p) => sum + parseFloat(p.estimated_cost || 0), 0)
  }

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

  // Role distribution
  const roleDistribution = [
    { name: 'Employees', value: users.filter(u => u.role === 'employee').length },
    { name: 'Managers', value: users.filter(u => u.role === 'manager').length },
    { name: 'Dept Heads', value: users.filter(u => u.role === 'department_head').length },
    { name: 'Executives', value: users.filter(u => u.role === 'executive').length },
  ]

  const stats = [
    { 
      icon: Users, 
      label: "Total Employees", 
      value: totalEmployees.toString(), 
      change: `Across ${totalBranches} branches`,
      color: "text-blue-600"
    },
    { 
      icon: TrendingUp, 
      label: "Company Efficiency", 
      value: `${companyEfficiency}%`, 
      change: `${taskStats.completed}/${taskStats.total} tasks completed`,
      color: "text-green-600"
    },
    { 
      icon: DollarSign, 
      label: "Pending Purchases", 
      value: `$${purchaseStats.totalValue.toLocaleString()}`, 
      change: `${purchaseStats.pending} requests pending`,
      color: "text-orange-600"
    },
    { 
      icon: Building2, 
      label: "Branches", 
      value: totalBranches.toString(), 
      change: `${totalDepartments} departments`,
      color: "text-purple-600"
    },
  ]

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">CEO Dashboard</h1>
            <p className="text-muted-foreground">
              Complete organizational overview and strategic insights
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
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={departmentPerformance.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))" 
                        angle={-45} 
                        textAnchor="end" 
                        height={120} 
                      />
                      <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="efficiency" fill="hsl(var(--accent))" name="Efficiency %" />
                      <Bar yAxisId="left" dataKey="tasks" fill="hsl(var(--primary))" name="Tasks" />
                      <Line yAxisId="right" type="monotone" dataKey="employees" stroke="#82ca9d" strokeWidth={2} name="Employees" />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Branch Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Branch Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={branchPerformance}>
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
                      <Area type="monotone" dataKey="efficiency" stackId="1" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} name="Efficiency %" />
                      <Area type="monotone" dataKey="employees" stackId="2" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name="Employees" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Link href="/organization">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalEmployees}</p>
                  <p className="text-xs text-muted-foreground">Total employees</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/purchases">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Purchases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{purchaseStats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending reviews</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tasks">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{taskStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total tasks</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/employees">
              <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{totalDepartments}</p>
                  <p className="text-xs text-muted-foreground">Departments</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Department Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Department Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {departmentPerformance.map((dept) => (
                    <div key={dept.name} className="border border-border rounded-lg bg-card/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{dept.name}</h3>
                        <Badge variant={dept.efficiency >= 80 ? "default" : dept.efficiency >= 60 ? "secondary" : "destructive"}>
                          {dept.efficiency}%
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employees:</span>
                          <span className="font-medium">{dept.employees}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tasks:</span>
                          <span className="font-medium">{dept.tasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completed:</span>
                          <span className="font-medium text-green-600">{dept.completed}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
