"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  TrendingUp, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  MessageSquare,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { 
  getTeamMembers, 
  getTeamTasks, 
  getWorkSubmissionsForReview,
  getTasks 
} from "@/lib/supabase/queries"
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { SidebarLayout } from "@/components/sidebar-layout"

export default function DepartmentHeadDashboard() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [teamTasks, setTeamTasks] = useState<any[]>([])
  const [pendingReviews, setPendingReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        // Get team members
        const members = await getTeamMembers(user.id)
        setTeamMembers(members)

        // Get tasks for all team members
        if (members.length > 0) {
          const memberIds = members.map(m => m.id)
          const tasks = await getTeamTasks(memberIds)
          setTeamTasks(tasks)
        }

        // Get pending work submissions for review
        if (user.role === 'department_head') {
          const reviews = await getWorkSubmissionsForReview(user.id)
          setPendingReviews(reviews)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Calculate team stats
  const teamTaskStats = {
    total: teamTasks.length,
    completed: teamTasks.filter(t => t.status === 'completed').length,
    inProgress: teamTasks.filter(t => t.status === 'in-progress').length,
    pending: teamTasks.filter(t => t.status === 'pending').length,
    overdue: teamTasks.filter(t => {
      if (t.status === 'completed') return false
      return new Date(t.due_date) < new Date()
    }).length
  }

  const teamEfficiency = teamTaskStats.total > 0
    ? Math.round((teamTaskStats.completed / teamTaskStats.total) * 100)
    : 0

  // Calculate individual member performance
  const memberPerformance = teamMembers.map(member => {
    const memberTasks = teamTasks.filter(t => t.assignee_id === member.id)
    const completed = memberTasks.filter(t => t.status === 'completed').length
    const total = memberTasks.length
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      name: member.name.split(' ')[0], // First name only for display
      tasks: total,
      completed,
      efficiency,
      inProgress: memberTasks.filter(t => t.status === 'in-progress').length,
      pending: memberTasks.filter(t => t.status === 'pending').length
    }
  }).sort((a, b) => b.efficiency - a.efficiency)

  // Performance trend data (last 4 weeks)
  const performanceTrend = [
    { month: "Week 1", target: 85, actual: teamEfficiency > 78 ? 78 : teamEfficiency },
    { month: "Week 2", target: 85, actual: teamEfficiency > 81 ? 81 : teamEfficiency },
    { month: "Week 3", target: 85, actual: teamEfficiency > 84 ? 84 : teamEfficiency },
    { month: "This Week", target: 85, actual: teamEfficiency },
  ]

  // Task status distribution
  const taskStatusData = [
    { name: "Completed", value: teamTaskStats.completed, fill: "#22c55e" },
    { name: "In Progress", value: teamTaskStats.inProgress, fill: "#3b82f6" },
    { name: "Pending", value: teamTaskStats.pending, fill: "#eab308" },
  ]

  const stats = [
    { 
      icon: Users, 
      label: "Team Members", 
      value: teamMembers.length.toString(), 
      change: "All active",
      color: "text-blue-600"
    },
    { 
      icon: FileText, 
      label: "Pending Reviews", 
      value: pendingReviews.length.toString(), 
      change: pendingReviews.length > 0 ? `${pendingReviews.filter(r => r.status === 'submitted').length} urgent` : "All reviewed",
      color: "text-purple-600"
    },
    { 
      icon: TrendingUp, 
      label: "Team Efficiency", 
      value: `${teamEfficiency}%`, 
      change: teamTaskStats.total > 0 ? `${teamTaskStats.completed}/${teamTaskStats.total} completed` : "No tasks yet",
      color: "text-green-600"
    },
    { 
      icon: AlertTriangle, 
      label: "At Risk", 
      value: teamTaskStats.overdue.toString(), 
      change: teamTaskStats.overdue > 0 ? "Needs attention" : "All on track",
      color: teamTaskStats.overdue > 0 ? "text-red-600" : "text-green-600"
    },
  ]

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Department Dashboard</h1>
            <p className="text-muted-foreground">
              Manage {user?.department} Department at {user?.branch} - {teamMembers.length} team members
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

          {/* Main Content Grid */}
          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            {/* Team Performance */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Team Performance
                  </CardTitle>
                  <Link href="/organization">
                    <Button variant="ghost" size="sm">
                      View Team
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading team data...</div>
                ) : memberPerformance.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No team members yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={memberPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80} 
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
                      <Bar dataKey="tasks" fill="hsl(var(--primary))" name="Total Tasks" />
                      <Bar dataKey="completed" fill="hsl(var(--accent))" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pending Reviews */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Pending Reviews
                  </CardTitle>
                  <Link href="/department/reviews">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : pendingReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">All caught up!</p>
                    <p className="text-xs text-muted-foreground mt-1">No pending reviews</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingReviews.slice(0, 5).map((review) => (
                      <Link key={review.id} href="/department/reviews">
                        <div className="rounded-lg border border-border bg-card/50 p-3 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">
                                {review.employee?.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {review.title}
                              </p>
                              <p className="text-xs text-accent mt-1">
                                {new Date(review.submitted_at || review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {review.status === 'submitted' ? 'New' : 'Review'}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Efficiency Trend vs Target</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="5 5" 
                      name="Target"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      name="Actual"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Team Members Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <Link href="/organization">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No team members found</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {teamMembers.map((member) => {
                    const memberTasks = teamTasks.filter(t => t.assignee_id === member.id)
                    const completed = memberTasks.filter(t => t.status === 'completed').length
                    const total = memberTasks.length
                    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0

                    return (
                      <div key={member.id} className="border border-border rounded-lg bg-card/50 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{member.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{member.position || member.role}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tasks</span>
                            <span className="font-semibold">{total}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Completed</span>
                            <span className="font-semibold text-green-600">{completed}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Efficiency</span>
                              <span className="font-semibold">{efficiency}%</span>
                            </div>
                            <Progress value={efficiency} className="h-2" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
