"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Trash2, AlertCircle, CheckCircle2, MessageSquare, Users, TrendingUp, Filter, Loader2 } from "lucide-react"
import SidebarLayout from "@/components/sidebar-layout"
import { getTasks, getWorkSubmissions, getAllUsers, getAllDepartments } from "@/lib/supabase/queries"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: "alert" | "update" | "message" | "achievement"
  title: string
  description: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

interface ActivityFeed {
  id: string
  author: string
  action: string
  target: string
  timestamp: string
  icon: any
  color: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [filterDepartment, setFilterDepartment] = useState<string>('own')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Load departments
        const depts = await getAllDepartments()
        setDepartments(depts || [])

        // Load tasks and submissions
        let allTasks = await getTasks()
        let allSubmissions = await getWorkSubmissions()
        const allUsers = await getAllUsers()
        setUsers(allUsers || [])

        // Apply department filtering
        if (user && !['admin', 'executive', 'ceo'].includes(user.role || '')) {
          if (filterDepartment === 'own' && user.department) {
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

        // Generate notifications from real data
        const generatedNotifications: Notification[] = []

        // Task-related notifications
        const overdueTasks = allTasks.filter(t => {
          if (!t.due_date || t.status === 'completed') return false
          return new Date(t.due_date) < new Date()
        })
        
        overdueTasks.slice(0, 3).forEach(task => {
          const assignee = allUsers.find(u => u.id === task.assignee_id)
          generatedNotifications.push({
            id: `task-overdue-${task.id}`,
      type: "alert",
            title: "Overdue Task",
            description: `${task.title} is overdue${assignee ? ` (${assignee.name})` : ''}.`,
            timestamp: formatDistanceToNow(new Date(task.due_date || task.created_at), { addSuffix: true }),
            read: false,
          })
        })

        // Submission notifications
        const recentSubmissions = allSubmissions
          .filter(s => s.status === 'approved' || s.status === 'rejected')
          .sort((a, b) => new Date((b.updated_at || b.submitted_at || b.created_at) as string).getTime() - new Date((a.updated_at || a.submitted_at || a.created_at) as string).getTime())
          .slice(0, 5)

        recentSubmissions.forEach(submission => {
          const employee = allUsers.find(u => u.id === submission.employee_id)
          generatedNotifications.push({
            id: `submission-${submission.id}`,
            type: submission.status === 'approved' ? "achievement" : "update",
            title: submission.status === 'approved' 
              ? "Work Submission Approved" 
              : "Work Submission Update",
            description: `${submission.title || 'Submission'} has been ${submission.status}${employee ? ` by ${employee.name}` : ''}.`,
            timestamp: formatDistanceToNow(new Date((submission.updated_at || submission.submitted_at || submission.created_at) as string), { addSuffix: true }),
      read: false,
          })
        })

        // Task completion notifications
        const recentCompletions = allTasks
          .filter(t => t.status === 'completed')
          .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
          .slice(0, 3)

        recentCompletions.forEach(task => {
          const assignee = allUsers.find(u => u.id === task.assignee_id)
          generatedNotifications.push({
            id: `task-complete-${task.id}`,
      type: "update",
            title: "Task Completed",
            description: `${task.title} has been completed${assignee ? ` by ${assignee.name}` : ''}.`,
            timestamp: formatDistanceToNow(new Date(task.updated_at || task.created_at), { addSuffix: true }),
      read: false,
          })
        })

        setNotifications(generatedNotifications.slice(0, 10))
      } catch (error) {
        console.error('Error loading notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [user?.id, user?.role, user?.department, filterDepartment])

  // Generate activity feed from real data
  const activityFeed = useMemo(() => {
    const activities: ActivityFeed[] = []
    
    // Recent task completions
    const recentTasks = tasks
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 3)

    recentTasks.forEach(task => {
      const assignee = users.find(u => u.id === task.assignee_id)
      if (assignee) {
        activities.push({
          id: `activity-task-${task.id}`,
          author: assignee.name,
      action: "completed",
          target: task.title,
          timestamp: formatDistanceToNow(new Date(task.updated_at || task.created_at), { addSuffix: true }),
      icon: CheckCircle2,
      color: "text-green-500",
        })
      }
    })

    // Recent submissions
    const recentSubs = submissions
      .filter(s => s.status === 'approved')
      .sort((a, b) => new Date(b.reviewed_at || b.submitted_at).getTime() - new Date(a.reviewed_at || a.submitted_at).getTime())
      .slice(0, 2)

    recentSubs.forEach(submission => {
      const employee = users.find(u => u.id === submission.employee_id)
      if (employee) {
        activities.push({
          id: `activity-submission-${submission.id}`,
          author: employee.name,
          action: "submitted",
          target: submission.title || 'Work submission',
          timestamp: formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true }),
      icon: MessageSquare,
      color: "text-blue-500",
        })
      }
    })

    return activities.slice(0, 5)
  }, [tasks, submissions, users])

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "alert":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "update":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "message":
        return "bg-accent/10 text-accent border-accent/20"
      case "achievement":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return ""
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "alert":
        return AlertCircle
      case "update":
        return CheckCircle2
      case "message":
        return MessageSquare
      case "achievement":
        return TrendingUp
      default:
        return Bell
    }
  }

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with important alerts and activities
              {user && !['admin', 'executive', 'ceo'].includes(user.role || '') && 
                ` • ${filterDepartment === 'own' ? 'Your department' : filterDepartment === 'all' ? 'All departments' : filterDepartment}`
              }
            </p>
          </div>
          <div className="flex gap-2">
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
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark all as read ({unreadCount})
            </Button>
          )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Notifications */}
          <div className="col-span-2 space-y-3">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type)
              return (
                <Card
                  key={notification.id}
                  className={`border-2 cursor-pointer transition-all ${
                    notification.read ? "border-border/50 bg-card/50" : "border-accent/50 bg-accent/5"
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                          </div>
                          {!notification.read && <div className="flex-shrink-0 h-2 w-2 rounded-full bg-accent mt-1" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }))}
          </div>

          {/* Activity Feed Sidebar */}
          <div className="col-span-1">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Activity Feed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activityFeed.map((activity) => {
                  const IconComponent = activity.icon
                  return (
                    <div key={activity.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                      <div className={`flex-shrink-0 mt-1 ${activity.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          <span className="font-semibold">{activity.author}</span> {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{activity.target}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
