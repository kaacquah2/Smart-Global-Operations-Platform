"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Download, Filter, Calendar, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTasks, getWorkSubmissions, getAllUsers, getAllDepartments, getTeamMembers } from "@/lib/supabase/queries"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const monthlyMetrics = [
  { month: "January", efficiency: 76, productivity: 82, costPerTask: 245 },
  { month: "February", efficiency: 78, productivity: 85, costPerTask: 238 },
  { month: "March", efficiency: 82, productivity: 88, costPerTask: 225 },
  { month: "April", efficiency: 80, productivity: 86, costPerTask: 232 },
  { month: "May", efficiency: 85, productivity: 90, costPerTask: 218 },
  { month: "June", efficiency: 88, productivity: 92, costPerTask: 210 },
]

const staffProductivity = [
  { name: "Sarah Johnson", tasksCompleted: 156, hoursLogged: 480, efficiency: 94 },
  { name: "James Mitchell", tasksCompleted: 142, hoursLogged: 520, efficiency: 87 },
  { name: "Yuki Tanaka", tasksCompleted: 168, hoursLogged: 500, efficiency: 91 },
  { name: "Emma Wilson", tasksCompleted: 134, hoursLogged: 480, efficiency: 85 },
  { name: "Michael Chen", tasksCompleted: 156, hoursLogged: 520, efficiency: 89 },
  { name: "Priya Sharma", tasksCompleted: 142, hoursLogged: 480, efficiency: 88 },
]

const branchComparison = [
  { branch: "New York", efficiency: 94, cost: 1200, satisfaction: 92 },
  { branch: "London", efficiency: 87, cost: 1450, satisfaction: 88 },
  { branch: "Tokyo", efficiency: 91, cost: 1100, satisfaction: 90 },
  { branch: "Sydney", efficiency: 85, cost: 950, satisfaction: 86 },
  { branch: "Toronto", efficiency: 88, cost: 1050, satisfaction: 87 },
]

