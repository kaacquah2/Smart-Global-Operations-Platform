"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { CheckCircle, Clock, AlertCircle, Plus, Search, MoreVertical, Calendar, User, Tag, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback, useMemo } from "react"
import { getTasks, subscribeToTasks } from "@/lib/supabase/queries"
import { useAuth } from "@/lib/auth-context"
import { RefreshCw } from "lucide-react"

export const dynamic = 'force-dynamic'

const statusConfig = {
  completed: {
    label: "Completed",
    color: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-700 dark:text-green-400",
    icon: CheckCircle,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-700 dark:text-blue-400",
    icon: Clock,
  },
  pending: {
    label: "Pending",
    color: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-700 dark:text-amber-400",
    icon: AlertCircle,
  },
}

const priorityConfig = {
  critical: { label: "Critical", color: "bg-red-100 dark:bg-red-950/30", textColor: "text-red-700 dark:text-red-400" },
  high: {
    label: "High",
    color: "bg-orange-100 dark:bg-orange-950/30",
    textColor: "text-orange-700 dark:text-orange-400",
  },
  medium: { label: "Medium", color: "bg-blue-100 dark:bg-blue-950/30", textColor: "text-blue-700 dark:text-blue-400" },
  low: { label: "Low", color: "bg-green-100 dark:bg-green-950/30", textColor: "text-green-700 dark:text-green-400" },
}

export default function Tasks() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  // Memoize the load function
  const loadTasks = useCallback(async (forceRefresh = false) => {
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

      const filters: any = {}
      
      // Admins, executives, and CEO can see all tasks
      if (['admin', 'executive', 'ceo'].includes(user?.role || '')) {
        // No filter - see all tasks
      }
      // Department heads see all tasks from their department
      else if (user?.role === 'department_head') {
        // Get all tasks and filter by department client-side
        // (getTasks doesn't support multiple assignee_ids yet)
      }
      // Employees see only their assigned tasks
      else if (user?.role === "employee") {
        filters.assignee_id = user.id
      }
      // Managers see their direct reports' tasks
      else if (user?.role === "manager") {
        // Get all tasks and filter by team client-side
      }
      
      let tasksData = await getTasks(filters)
      
      // Client-side filtering for department heads and managers
      if (user?.role === 'department_head') {
        const { getTeamMembers } = await import('@/lib/supabase/queries')
        const teamMembers = await getTeamMembers(user.id)
        const teamMemberIds = new Set([user.id, ...teamMembers.map(m => m.id)])
        tasksData = (tasksData || []).filter(task => 
          task.assignee_id && teamMemberIds.has(task.assignee_id)
        )
      } else if (user?.role === "manager") {
        const { getTeamMembers } = await import('@/lib/supabase/queries')
        const teamMembers = await getTeamMembers(user.id)
        const teamMemberIds = new Set([user.id, ...teamMembers.map(m => m.id)])
        tasksData = (tasksData || []).filter(task => 
          task.assignee_id && teamMemberIds.has(task.assignee_id)
        )
      }
      
      setTasks(tasksData || [])
      setLastFetchTime(Date.now())
    } catch (error) {
      console.error('Error loading tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, user?.role, lastFetchTime])

  // Load tasks when user is available
  useEffect(() => {
    if (user?.id) {
      loadTasks()
    } else {
      setLoading(false)
    }
  }, [user?.id, loadTasks])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return

    const subscription = subscribeToTasks((payload) => {
      // Debounce updates - wait 500ms before reloading
      setTimeout(() => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          loadTasks(true)
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id))
        }
      }, 500)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id, loadTasks])

  // Memoize filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee_name?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === "all" || task.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [tasks, searchQuery, filterStatus])

  // Memoize stats
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    pending: tasks.filter((t) => t.status === "pending").length,
  }), [tasks])

  return (
    <LayoutWithSidebar>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">Track and manage all operational tasks</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading && tasks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                <p className="text-muted-foreground">Loading tasks...</p>
              </div>
            </div>
          ) : null}
          <div className="p-6 space-y-6">
            {loading ? (
              null
            ) : (
              <>
                {/* Status Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{stats.total}</p>
                  </Card>
                  <Card className="p-4 border-green-200 dark:border-green-900/50">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Completed</p>
                    <p className="mt-2 text-3xl font-bold text-green-700 dark:text-green-400">{stats.completed}</p>
                  </Card>
                  <Card className="p-4 border-blue-200 dark:border-blue-900/50">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">In Progress</p>
                    <p className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.inProgress}</p>
                  </Card>
                  <Card className="p-4 border-amber-200 dark:border-amber-900/50">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Pending</p>
                    <p className="mt-2 text-3xl font-bold text-amber-700 dark:text-amber-400">{stats.pending}</p>
                  </Card>
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <Card className="p-6 text-center">
                      <p className="text-muted-foreground">No tasks found</p>
                    </Card>
                  ) : (
                    filteredTasks.map((task) => {
                const statusInfo = statusConfig[task.status as keyof typeof statusConfig]
                const priorityInfo = priorityConfig[task.priority as keyof typeof priorityConfig]
                const StatusIcon = statusInfo.icon

                return (
                  <Card key={task.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`mt-1 h-10 w-10 flex items-center justify-center rounded-lg flex-shrink-0 ${statusInfo.color}`}
                        >
                          <StatusIcon className={`h-5 w-5 ${statusInfo.textColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className={`inline-flex items-center gap-1.5 rounded-full ${priorityInfo.color} px-3 py-1`}>
                        <Tag className="h-3 w-3" />
                        <span className={`text-xs font-medium ${priorityInfo.textColor}`}>{priorityInfo.label}</span>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 rounded-full ${statusInfo.color} px-3 py-1`}>
                        <span className={`text-xs font-medium ${statusInfo.textColor}`}>{statusInfo.label}</span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4 mb-4 pb-4 border-b border-border">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Assignee</p>
                          <p className="text-sm text-foreground">{task.assignee_name || "Unassigned"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Branch</p>
                          <p className="text-sm text-foreground">{task.branch}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Due Date</p>
                          <p className="text-sm text-foreground">{task.due_date ? new Date(task.due_date).toLocaleDateString() : "N/A"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Progress</p>
                        <p className="text-sm font-semibold text-foreground">{task.progress || 0}%</p>
                      </div>
                    </div>

                      {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                  </Card>
                )
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
