"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Mail,
  AlertCircle
} from "lucide-react"
import { 
  getLeaveRequests, 
  approveLeaveRequest,
  rejectLeaveRequest,
  subscribeToLeaveRequests
} from "@/lib/supabase/queries"
import { BulkActions } from "@/components/bulk-actions"

export const dynamic = 'force-dynamic'

interface LeaveRequest {
  id: string
  user_id: string
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
  users: {
    id: string
    name: string
    email: string
  }
}

export default function LeaveApprovalsPage() {
  const { user } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)
      
      // For managers/department heads - only get their team's requests
      if (['department_head', 'manager'].includes(user.role || '')) {
        // Get team member IDs first
        const { getTeamMembers } = await import('@/lib/supabase/queries')
        const teamMembers = await getTeamMembers(user.id)
        const teamMemberIds = teamMembers.map(m => m.id)
        
        if (teamMemberIds.length > 0) {
          // Get leave requests for team members only
          const allRequests = await getLeaveRequests(undefined, filterStatus === 'all' ? undefined : filterStatus)
          const teamRequests = allRequests.filter(req => teamMemberIds.includes(req.user_id))
          setLeaveRequests(teamRequests)
        } else {
          setLeaveRequests([])
        }
      } else if (['admin', 'ceo', 'executive'].includes(user.role || '')) {
        // Admins, CEO, Executives can see all requests
        const requests = await getLeaveRequests(undefined, filterStatus === 'all' ? undefined : filterStatus)
        setLeaveRequests(requests)
      } else {
        // Regular employees see nothing (they shouldn't access this page)
        setLeaveRequests([])
      }
      
      setLoading(false)
    }

    loadData()

    // Subscribe to real-time updates
    if (user?.id) {
      const subscription = subscribeToLeaveRequests(user.id, (payload: any) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          loadData()
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user, filterStatus])

  const handleApprove = async (requestId: string) => {
    if (!user) return
    const result = await approveLeaveRequest(requestId, user.id)
    if (result) {
      // Reload data
      const requests = await getLeaveRequests(undefined, filterStatus === 'all' ? undefined : filterStatus)
      setLeaveRequests(requests)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!user || !rejectReason[requestId]) return
    const result = await rejectLeaveRequest(requestId, user.id, rejectReason[requestId])
    if (result) {
      setRejectReason({ ...rejectReason, [requestId]: '' })
    }
  }

  const handleBulkAction = async (ids: string[], action: string, comments?: string) => {
    if (!user) return

    if (action === 'approve') {
      for (const id of ids) {
        await approveLeaveRequest(id, user.id)
      }
    } else if (action === 'reject') {
      for (const id of ids) {
        await rejectLeaveRequest(id, user.id, comments || 'Bulk rejection')
      }
    }

    // Reload data
    const requests = await getLeaveRequests(undefined, filterStatus === 'all' ? undefined : filterStatus)
    setLeaveRequests(requests)
    setSelectedRequests([])
  }

  const pendingRequests = leaveRequests.filter(r => r.status === 'pending')

  return (
    <LayoutWithSidebar>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Leave Approvals</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review and approve leave requests from your team
              </p>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm"
            >
              <option value="pending">Pending ({pendingRequests.length})</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Requests</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading leave requests...</p>
              </div>
            ) : (
              <>
                {filterStatus === 'pending' && leaveRequests.filter(r => r.status === 'pending').length > 0 && (
                  <BulkActions
                    items={leaveRequests.filter(r => r.status === 'pending')}
                    selectedItems={selectedRequests}
                    onSelectionChange={setSelectedRequests}
                    onBulkAction={handleBulkAction}
                    actionType="approve"
                    title="Approve Selected Leave Requests"
                    description={`You are about to approve ${selectedRequests.length} leave request(s).`}
                  />
                )}
                {leaveRequests.length === 0 ? (
                  <Card className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold text-foreground mb-2">No leave requests found</p>
                    <p className="text-muted-foreground">
                      {filterStatus === 'pending' 
                        ? 'All pending requests have been processed' 
                        : 'No requests match the selected filter'}
                    </p>
                  </Card>
                ) : (
                  leaveRequests.map(request => {
                    const isPending = request.status === 'pending'
                    const daysUntilStart = Math.ceil(
                      (new Date(request.start_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    )

                    return (
                      <Card key={request.id} className="p-6">
                        {request.status === 'pending' && (
                          <div className="mb-4">
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(request.id)}
                              onChange={() => {
                                if (selectedRequests.includes(request.id)) {
                                  setSelectedRequests(selectedRequests.filter(id => id !== request.id))
                                } else {
                                  setSelectedRequests([...selectedRequests, request.id])
                                }
                              }}
                              className="h-4 w-4"
                            />
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div 
                              className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${request.leave_types.color}20` }}
                            >
                              <Calendar className="h-6 w-6" style={{ color: request.leave_types.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{request.users.name}</h3>
                                <Badge variant="outline" className="gap-1">
                                  <User className="h-3 w-3" />
                                  {request.users.email}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {request.total_days} day(s)
                                </span>
                                {isPending && (
                                  <span className={daysUntilStart < 7 ? 'text-amber-600 font-medium' : ''}>
                                    {daysUntilStart < 0 ? 'Started' : daysUntilStart === 0 ? 'Today' : `${daysUntilStart} days away`}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2">
                                <Badge 
                                  style={{ backgroundColor: `${request.leave_types.color}20`, color: request.leave_types.color }}
                                  className="border-0"
                                >
                                  {request.leave_types.name}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div>
                            {request.status === 'pending' && (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                            {request.status === 'approved' && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            )}
                            {request.status === 'rejected' && (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejected
                              </Badge>
                            )}
                          </div>
                        </div>

                        {request.reason && (
                          <div className="mb-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Reason:</p>
                            <p className="text-sm text-foreground">{request.reason}</p>
                          </div>
                        )}

                        {request.rejection_reason && (
                          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm font-medium mb-1 text-red-700 dark:text-red-400">Rejection Reason:</p>
                            <p className="text-sm text-red-600 dark:text-red-300">{request.rejection_reason}</p>
                          </div>
                        )}

                        {isPending && (
                          <div className="flex gap-3 items-end">
                            <div className="flex-1">
                              <label className="block text-sm font-medium mb-2">Rejection Reason (if rejecting)</label>
                              <textarea
                                value={rejectReason[request.id] || ''}
                                onChange={(e) => setRejectReason({ ...rejectReason, [request.id]: e.target.value })}
                                rows={2}
                                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm"
                                placeholder="Optional: Provide reason for rejection..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApprove(request.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReject(request.id)}
                                variant="destructive"
                                disabled={!rejectReason[request.id] || rejectReason[request.id].trim() === ''}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Requested: {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                          </span>
                          {request.approved_at && (
                            <span>
                              {request.status === 'approved' ? 'Approved' : 'Rejected'}: {new Date(request.approved_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </Card>
                    )
                  })
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}

