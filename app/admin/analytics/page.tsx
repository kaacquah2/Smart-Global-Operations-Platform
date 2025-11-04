"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  Calendar,
  Users,
  Target,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdvancedAnalyticsPage() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState("30d")

  const performanceData = [
    { month: 'Jan', tasks: 120, completed: 108, efficiency: 90 },
    { month: 'Feb', tasks: 135, completed: 122, efficiency: 90 },
    { month: 'Mar', tasks: 150, completed: 138, efficiency: 92 },
    { month: 'Apr', tasks: 145, completed: 135, efficiency: 93 },
    { month: 'May', tasks: 160, completed: 152, efficiency: 95 },
    { month: 'Jun', tasks: 170, completed: 165, efficiency: 97 },
  ]

  const departmentPerformance = [
    { department: 'IT', efficiency: 95, tasks: 450, completed: 428 },
    { department: 'Sales', efficiency: 92, tasks: 380, completed: 350 },
    { department: 'HR', efficiency: 88, tasks: 320, completed: 282 },
    { department: 'Finance', efficiency: 90, tasks: 290, completed: 261 },
    { department: 'Operations', efficiency: 87, tasks: 410, completed: 357 },
  ]

  const revenueData = [
    { month: 'Jan', revenue: 450000, costs: 320000, profit: 130000 },
    { month: 'Feb', revenue: 480000, costs: 330000, profit: 150000 },
    { month: 'Mar', revenue: 520000, costs: 340000, profit: 180000 },
    { month: 'Apr', revenue: 510000, costs: 335000, profit: 175000 },
    { month: 'May', revenue: 550000, costs: 350000, profit: 200000 },
    { month: 'Jun', revenue: 580000, costs: 360000, profit: 220000 },
  ]

  const statusDistribution = [
    { name: 'Completed', value: 1250, color: '#10b981' },
    { name: 'In Progress', value: 450, color: '#3b82f6' },
    { name: 'Pending', value: 280, color: '#f59e0b' },
    { name: 'Overdue', value: 45, color: '#ef4444' },
  ]

  const kpis = [
    { label: 'Overall Efficiency', value: '94.2%', trend: '+2.5%', positive: true },
    { label: 'Task Completion Rate', value: '91.8%', trend: '+3.2%', positive: true },
    { label: 'Average Response Time', value: '2.4h', trend: '-15%', positive: true },
    { label: 'Revenue Growth', value: '+12.5%', trend: '+2.1%', positive: true },
    { label: 'Customer Satisfaction', value: '4.7/5', trend: '+0.3', positive: true },
    { label: 'Employee Retention', value: '96.2%', trend: '+1.8%', positive: true },
  ]

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-accent" />
                Advanced Analytics & BI
              </h1>
              <p className="text-muted-foreground">
                Comprehensive business intelligence and analytics
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  // Open filters dialog - in production this would open a modal
                  alert("Filters feature coming soon!")
                }}
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  // Export analytics data
                  const exportData = {
                    dateRange,
                    performanceData,
                    departmentPerformance,
                    revenueData,
                    statusDistribution,
                    kpis
                  }
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `analytics-export-${dateRange}-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  window.URL.revokeObjectURL(url)
                }}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Date Range Selector */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {kpis.map((kpi, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold mb-1">{kpi.value}</p>
                  <div className={`flex items-center gap-1 text-xs ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {kpi.trend}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            {/* Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="tasks" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Total Tasks" />
                    <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Completed" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="efficiency" fill="#8b5cf6" name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue & Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} name="Costs" />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Insights & Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">Performance Improvement</p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Overall efficiency has increased by 2.5% this month. The IT department shows exceptional performance at 95% efficiency.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100">Attention Required</p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Operations department efficiency is below target at 87%. Consider reviewing workload distribution and resource allocation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">Growth Opportunity</p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Revenue growth is strong at 12.5%. Consider expanding high-performing departments to capitalize on current momentum.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
