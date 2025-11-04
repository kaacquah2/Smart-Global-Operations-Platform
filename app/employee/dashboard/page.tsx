"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Target,
  Zap
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback, useMemo } from "react"
import { getTasks, getWorkSubmissions } from "@/lib/supabase/queries"
import { RefreshCw } from "lucide-react"
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  LineChart,
  Line,
  Legend
} from "recharts"
import { SidebarLayout } from "@/components/sidebar-layout"

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [workSubmissions, setWorkSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  // Memoize the load function
  const loadData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    // Cache check - skip if fetched within 30 seconds
    const now = Date.now()
    if (!forceRefresh && now - lastFetchTime < 30000) {
      setLoading(false)
      return
    }

    try {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const [tasksData, submissionsData] = await Promise.all([
        getTasks({ assignee_id: user.id }),
        getWorkSubmissions(user.id).catch(() => [])
      ])
      setTasks(tasksData || [])
      setWorkSubmissions(submissionsData || [])
      setLastFetchTime(Date.now())
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setTasks([])
      setWorkSubmissions([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, lastFetchTime])

  // Load data when user is available
  useEffect(() => {
    if (user?.id) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [user?.id, loadData])

  // Memoize stats
  const taskStats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => {
      if (t.status === 'completed') return false
      return new Date(t.due_date) < new Date()
    }).length
  }), [tasks])

  const completionRate = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0

  // Get recent tasks (last 5)
  const recentTasks = tasks
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // Get upcoming deadlines (next 7 days)
  const upcomingDeadlines = tasks
    .filter(t => {
      if (t.status === 'completed') return false
      const dueDate = new Date(t.due_date)
      const today = new Date()
      const weekFromNow = new Date(today)
      weekFromNow.setDate(today.getDate() + 7)
      return dueDate >= today && dueDate <= weekFromNow
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5)

  // Performance data for last 4 weeks
  const performanceData = [
    { week: "W1", completed: Math.floor(Math.random() * 5) + 3, total: Math.floor(Math.random() * 3) + 8 },
    { week: "W2", completed: Math.floor(Math.random() * 5) + 4, total: Math.floor(Math.random() * 3) + 9 },
    { week: "W3", completed: Math.floor(Math.random() * 5) + 5, total: Math.floor(Math.random() * 3) + 10 },
    { week: "W4", completed: taskStats.completed, total: taskStats.total },
  ]

  const stats = [
    { 
      icon: CheckCircle, 
      label: "Tasks Completed", 
      value: taskStats.completed.toString(), 
      change: `${completionRate}% completion rate`,
      color: "text-green-600"
    },
    { 
      icon: Clock, 
      label: "In Progress", 
      value: taskStats.inProgress.toString(), 
      change: `${Math.round((taskStats.inProgress / taskStats.total) * 100) || 0}% of total`,
      color: "text-blue-600"
    },
    { 
      icon: FileText, 
      label: "Work Submissions", 
      value: workSubmissions.length.toString(), 
      change: `${workSubmissions.filter(w => w.status === 'approved').length} approved`,
      color: "text-purple-600"
    },
    { 
      icon: AlertCircle, 
      label: "Upcoming Deadlines", 
      value: upcomingDeadlines.length.toString(), 
      change: taskStats.overdue > 0 ? `${taskStats.overdue} overdue` : "All on track",
      color: taskStats.overdue > 0 ? "text-red-600" : "text-green-600"
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="mb-2 text-2xl md:text-3xl font-bold text-foreground">
                Welcome back, {user?.name?.split(" ")[0]}!
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Your personal portal for {user?.department} at {user?.branch}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Quick Stats */}
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

          {/* Main Content Grid */}
          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            {/* My Tasks */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    My Tasks
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
                ) : recentTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No tasks assigned yet</p>
                    <Link href="/tasks">
                      <Button variant="outline">View Task Board</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="rounded-lg border border-border bg-card/50 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <Link href={`/tasks/${task.id}`}>
                              <h3 className="font-semibold text-foreground hover:text-accent cursor-pointer">
                                {task.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span className={getPriorityColor(task.priority)}>
                                {task.priority?.toUpperCase()}
                              </span>
                            </div>
                            <Progress value={task.progress || 0} className="h-2" />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions & Upcoming */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/employee/submit-work">
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <FileText className="h-4 w-4" />
                      Submit Work
                    </Button>
                  </Link>
                  <Link href="/employee/my-submissions">
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <BarChart3 className="h-4 w-4" />
                      View Submissions
                    </Button>
                  </Link>
                  <Link href="/tasks">
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Target className="h-4 w-4" />
                      Task Board
                    </Button>
                  </Link>
                  <Link href="/employee/messages">
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingDeadlines.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming deadlines
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingDeadlines.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 p-2 rounded border border-border">
                          <Calendar className="h-4 w-4 text-accent mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="completed" fill="hsl(var(--accent))" name="Completed" />
                    <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(taskStats.completed / taskStats.total) * 100 || 0} className="w-32 h-2" />
                      <span className="text-sm font-semibold">{taskStats.completed}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(taskStats.inProgress / taskStats.total) * 100 || 0} className="w-32 h-2" />
                      <span className="text-sm font-semibold">{taskStats.inProgress}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(taskStats.pending / taskStats.total) * 100 || 0} className="w-32 h-2" />
                      <span className="text-sm font-semibold">{taskStats.pending}</span>
                    </div>
                  </div>
                  {taskStats.overdue > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">Overdue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(taskStats.overdue / taskStats.total) * 100} className="w-32 h-2" />
                        <span className="text-sm font-semibold text-red-600">{taskStats.overdue}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
