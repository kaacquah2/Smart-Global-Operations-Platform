"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  Target,
  BarChart3,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getTeamMembers, getTeamTasks } from "@/lib/supabase/queries"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { SidebarLayout } from "@/components/sidebar-layout"

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [teamTasks, setTeamTasks] = useState<any[]>([])
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

  const avgEfficiency = teamTaskStats.total > 0
    ? Math.round((teamTaskStats.completed / teamTaskStats.total) * 100)
    : 0

  // Task status distribution
  const taskStatusData = [
    { name: "Completed", value: teamTaskStats.completed, fill: "#22c55e" },
    { name: "In Progress", value: teamTaskStats.inProgress, fill: "#3b82f6" },
    { name: "Pending", value: teamTaskStats.pending, fill: "#eab308" },
  ]

  // Team efficiency data
  const teamEfficiencyData = teamMembers.map(member => {
    const memberTasks = teamTasks.filter(t => t.assignee_id === member.id)
    const completed = memberTasks.filter(t => t.status === 'completed').length
    const total = memberTasks.length
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      name: member.name.split(' ')[0],
      efficiency,
      tasks: total,
      completed
    }
  }).sort((a, b) => b.efficiency - a.efficiency)

  const stats = [
    { 
      icon: Users, 
      label: "Direct Reports", 
      value: teamMembers.length.toString(), 
      change: `${teamMembers.length} team members`,
      color: "text-blue-600"
    },
    { 
      icon: TrendingUp, 
      label: "Avg Team Efficiency", 
      value: `${avgEfficiency}%`, 
      change: `${teamTaskStats.completed}/${teamTaskStats.total} tasks completed`,
      color: "text-green-600"
    },
    { 
      icon: AlertCircle, 
      label: "Issues", 
      value: teamTaskStats.overdue.toString(), 
      change: teamTaskStats.overdue > 0 ? "Overdue tasks" : "All on track",
      color: teamTaskStats.overdue > 0 ? "text-red-600" : "text-green-600"
    },
    { 
      icon: Clock, 
      label: "In Progress", 
      value: teamTaskStats.inProgress.toString(), 
      change: "Active tasks",
      color: "text-orange-600"
    },
  ]

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Manager Dashboard</h1>
            <p className="text-muted-foreground">
              Overseeing {user?.branch} branch with {teamMembers.length} direct reports
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

          {/* Charts Grid */}
          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            {/* Team Efficiency */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Team Efficiency Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : teamEfficiencyData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No team data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamEfficiencyData}>
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
                      <Bar dataKey="tasks" fill="hsl(var(--primary))" name="Total Tasks" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Task Status Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
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

          {/* Team Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Under Management
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
                  <p className="text-muted-foreground">No team members yet</p>
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
