"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Calendar,
  Building,
  MessageSquare,
  Download,
  History
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { 
  getPurchaseRequestById, 
  reviewPurchaseRequest, 
  getPurchaseWorkflowLog,
  subscribeToPurchaseRequests 
} from "@/lib/supabase/queries"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { CommentsSection } from "@/components/comments-section"

export const dynamic = 'force-dynamic'

const statusConfig: Record<string, { label: string; color: string; icon: any; description: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText, description: 'Not yet submitted' },
  submitted: { label: 'Submitted', color: 'bg-blue-500', icon: Clock, description: 'Awaiting finance review' },
  finance_review: { label: 'Finance Review', color: 'bg-yellow-500', icon: DollarSign, description: 'Under finance review' },
  procurement_review: { label: 'Procurement Review', color: 'bg-orange-500', icon: FileText, description: 'Under procurement review' },
  legal_review: { label: 'Legal Review', color: 'bg-purple-500', icon: AlertCircle, description: 'Under legal review' },
  audit_review: { label: 'Audit Review', color: 'bg-red-500', icon: AlertCircle, description: 'Under audit review' },
  executive_approval: { label: 'Executive Approval', color: 'bg-indigo-500', icon: CheckCircle, description: 'Awaiting executive approval' },
  approved: { label: 'Approved', color: 'bg-green-500', icon: CheckCircle, description: 'Approved and ready to process' },
  receipt_requested: { label: 'Receipt Requested', color: 'bg-amber-500', icon: FileText, description: 'Procurement team is requesting receipt' },
  rejected: { label: 'Rejected', color: 'bg-red-600', icon: XCircle, description: 'Request has been rejected' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-600', icon: XCircle, description: 'Request has been cancelled' },
}

const workflowStages = [
  { key: 'submitted', label: 'Submitted', department: 'Finance' },
  { key: 'finance_review', label: 'Finance Review', department: 'Finance & Accounting' },
  { key: 'procurement_review', label: 'Procurement Review', department: 'Procurement & Supply-Chain' },
  { key: 'legal_review', label: 'Legal Review', department: 'Legal & Compliance' },
  { key: 'audit_review', label: 'Audit Review', department: 'Finance & Accounting' },
  { key: 'executive_approval', label: 'Executive Approval', department: 'Executive' },
  { key: 'approved', label: 'Approved', department: 'Completed' },
]