export default function Analytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [filterDepartment, setFilterDepartment] = useState<string>('own')

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Load departments
        const depts = await getAllDepartments()
        setDepartments(depts || [])

        // Load tasks
        let allTasks = await getTasks()
        
        // Load submissions
        let allSubmissions = await getWorkSubmissions()
        
        // Load users for team member analytics
        const allUsers = await getAllUsers()
        setUsers(allUsers || [])

        // Apply department filtering
        if (user && !['admin', 'executive', 'ceo'].includes(user.role || '')) {
          if (filterDepartment === 'own' && user.department) {
            // Filter tasks by department (through assignees)
            const deptUsers = allUsers.filter(u => u.department === user.department).map(u => u.id)
            allTasks = allTasks.filter(t => t.assignee_id && deptUsers.includes(t.assignee_id))
            allSubmissions = allSubmissions.filter(s => s.department === user.department)
          } else if (filterDepartment !== 'all') {
            const deptUsers = allUsers.filter(u => u.department === filterDepartment).map(u => u.id)
            allTasks = allTasks.filter(t => t.assignee_id && deptUsers.includes(t.assignee_id))
            allSubmissions = allSubmissions.filter(s => s.department === filterDepartment)
          }
        }

        setTasks(allTasks || [])
        setSubmissions(allSubmissions || [])
      } catch (error) {
        console.error('Error loading analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalyticsData()
  }, [user?.id, user?.role, user?.department, filterDepartment])

  // Calculate real metrics from data
  const metrics = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const totalTasks = tasks.length || 1
    const efficiency = Math.round((completedTasks / totalTasks) * 100)

    const approvedSubmissions = submissions.filter(s => s.status === 'approved').length
    const totalSubmissions = submissions.length || 1
    const productivity = Math.round((approvedSubmissions / totalSubmissions) * 100)

    // Calculate monthly trends (last 6 months)
    const now = new Date()
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })
      
      const monthTasks = tasks.filter(t => {
        const taskDate = new Date(t.created_at)
        return taskDate.getMonth() === monthDate.getMonth() && 
               taskDate.getFullYear() === monthDate.getFullYear()
      })
      const monthCompleted = monthTasks.filter(t => t.status === 'completed').length
      const monthEfficiency = monthTasks.length > 0 ? Math.round((monthCompleted / monthTasks.length) * 100) : 0
      
      monthlyData.push({
        month: monthName,
        efficiency: monthEfficiency,
        productivity: monthEfficiency + Math.floor(Math.random() * 5 - 2), // Mock productivity variation
        costPerTask: 250 - (monthEfficiency / 10) // Simulated cost optimization
      })
    }

    // Calculate department metrics
    const deptMetrics = departments.map(dept => {
      const deptUsers = users.filter(u => u.department === dept.name).map(u => u.id)
      const deptTasks = tasks.filter(t => deptUsers.includes(t.assignee_id))
      const completed = deptTasks.filter(t => t.status === 'completed').length
      const value = deptTasks.length > 0 ? Math.round((completed / deptTasks.length) * 100) : 0
      return {
        department: dept.name,
        value
      }
    }).filter(d => d.value > 0)

    // Calculate staff productivity
    const staffProductivity = users.slice(0, 6).map(u => {
      const userTasks = tasks.filter(t => t.assignee_id === u.id)
      const completed = userTasks.filter(t => t.status === 'completed').length
      const efficiency = userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0
      return {
        name: u.name,
        tasksCompleted: completed,
        hoursLogged: Math.floor(userTasks.length * 8), // Estimated
        efficiency
      }
    }).sort((a, b) => b.efficiency - a.efficiency)

    return {
      monthlyMetrics: monthlyData,
      departmentMetrics: deptMetrics,
      staffProductivity,
      efficiency,
      productivity,
      totalTasks,
      completedTasks
    }
  }, [tasks, submissions, users, departments])

  if (loading) {
    return (
      <LayoutWithSidebar>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LayoutWithSidebar>
    )
  }

  return (
    <LayoutWithSidebar>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
              <p className="mt-1 text-sm text-muted-foreground">Comprehensive performance metrics and insights</p>
            </div>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Date Range Filter */}
          <div className="flex gap-3">
            {user && !['admin', 'executive', 'ceo'].includes(user.role || '') && (
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="own">My Department</SelectItem>
                  {(user.role === 'department_head' || user.role === 'manager') && (
                    <SelectItem value="all">All Departments</SelectItem>
                  )}
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" className="gap-2 bg-transparent">
              <Calendar className="h-4 w-4" />
              Last 6 Months
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* KPI Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Overall Efficiency</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{metrics.efficiency}%</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {metrics.completedTasks} of {metrics.totalTasks} tasks completed
                  </span>
                </div>
              </Card>
              <Card className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Avg Productivity</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{metrics.productivity}%</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Based on submissions
                  </span>
                </div>
              </Card>
              <Card className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{metrics.totalTasks}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {metrics.completedTasks} completed
                  </span>
                </div>
              </Card>
              <Card className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Department Performance</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {metrics.departmentMetrics.length > 0 
                    ? Math.round(metrics.departmentMetrics.reduce((sum, d) => sum + d.value, 0) / metrics.departmentMetrics.length)
                    : 0}%
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {metrics.departmentMetrics.length} department{metrics.departmentMetrics.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </Card>
            </div>

            {/* Main Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Efficiency & Productivity Trend */}
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Efficiency Trend</h3>
                  <p className="text-sm text-muted-foreground">6-month historical data</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.monthlyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--color-muted-foreground))" style={{ fontSize: "12px" }} />
                    <YAxis stroke="hsl(var(--color-muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--color-card))",
                        border: "1px solid hsl(var(--color-border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--color-primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="productivity" stroke="hsl(var(--color-accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Cost per Task Trend */}
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Cost Optimization</h3>
                  <p className="text-sm text-muted-foreground">Cost per task trend</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.monthlyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--color-muted-foreground))" style={{ fontSize: "12px" }} />
                    <YAxis stroke="hsl(var(--color-muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--color-card))",
                        border: "1px solid hsl(var(--color-border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="costPerTask" fill="hsl(var(--color-primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Department Performance Radar */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Department Performance</h3>
                <p className="text-sm text-muted-foreground">Efficiency scores across departments</p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                {metrics.departmentMetrics.length > 0 ? (
                  <RadarChart data={metrics.departmentMetrics}>
                    <PolarGrid stroke="hsl(var(--color-border))" />
                    <PolarAngleAxis
                      dataKey="department"
                      stroke="hsl(var(--color-muted-foreground))"
                      style={{ fontSize: "12px" }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--color-border))" />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="hsl(var(--color-primary))"
                      fill="hsl(var(--color-primary))"
                      fillOpacity={0.3}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--color-card))",
                        border: "1px solid hsl(var(--color-border))",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No department data available</p>
                  </div>
                )}
              </ResponsiveContainer>
            </Card>

            {/* Staff Productivity Table */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Top Performing Staff</h3>
                <p className="text-sm text-muted-foreground">Individual productivity metrics</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                        Tasks Completed
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Hours Logged</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.staffProductivity.length > 0 ? (
                      metrics.staffProductivity.map((staff, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-card/50 transition-colors">
                          <td className="px-4 py-4 text-sm font-medium text-foreground">{staff.name}</td>
                          <td className="px-4 py-4 text-right text-sm text-foreground font-semibold">
                            {staff.tasksCompleted}
                          </td>
                          <td className="px-4 py-4 text-right text-sm text-muted-foreground">{staff.hoursLogged}h</td>
                          <td className="px-4 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-accent"
                                  style={{ width: `${staff.efficiency}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-foreground">{staff.efficiency}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          No productivity data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Branch Comparison */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Branch Comparison</h3>
                <p className="text-sm text-muted-foreground">Multi-factor performance analysis</p>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="efficiency" name="Efficiency %" stroke="hsl(var(--color-muted-foreground))" />
                  <YAxis dataKey="cost" name="Monthly Cost ($)" stroke="hsl(var(--color-muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--color-card))",
                      border: "1px solid hsl(var(--color-border))",
                      borderRadius: "8px",
                    }}
                    cursor={{ strokeDasharray: "3 3" }}
                  />
                  <Scatter name="Branches" data={branchComparison} fill="hsl(var(--color-primary))" />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
