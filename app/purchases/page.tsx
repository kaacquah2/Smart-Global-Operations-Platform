"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { getPurchaseRequests, subscribeToPurchaseRequests } from "@/lib/supabase/queries"
import { useRouter } from "next/navigation"
import Link from "next/link"

export const dynamic = 'force-dynamic'

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText },
  submitted: { label: 'Submitted', color: 'bg-blue-500', icon: Clock },
  finance_review: { label: 'Finance Review', color: 'bg-yellow-500', icon: DollarSign },
  procurement_review: { label: 'Procurement Review', color: 'bg-orange-500', icon: FileText },
  legal_review: { label: 'Legal Review', color: 'bg-purple-500', icon: AlertCircle },
  audit_review: { label: 'Audit Review', color: 'bg-red-500', icon: AlertCircle },
  executive_approval: { label: 'Executive Approval', color: 'bg-indigo-500', icon: CheckCircle },
  approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle },
  receipt_requested: { label: 'Receipt Requested', color: 'bg-amber-500', icon: FileText },
  rejected: { label: 'Rejected', color: 'bg-red-600', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-600', icon: XCircle },
}

export default function PurchasesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  // Check if user can see full details of a request
  const canSeeFullDetails = (request: any) => {
    if (!user) return false
    
    // Admins, CEO, Executives can see everything
    if (['admin', 'ceo', 'executive'].includes(user.role || '')) return true
    
    // User's own requests
    if (request.requestor_id === user.id) return true
    
    // Same department requests
    if (request.requestor?.department === user.department) return true
    
    // Finance department can see all requests in finance_review, audit_review stages
    if (user.department === 'Finance & Accounting' && 
        ['finance_review', 'audit_review', 'submitted'].includes(request.status)) {
      return true
    }
    
    // Procurement can see all requests in procurement_review stage
    if (user.department === 'Procurement & Supply-Chain' && 
        request.status === 'procurement_review') {
      return true
    }
    
    // Legal can see all requests in legal_review stage
    if (user.department === 'Legal & Compliance' && 
        request.status === 'legal_review') {
      return true
    }
    
    return false
  }

  // Memoize the load function to prevent unnecessary re-renders
  const loadRequests = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    // If data was fetched recently (within 30 seconds) and not forcing refresh, skip
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
      
      // Load requests - filter based on department access
      let allRequests = await getPurchaseRequests()
      
      // Filter based on user's access
      if (!['admin', 'ceo', 'executive'].includes(user.role || '')) {
        allRequests = (allRequests || []).filter((req: any) => {
          // User's own requests - always visible
          if (req.requestor_id === user.id) return true
          
          // Same department requests - always visible
          if (req.requestor?.department === user.department) return true
          
          // Finance department can see all requests in relevant stages
          if (user.department === 'Finance & Accounting' && 
              ['finance_review', 'audit_review', 'submitted'].includes(req.status)) {
            return true
          }
          
          // Procurement can see requests in procurement_review stage
          if (user.department === 'Procurement & Supply-Chain' && 
              req.status === 'procurement_review') {
            return true
          }
          
          // Legal can see requests in legal_review stage
          if (user.department === 'Legal & Compliance' && 
              req.status === 'legal_review') {
            return true
          }
          
          // Other departments can see limited view (status only) for other departments' requests
          // We'll show them but with limited details in the UI
          return true // Show all but with limited details
        })
      }
      
      setRequests(allRequests || [])
      setLastFetchTime(Date.now())
    } catch (error) {
      console.error('Error loading purchase requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, user?.role, user?.department, lastFetchTime])

  // Load data when user is available
  useEffect(() => {
    if (user?.id) {
      loadRequests()
    } else {
      setLoading(false)
    }
  }, [user?.id]) // Only depend on user.id, not the whole user object

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return

    const subscription = subscribeToPurchaseRequests((payload) => {
      // Only reload if the request belongs to the current user
      if (payload.new && payload.new.requestor_id === user.id) {
        // Debounce reloads - wait 1 second before reloading
        setTimeout(() => {
          loadRequests(true)
        }, 1000)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id, loadRequests])

  // Filter requests based on status
  const filteredRequests = useMemo(() => {
    if (filterStatus === 'all') {
      return requests
    }
    return requests.filter(r => r.status === filterStatus)
  }, [requests, filterStatus])

  // Calculate stats
  const stats = useMemo(() => {
    const totalValue = filteredRequests.reduce((sum, r) => sum + parseFloat(r.estimated_cost || 0), 0)
    const pendingCount = filteredRequests.filter(r => 
      ['draft', 'submitted', 'finance_review', 'procurement_review', 'legal_review', 'audit_review', 'executive_approval'].includes(r.status)
    ).length
    
    return { totalValue, pendingCount }
  }, [filteredRequests])


  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Purchase Requests</h1>
            <p className="text-muted-foreground">Create and track your purchase requests</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadRequests(true)}
              disabled={refreshing || loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/purchases/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredRequests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {config.label}
            </Button>
          ))}
        </div>

        {/* Requests List */}
        {loading && requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading purchase requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No purchase requests</h3>
              <p className="text-muted-foreground mb-4">Create your first purchase request to get started</p>
              <Link href="/purchases/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const StatusIcon = statusConfig[request.status]?.icon || FileText
              const hasFullAccess = canSeeFullDetails(request)
              const isFromOtherDepartment = request.requestor?.department !== user?.department && 
                                            request.requestor_id !== user?.id
              
              return (
                <Link key={request.id} href={`/purchases/${request.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {hasFullAccess ? request.title : 'Purchase Request'}
                            {!hasFullAccess && isFromOtherDepartment && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (Other Department)
                              </span>
                            )}
                          </CardTitle>
                          {hasFullAccess ? (
                            <CardDescription className="mt-1">
                              {request.description?.substring(0, 100)}...
                            </CardDescription>
                          ) : (
                            <CardDescription className="mt-1 text-muted-foreground italic">
                              Limited view - Full details available to requestor's department only
                            </CardDescription>
                          )}
                        </div>
                        <Badge className={statusConfig[request.status]?.color || 'bg-gray-500'}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[request.status]?.label || request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {hasFullAccess ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Estimated Cost</div>
                            <div className="font-semibold">${parseFloat(request.estimated_cost || 0).toLocaleString()} {request.currency || 'USD'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Category</div>
                            <div className="font-semibold capitalize">{request.category}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Urgency</div>
                            <div className="font-semibold capitalize">{request.urgency || 'Normal'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Created</div>
                            <div className="font-semibold">
                              {new Date(request.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Status</div>
                            <div className="font-semibold">{statusConfig[request.status]?.label || request.status}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Requestor Department</div>
                            <div className="font-semibold">{request.requestor?.department || 'Unknown'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Created</div>
                            <div className="font-semibold">
                              {new Date(request.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </LayoutWithSidebar>
  )
}

