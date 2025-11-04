"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, FileText, Trophy, Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { getTeamMembers, getTasks, getWorkSubmissions } from "@/lib/supabase/queries"

export default function MyDepartmentPage() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [teamTasks, setTeamTasks] = useState<any[]>([])
  const [teamSubmissions, setTeamSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDepartmentData = async () => {
      if (!user?.id || !user?.department) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Get team members (department members)
        const members = await getTeamMembers(user.id)
        // If no direct reports, get users from same department
        let deptMembers = members
        if (members.length === 0 || user.role === 'employee') {
          const { getAllUsers } = await import('@/lib/supabase/queries')
          const allUsers = await getAllUsers()
          deptMembers = allUsers.filter(u => 
            u.department === user.department && 
            u.is_active && 
            u.id !== user.id
          )
        }
        setTeamMembers(deptMembers)

        // Get tasks for department members
        const allTasks = await getTasks()
        const memberIds = new Set([user.id, ...deptMembers.map(m => m.id)])
        const deptTasks = allTasks.filter(t => 
          t.assignee_id && memberIds.has(t.assignee_id)
        )
        setTeamTasks(deptTasks)

        // Get work submissions for department
        const submissions = await getWorkSubmissions(undefined, user.department)
        setTeamSubmissions(submissions || [])
      } catch (error) {
        console.error('Error loading department data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDepartmentData()
  }, [user?.id, user?.department, user?.role])

  // Calculate team performance metrics
  const teamPerformance = teamMembers.map(member => {
    const memberTasks = teamTasks.filter(t => t.assignee_id === member.id)
    const completedTasks = memberTasks.filter(t => t.status === 'completed').length
    const totalTasks = memberTasks.length || 1
    const efficiency = Math.round((completedTasks / totalTasks) * 100)
    
    return {
      member: member.name,
      tasks: totalTasks,
      completed: completedTasks,
      efficiency
    }
  })

  // Add current user's performance
  const userTasks = teamTasks.filter(t => t.assignee_id === user?.id)
  const userCompleted = userTasks.filter(t => t.status === 'completed').length
  const userTotal = userTasks.length || 1
  const userEfficiency = Math.round((userCompleted / userTotal) * 100)
  
  const allPerformance = [
    { member: user?.name || "You", tasks: userTotal, completed: userCompleted, efficiency: userEfficiency },
    ...teamPerformance
  ]

  // Calculate stats
  const totalMembers = teamMembers.length + 1 // +1 for current user
  const avgEfficiency = allPerformance.length > 0
    ? Math.round(allPerformance.reduce((sum, p) => sum + p.efficiency, 0) / allPerformance.length)
    : 0
  const totalSubmissions = teamSubmissions.length
  const topPerformer = allPerformance.length > 1
    ? allPerformance.reduce((top, current) => current.efficiency > top.efficiency ? current : top)
    : { member: user?.name || "You", efficiency: userEfficiency }

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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{user?.department || 'Department'} Dashboard</h1>
          <p className="text-muted-foreground">Your department's performance and team metrics at {user?.branch}</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Team Members</p>
                  <p className="text-2xl font-bold">{totalMembers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Avg Efficiency</p>
                  <p className="text-2xl font-bold">{avgEfficiency}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Submissions</p>
                  <p className="text-2xl font-bold">{totalSubmissions}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Top Performer</p>
                  <p className="text-2xl font-bold text-sm truncate">{topPerformer.member}</p>
                  <p className="text-xs text-muted-foreground mt-1">{topPerformer.efficiency}% efficiency</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance */}
        {allPerformance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={allPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="member" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="tasks" fill="var(--primary)" name="Total Tasks" />
                  <Bar dataKey="completed" fill="var(--accent)" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            {allPerformance.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No team data available</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {allPerformance.map((member, idx) => (
                  <Card key={idx} className="border border-border bg-card/50">
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-accent">{member.member.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground truncate">{member.member}</p>
                          <p className="text-xs text-muted-foreground">{member.efficiency}% efficiency</p>
                        </div>
                      </div>
                      <div className="space-y-2 border-t border-border pt-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Tasks Completed</span>
                          <span className="font-semibold text-foreground">
                            {member.completed}/{member.tasks}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${member.tasks > 0 ? (member.completed / member.tasks) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutWithSidebar>
  )
}