export default function PurchaseRequestDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const requestId = params?.id as string

  const [request, setRequest] = useState<any>(null)
  const [workflowLog, setWorkflowLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | 'requested_changes' | null>(null)
  const [reviewComments, setReviewComments] = useState('')

  useEffect(() => {
    if (!requestId || !user) return

    const loadData = async () => {
      try {
        const [requestData, logData] = await Promise.all([
          getPurchaseRequestById(requestId),
          getPurchaseWorkflowLog(requestId)
        ])
        setRequest(requestData)
        setWorkflowLog(logData)
      } catch (error) {
        console.error('Error loading purchase request:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Subscribe to real-time updates
    const subscription = subscribeToPurchaseRequests((payload) => {
      if (payload.new?.id === requestId) {
        loadData()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [requestId, user])

  // Check if user can see full details
  const canSeeFullDetails = () => {
    if (!user || !request) return false
    
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

  const canReview = () => {
    if (!user || !request) return false
    
    const currentStatus = request.status
    const userDept = user.department

    // Check if user can review based on status and department
    if (currentStatus === 'finance_review' && userDept === 'Finance & Accounting') return true
    if (currentStatus === 'procurement_review' && userDept === 'Procurement & Supply-Chain') return true
    if (currentStatus === 'legal_review' && userDept === 'Legal & Compliance') return true
    if (currentStatus === 'audit_review' && userDept === 'Finance & Accounting') return true
    if (currentStatus === 'executive_approval' && ['executive', 'ceo', 'admin'].includes(user.role || '')) return true

    return false
  }

  const handleReview = async (action: 'approved' | 'rejected' | 'requested_changes') => {
    if (!user || !request) return

    try {
      setReviewing(true)
      await reviewPurchaseRequest(request.id, user.id, action, reviewComments)
      
      // Reload data
      const [requestData, logData] = await Promise.all([
        getPurchaseRequestById(requestId),
        getPurchaseWorkflowLog(requestId)
      ])
      setRequest(requestData)
      setWorkflowLog(logData)
      
      setReviewing(false)
      setReviewAction(null)
      setReviewComments('')
    } catch (error) {
      console.error('Error reviewing purchase request:', error)
      alert('Failed to review request. Please try again.')
      setReviewing(false)
    }
  }

  const getCurrentStageIndex = () => {
    if (!request) return -1
    return workflowStages.findIndex(s => s.key === request.status)
  }

  if (loading) {
    return (
      <LayoutWithSidebar>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </LayoutWithSidebar>
    )
  }

  if (!request) {
    return (
      <LayoutWithSidebar>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Request Not Found</h3>
            <p className="text-muted-foreground mb-4">The purchase request you're looking for doesn't exist.</p>
            <Link href="/purchases">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Requests
              </Button>
            </Link>
          </CardContent>
        </Card>
      </LayoutWithSidebar>
    )
  }

  const StatusIcon = statusConfig[request.status]?.icon || FileText
  const currentStageIndex = getCurrentStageIndex()
  const hasFullAccess = canSeeFullDetails()

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/purchases">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                {hasFullAccess ? request.title : 'Purchase Request'}
              </h1>
              <p className="text-muted-foreground">
                Purchase Request #{request.id.slice(0, 8)}
                {!hasFullAccess && (
                  <span className="ml-2 text-sm italic">
                    (Limited View - Other Department)
                  </span>
                )}
              </p>
            </div>
          </div>
          <Badge className={statusConfig[request.status]?.color || 'bg-gray-500'} variant="default">
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig[request.status]?.label || request.status}
          </Badge>
        </div>

        {!hasFullAccess && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    Limited Access
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    You are viewing a purchase request from another department. Only basic status information is available. 
                    Full details are restricted to the requestor's department and authorized review departments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasFullAccess ? (
                  <>
                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <p className="mt-1">{request.description}</p>
                    </div>
                    
                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Category</Label>
                        <p className="mt-1 font-semibold capitalize">{request.category}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Estimated Cost</Label>
                        <p className="mt-1 font-semibold">
                          {request.currency || 'USD'} ${parseFloat(request.estimated_cost || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Urgency</Label>
                        <p className="mt-1 font-semibold capitalize">{request.urgency || 'Normal'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Created</Label>
                        <p className="mt-1">{new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {request.vendor_name && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-muted-foreground">Vendor Information</Label>
                          <div className="mt-2 space-y-1">
                            <p><strong>Name:</strong> {request.vendor_name}</p>
                            {request.vendor_contact && <p><strong>Contact:</strong> {request.vendor_contact}</p>}
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div>
                      <Label className="text-muted-foreground">Justification</Label>
                      <p className="mt-1 whitespace-pre-wrap">{request.justification}</p>
                    </div>

                    {request.attachments && request.attachments.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-muted-foreground">Attachments</Label>
                          <div className="mt-2 space-y-2">
                            {request.attachments.map((url: string, idx: number) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:underline"
                              >
                                <Download className="h-4 w-4" />
                                Attachment {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <p className="mt-1 font-semibold">{statusConfig[request.status]?.label || request.status}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Requestor Department</Label>
                      <p className="mt-1 font-semibold">{request.requestor?.department || 'Unknown'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Created</Label>
                      <p className="mt-1">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground italic">
                        Full details are only available to the requestor's department and authorized review departments.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Workflow Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Workflow History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workflowLog.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No workflow activity yet</p>
                ) : (
                  <div className="space-y-4">
                    {workflowLog.map((log, idx) => (
                      <div key={log.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            log.action === 'approved' ? 'bg-green-100 text-green-600' :
                            log.action === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {log.action === 'approved' ? <CheckCircle className="h-4 w-4" /> :
                             log.action === 'rejected' ? <XCircle className="h-4 w-4" /> :
                             <AlertCircle className="h-4 w-4" />}
                          </div>
                          {idx < workflowLog.length - 1 && (
                            <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{log.reviewer?.name || 'Unknown'}</p>
                            <span className="text-muted-foreground text-sm">
                              {new Date(log.reviewed_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <Badge variant="outline" className="mr-2">{log.stage}</Badge>
                            Action: <span className="capitalize">{log.action}</span>
                          </p>
                          {log.comments && (
                            <p className="text-sm mt-2 p-2 bg-gray-50 rounded">{log.comments}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requestor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Requestor</p>
                    <p className="font-semibold">{request.requestor?.name || 'Unknown'}</p>
                  </div>
                </div>
                {request.department && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-semibold">{request.department?.name || request.department}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-semibold">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Stages */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflowStages.map((stage, idx) => {
                    const isCompleted = idx < currentStageIndex
                    const isCurrent = idx === currentStageIndex
                    const isPending = idx > currentStageIndex

                    return (
                      <div key={stage.key} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-blue-500 text-white' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            isCurrent ? 'text-blue-600' : 
                            isCompleted ? 'text-green-600' : 
                            'text-muted-foreground'
                          }`}>
                            {stage.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{stage.department}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Review Actions */}
            {canReview() && request.status !== 'approved' && request.status !== 'rejected' && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviewAction ? (
                    <>
                      <div>
                        <Label>Comments</Label>
                        <Textarea
                          value={reviewComments}
                          onChange={(e) => setReviewComments(e.target.value)}
                          placeholder="Add your review comments..."
                          rows={4}
                          className="mt-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReview(reviewAction)}
                          disabled={reviewing}
                          className="flex-1"
                          variant={reviewAction === 'approved' ? 'default' : reviewAction === 'rejected' ? 'destructive' : 'outline'}
                        >
                          {reviewing ? 'Processing...' : 'Confirm'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setReviewAction(null)
                            setReviewComments('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => setReviewAction('approved')}
                        className="w-full mb-2"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => setReviewAction('rejected')}
                        variant="destructive"
                        className="w-full mb-2"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => setReviewAction('requested_changes')}
                        variant="outline"
                        className="w-full"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Request Changes
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Comments & Discussion</CardTitle>
          </CardHeader>
          <CardContent>
            <CommentsSection
              entityType="purchase_request"
              entityId={request.id}
            />
          </CardContent>
        </Card>
      </div>
    </LayoutWithSidebar>
  )
}

