"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  Filter, 
  Download, 
  Search, 
  Calendar,
  User,
  Shield,
  FileText,
  Settings,
  ShoppingCart,
  Target,
  Users,
  RefreshCw
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useState, useEffect } from "react"

// Mock activity logs - in production, this would come from database
const generateMockLogs = () => {
  const actions = [
    { type: 'user_created', label: 'User Created', icon: User, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' },
    { type: 'user_updated', label: 'User Updated', icon: User, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900' },
    { type: 'user_deleted', label: 'User Deleted', icon: User, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900' },
    { type: 'permission_changed', label: 'Permission Changed', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900' },
    { type: 'task_created', label: 'Task Created', icon: Target, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900' },
    { type: 'task_assigned', label: 'Task Assigned', icon: Target, color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900' },
    { type: 'purchase_approved', label: 'Purchase Approved', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900' },
    { type: 'system_config', label: 'System Config Changed', icon: Settings, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900' },
  ]
  
  const users = ['John Admin', 'Sarah Manager', 'Mike Executive', 'Emma HR']
  const targets = ['employee.hr@company.com', 'New Task: Q4 Planning', 'Purchase Request #1234', 'System Settings']
  
  return Array.from({ length: 50 }, (_, i) => {
    const action = actions[Math.floor(Math.random() * actions.length)]
    const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    
    return {
      id: `log-${i}`,
      timestamp: date.toISOString(),
      user: users[Math.floor(Math.random() * users.length)],
      action: action.type,
      actionLabel: action.label,
      actionIcon: action.icon,
      actionColor: action.color,
      actionBg: action.bg,
      target: targets[Math.floor(Math.random() * targets.length)],
      details: `Action performed on ${targets[Math.floor(Math.random() * targets.length)]}`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      severity: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)] as 'info' | 'warning' | 'error'
    }
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export default function ActivityLogsPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [dateRange, setDateRange] = useState("7d")

  useEffect(() => {
    // In production, fetch from database
    const mockLogs = generateMockLogs()
    setLogs(mockLogs)
    setFilteredLogs(mockLogs)
  }, [])

  useEffect(() => {
    let filtered = [...logs]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actionLabel.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(log => log.action === filterType)
    }

    // Severity filter
    if (filterSeverity !== "all") {
      filtered = filtered.filter(log => log.severity === filterSeverity)
    }

    // Date range filter
    const now = new Date()
    const cutoffDate = new Date()
    if (dateRange === "24h") {
      cutoffDate.setHours(now.getHours() - 24)
    } else if (dateRange === "7d") {
      cutoffDate.setDate(now.getDate() - 7)
    } else if (dateRange === "30d") {
      cutoffDate.setDate(now.getDate() - 30)
    } else if (dateRange === "90d") {
      cutoffDate.setDate(now.getDate() - 90)
    }
    
    if (dateRange !== "all") {
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoffDate)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, filterType, filterSeverity, dateRange])

  const actionTypes = Array.from(new Set(logs.map(log => log.action)))
  const severityCounts = {
    info: logs.filter(l => l.severity === 'info').length,
    warning: logs.filter(l => l.severity === 'warning').length,
    error: logs.filter(l => l.severity === 'error').length,
  }

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Target', 'Details', 'IP Address', 'Severity'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.user,
        log.actionLabel,
        log.target,
        log.details,
        log.ipAddress,
        log.severity
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
                <Activity className="h-8 w-8 text-accent" />
                System Activity Logs
              </h1>
              <p className="text-muted-foreground">
                Monitor all system activities, user actions, and audit trails
              </p>
            </div>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Logs</p>
                    <p className="text-2xl font-bold">{logs.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Info</p>
                    <p className="text-2xl font-bold text-blue-600">{severityCounts.info}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                    <p className="text-2xl font-bold text-yellow-600">{severityCounts.warning}</p>
                  </div>
                  <Shield className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold text-red-600">{severityCounts.error}</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="all">All Actions</option>
                  {actionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs ({filteredLogs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Timestamp</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Action</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Target</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">IP Address</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const ActionIcon = log.actionIcon
                      return (
                        <tr key={log.id} className="border-b border-border/50 hover:bg-accent/5">
                          <td className="py-4 px-4 text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{log.user}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded ${log.actionBg}`}>
                                <ActionIcon className={`h-4 w-4 ${log.actionColor}`} />
                              </div>
                              <span className="text-sm">{log.actionLabel}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            {log.target}
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground font-mono">
                            {log.ipAddress}
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {filteredLogs.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No activity logs found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
