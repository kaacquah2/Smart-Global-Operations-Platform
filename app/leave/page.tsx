"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  FileText
} from "lucide-react"
import { 
  getLeaveTypes, 
  getLeaveBalance, 
  getLeaveRequests, 
  createLeaveRequest,
  subscribeToLeaveRequests
} from "@/lib/supabase/queries"

export const dynamic = 'force-dynamic'

interface LeaveBalance {
  id: string
  leave_type_id: string
  year: number
  total_allotted: number
  used: number
  pending: number
  remaining: number
  carried_forward: number
  leave_types: {
    id: string
    name: string
    description: string
    color: string
    max_days_per_year: number
  }
}

interface LeaveRequest {
  id: string
  leave_type_id: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  leave_types: {
    id: string
    name: string
    color: string
  }
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: AlertCircle },
}

export default function LeavePage() {
  const { user } = useAuth()
  const [leaveTypes, setLeaveTypes] = useState<any[]>([])
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
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

      // Only get current user's own leave requests
      const [types, balance, requests] = await Promise.all([
        getLeaveTypes(),
        getLeaveBalance(user.id),
        getLeaveRequests(user.id, filterStatus === 'all' ? undefined : filterStatus) // Only user's own requests
      ])
      setLeaveTypes(types || [])
      setLeaveBalance(balance || [])
      setLeaveRequests(requests || [])
      setLastFetchTime(Date.now())
    } catch (error) {
      console.error('Error loading leave data:', error)
      setLeaveTypes([])
      setLeaveBalance([])
      setLeaveRequests([])
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

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return

    const subscription = subscribeToLeaveRequests(user.id, (payload: any) => {
      // Debounce updates
      setTimeout(() => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          loadData(true)
        }
      }, 500)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id, loadData])

  const handleSubmitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    const formData = new FormData(e.currentTarget)
    const requestData = {
      user_id: user.id,
      leave_type_id: formData.get('leave_type_id') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      reason: formData.get('reason') as string,
    }

    const result = await createLeaveRequest(requestData)
    if (result) {
      setShowRequestForm(false)
      // Reload data
      const [balance, requests] = await Promise.all([
        getLeaveBalance(user.id),
        getLeaveRequests(user.id)
      ])
      setLeaveBalance(balance)
      setLeaveRequests(requests)
    }
  }

  // Memoize filtered requests
  const filteredRequests = useMemo(() => 
    filterStatus === 'all' 
      ? leaveRequests 
      : leaveRequests.filter(r => r.status === filterStatus)
  , [leaveRequests, filterStatus])

  const totalUsed = leaveBalance.reduce((sum, b) => sum + b.used, 0)
  const totalPending = leaveBalance.reduce((sum, b) => sum + b.pending, 0)
  const totalRemaining = leaveBalance.reduce((sum, b) => sum + b.remaining, 0)
  const totalAllotted = leaveBalance.reduce((sum, b) => sum + b.total_allotted + b.carried_forward, 0)

  return (
    <LayoutWithSidebar>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage your time off and leave requests</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData(true)}
                disabled={refreshing || loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setShowRequestForm(!showRequestForm)} className="gap-2">
                <Plus className="h-4 w-4" />
                Request Leave
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4 mt-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Allotted</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{totalAllotted}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
            <Card className="p-4 border-blue-200 dark:border-blue-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Used</p>
                  <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-400">{totalUsed}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
            <Card className="p-4 border-amber-200 dark:border-amber-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Pending</p>
                  <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400">{totalPending}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </Card>
            <Card className="p-4 border-green-200 dark:border-green-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Remaining</p>
                  <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-400">{totalRemaining}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </Card>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading leave data...</p>
              </div>
            ) : (
              <>
                {/* Request Form */}
                {showRequestForm && (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">New Leave Request</h2>
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Leave Type</label>
                        <select
                          name="leave_type_id"
                          required
                          className="w-full rounded-lg border border-border bg-background px-4 py-2"
                        >
                          <option value="">Select leave type</option>
                          {leaveTypes.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.name} {type.max_days_per_year > 0 && `(${type.max_days_per_year} days/year)`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Start Date</label>
                          <input
                            type="date"
                            name="start_date"
                            required
                            className="w-full rounded-lg border border-border bg-background px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">End Date</label>
                          <input
                            type="date"
                            name="end_date"
                            required
                            className="w-full rounded-lg border border-border bg-background px-4 py-2"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Reason</label>
                        <textarea
                          name="reason"
                          rows={3}
                          required
                          className="w-full rounded-lg border border-border bg-background px-4 py-2"
                          placeholder="Please provide a reason for your leave request..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Submit Request</Button>
                        <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                {/* Leave Balance Breakdown */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Leave Balance</h2>
                  <div className="space-y-4">
                    {leaveBalance.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No leave balance records found</p>
                    ) : (
                      leaveBalance.map(balance => {
                        const StatusIcon = statusConfig.pending.icon
                        const percentageUsed = balance.total_allotted + balance.carried_forward > 0
                          ? ((balance.used + balance.pending) / (balance.total_allotted + balance.carried_forward)) * 100
                          : 0

                        return (
                          <div key={balance.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold">{balance.leave_types.name}</h3>
                                <p className="text-sm text-muted-foreground">{balance.leave_types.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold">{balance.remaining}</p>
                                <p className="text-xs text-muted-foreground">days remaining</p>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Allotted</p>
                                <p className="font-semibold">{balance.total_allotted + balance.carried_forward}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Used</p>
                                <p className="font-semibold text-blue-600">{balance.used}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Pending</p>
                                <p className="font-semibold text-amber-600">{balance.pending}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Remaining</p>
                                <p className="font-semibold text-green-600">{balance.remaining}</p>
                              </div>
                            </div>
                            <div className="mt-2 w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </Card>

                {/* Leave Requests */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">My Leave Requests</h2>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="rounded-lg border border-border bg-background px-4 py-2 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    {filteredRequests.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No leave requests found</p>
                    ) : (
                      filteredRequests.map(request => {
                        const statusInfo = statusConfig[request.status]
                        const StatusIcon = statusInfo.icon

                        return (
                          <div key={request.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <div 
                                  className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: `${request.leave_types.color}20` }}
                                >
                                  <Calendar className="h-5 w-5" style={{ color: request.leave_types.color }} />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{request.leave_types.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">{request.total_days} day(s)</p>
                                </div>
                              </div>
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                            {request.reason && (
                              <p className="text-sm text-muted-foreground mb-3">{request.reason}</p>
                            )}
                            {request.rejection_reason && (
                              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2 mb-3">
                                <p className="text-sm text-red-700 dark:text-red-400">
                                  <strong>Rejection Reason:</strong> {request.rejection_reason}
                                </p>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                Requested: {new Date(request.created_at).toLocaleDateString()}
                              </span>
                              {request.approved_at && (
                                <span>
                                  {request.status === 'approved' ? 'Approved' : 'Rejected'}: {new Date(request.approved_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}

