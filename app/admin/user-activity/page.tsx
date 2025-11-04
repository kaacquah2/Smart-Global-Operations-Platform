"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Search, 
  Download,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Target,
  ShoppingCart
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useState, useEffect } from "react"
import { getAllUsers } from "@/lib/supabase/queries"
import Link from "next/link"

export default function UserActivityPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
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

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || u.role === filterRole
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && u.is_active) ||
      (filterStatus === "inactive" && !u.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  // Mock activity data - in production, fetch from database
  const getUserActivity = (userId: string) => {
    return {
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      loginCount: Math.floor(Math.random() * 50) + 10,
      tasksCompleted: Math.floor(Math.random() * 30),
      tasksAssigned: Math.floor(Math.random() * 20) + 5,
      submissionsCount: Math.floor(Math.random() * 15),
      purchaseRequests: Math.floor(Math.random() * 10),
      status: ['online', 'away', 'offline'][Math.floor(Math.random() * 3)] as 'online' | 'away' | 'offline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Department', 'Last Login', 'Login Count', 'Status'],
      ...filteredUsers.map(u => {
        const activity = getUserActivity(u.id)
        return [
          u.name,
          u.email,
          u.role,
          u.department,
          new Date(activity.lastLogin).toLocaleString(),
          activity.loginCount.toString(),
          activity.status
        ]
      })
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user-activity-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    online: Math.floor(users.length * 0.3),
    away: Math.floor(users.length * 0.1)
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
                <Users className="h-8 w-8 text-accent" />
                User Activity Monitoring
              </h1>
              <p className="text-muted-foreground">
                Track and monitor user activities across the system
              </p>
            </div>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Online Now</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.online}</p>
                  </div>
                  <Clock className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Away</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.away}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="employee">Employee</option>
                  <option value="department_head">Department Head</option>
                  <option value="manager">Manager</option>
                  <option value="executive">Executive</option>
                  <option value="ceo">CEO</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Last Login</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Activity</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const activity = getUserActivity(u.id)
                        return (
                          <tr key={u.id} className="border-b border-border/50 hover:bg-accent/5">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold">
                                    {u.name?.charAt(0) || 'U'}
                                  </div>
                                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(activity.status)}`} />
                                </div>
                                <div>
                                  <p className="font-medium">{u.name}</p>
                                  <p className="text-sm text-muted-foreground">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className="capitalize">
                                {u.role?.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge 
                                className={
                                  u.is_active 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                }
                              >
                                {u.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-sm text-muted-foreground">
                              {new Date(activity.lastLogin).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <Target className="h-3 w-3 text-muted-foreground" />
                                  <span>{activity.tasksCompleted} tasks</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <FileText className="h-3 w-3" />
                                  <span>{activity.submissionsCount} submissions</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
