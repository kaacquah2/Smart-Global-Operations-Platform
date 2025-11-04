"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { CheckCircle, Clock, AlertCircle, Plus, Search, MoreVertical, Calendar, User, Tag, MapPin, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect, useCallback, useMemo } from "react"
import { getTasks, subscribeToTasks, createTask, updateTask, deleteTask, getAllUsers, getBranches } from "@/lib/supabase/queries"
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
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  
  // Task creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [formLoading, setFormLoading] = useState(false)
  
  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    status: "pending" as "pending" | "in-progress" | "completed" | "cancelled",
    branch: "",
    assignee_id: "",
    due_date: "",
    progress: 0,
  })

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

  // Load users and branches for form
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [usersData, branchesData] = await Promise.all([
          getAllUsers(),
          getBranches(),
        ])
        setUsers(usersData || [])
        setBranches(branchesData || [])
        
        // Set default branch to user's branch
        if (user?.branch && branchesData) {
          const userBranch = branchesData.find(b => b.name === user.branch)
          if (userBranch) {
            setTaskForm(prev => ({ ...prev, branch: userBranch.name }))
          }
        }
      } catch (error) {
        console.error('Error loading form data:', error)
      }
    }
    
    if (user?.id) {
      loadFormData()
    }
  }, [user?.id, user?.branch])

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

  // Handle task creation
  const handleCreateTask = async () => {
    if (!user?.id) return
    
    if (!taskForm.title || !taskForm.description || !taskForm.branch || !taskForm.due_date) {
      alert('Please fill in all required fields')
      return
    }

    setFormLoading(true)
    try {
      const assignee = users.find(u => u.id === taskForm.assignee_id)
      
      const taskData = {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        status: taskForm.status,
        branch: taskForm.branch,
        assignee_id: taskForm.assignee_id || null,
        assignee_name: assignee?.name || null,
        due_date: taskForm.due_date,
        progress: taskForm.progress,
        created_by: user.id,
      }

      await createTask(taskData)
      
      // Reset form
      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        status: "pending",
        branch: user.branch || "",
        assignee_id: "",
        due_date: "",
        progress: 0,
      })
      
      setIsCreateModalOpen(false)
      loadTasks(true)
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  // Handle task edit
  const handleEditTask = (task: any) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      status: task.status || "pending",
      branch: task.branch || "",
      assignee_id: task.assignee_id || "",
      due_date: task.due_date ? task.due_date.split('T')[0] : "",
      progress: task.progress || 0,
    })
    setIsEditModalOpen(true)
  }

  // Handle task update
  const handleUpdateTask = async () => {
    if (!editingTask) return

    setFormLoading(true)
    try {
      const assignee = users.find(u => u.id === taskForm.assignee_id)
      
      const updates = {
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority,
        status: taskForm.status,
        branch: taskForm.branch,
        assignee_id: taskForm.assignee_id || null,
        assignee_name: assignee?.name || null,
        due_date: taskForm.due_date,
        progress: taskForm.progress,
      }

      await updateTask(editingTask.id, updates)
      
      setIsEditModalOpen(false)
      setEditingTask(null)
      loadTasks(true)
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  // Handle task delete
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask(taskId)
      loadTasks(true)
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task. Please try again.')
    }
  }

  return (
    <LayoutWithSidebar>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Task Management</h1>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground">Track and manage all operational tasks</p>
            </div>
            <Button 
              className="gap-2 w-full sm:w-auto"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
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
          <div className="p-4 md:p-6 space-y-6">
            {loading ? (
              null
            ) : (
              <>
                {/* Status Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
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
                  <Card key={task.id} className="p-4 md:p-6 hover:shadow-lg transition-all cursor-pointer border-border">
                    <button
                      onClick={() => toggleTaskExpand(task.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                          <div
                            className={`mt-1 h-10 w-10 flex items-center justify-center rounded-lg flex-shrink-0 ${statusInfo.color}`}
                          >
                            <StatusIcon className={`h-5 w-5 ${statusInfo.textColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-semibold text-foreground break-words">{task.title}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1 break-words line-clamp-2">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {expandedTasks.has(task.id) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                variant="destructive"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </button>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className={`inline-flex items-center gap-1.5 rounded-full ${priorityInfo.color} px-2 md:px-3 py-1`}>
                        <Tag className="h-3 w-3" />
                        <span className={`text-xs font-medium ${priorityInfo.textColor}`}>{priorityInfo.label}</span>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 rounded-full ${statusInfo.color} px-2 md:px-3 py-1`}>
                        <span className={`text-xs font-medium ${statusInfo.textColor}`}>{statusInfo.label}</span>
                      </div>
                    </div>

                    {expandedTasks.has(task.id) ? (
                      <div className="space-y-4 pt-4 border-t">
                        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
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
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Full Description</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{task.description}</p>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
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
                    )}
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

      {/* Create Task Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new task
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Enter task description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <select
                  id="priority"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <select
                  id="branch"
                  value={taskForm.branch}
                  onChange={(e) => setTaskForm({ ...taskForm, branch: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <select
                  id="assignee"
                  value={taskForm.assignee_id}
                  onChange={(e) => setTaskForm({ ...taskForm, assignee_id: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Unassigned</option>
                  {users.filter(u => u.is_active).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={taskForm.progress}
                  onChange={(e) => setTaskForm({ ...taskForm, progress: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={formLoading}>
              {formLoading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Enter task description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority *</Label>
                <select
                  id="edit-priority"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status *</Label>
                <select
                  id="edit-status"
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-branch">Branch *</Label>
                <select
                  id="edit-branch"
                  value={taskForm.branch}
                  onChange={(e) => setTaskForm({ ...taskForm, branch: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-due_date">Due Date *</Label>
                <Input
                  id="edit-due_date"
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-assignee">Assignee</Label>
                <select
                  id="edit-assignee"
                  value={taskForm.assignee_id}
                  onChange={(e) => setTaskForm({ ...taskForm, assignee_id: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Unassigned</option>
                  {users.filter(u => u.is_active).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-progress">Progress (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={taskForm.progress}
                  onChange={(e) => setTaskForm({ ...taskForm, progress: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingTask(null)
              }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTask} disabled={formLoading}>
              {formLoading ? "Updating..." : "Update Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LayoutWithSidebar>
  )
}
