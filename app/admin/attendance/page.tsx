"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Clock, 
  Calendar, 
  Download,
  Search,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useState, useEffect } from "react"
import { getAllUsers } from "@/lib/supabase/queries"
import { format } from "date-fns"

export default function AdminAttendancePage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await getAllUsers()
        setUsers(usersData || [])
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  // Mock attendance data for all users
  const getUserAttendance = (userId: string) => {
    return {
      presentDays: Math.floor(Math.random() * 20) + 15,
      absentDays: Math.floor(Math.random() * 5),
      totalHours: (Math.random() * 160 + 120).toFixed(1),
      avgHours: (Math.random() * 2 + 7).toFixed(1),
      attendanceRate: (Math.random() * 20 + 80).toFixed(1),
      onTimeRate: (Math.random() * 30 + 70).toFixed(1),
      lateCount: Math.floor(Math.random() * 5),
      earlyLeaveCount: Math.floor(Math.random() * 3),
    }
  }

  const overallStats = {
    totalUsers: users.length,
    usersPresent: Math.floor(users.length * 0.85),
    usersAbsent: Math.floor(users.length * 0.15),
    avgAttendanceRate: 87.5,
    totalHoursLogged: (users.length * 8 * 22).toFixed(0),
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
                <Clock className="h-8 w-8 text-accent" />
                Attendance Management
              </h1>
              <p className="text-muted-foreground">
                Monitor and manage employee attendance across the organization
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Overall Statistics */}
          <div className="mb-6 grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold">{overallStats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Present Today</p>
                    <p className="text-2xl font-bold text-green-600">{overallStats.usersPresent}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Absent Today</p>
                    <p className="text-2xl font-bold text-red-600">{overallStats.usersAbsent}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Attendance</p>
                    <p className="text-2xl font-bold text-emerald-600">{overallStats.avgAttendanceRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Hours Logged</p>
                    <p className="text-2xl font-bold">{overallStats.totalHoursLogged}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-10"
                  />
                </div>
                <Input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Employee Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Attendance ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-muted-foreground">Loading attendance data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold">Employee</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Present Days</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Absent Days</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Total Hours</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Avg Hours/Day</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Attendance Rate</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">On-Time Rate</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const attendance = getUserAttendance(u.id)
                        return (
                          <tr key={u.id} className="border-b border-border/50 hover:bg-accent/5">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">
                                  {u.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-medium">{u.name}</p>
                                  <p className="text-sm text-muted-foreground">{u.department}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-green-600">{attendance.presentDays}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-red-600">{attendance.absentDays}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold">{attendance.totalHours}h</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold">{attendance.avgHours}h</span>
                            </td>
                            <td className="py-4 px-4">
                              <Badge 
                                className={
                                  parseFloat(attendance.attendanceRate) >= 95
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : parseFloat(attendance.attendanceRate) >= 80
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }
                              >
                                {attendance.attendanceRate}%
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline">{attendance.onTimeRate}%</Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Calendar className="h-4 w-4" />
                                View Details
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
