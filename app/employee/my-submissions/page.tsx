"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, MessageCircle, Plus, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import Link from "next/link"
import { getWorkSubmissions, getTeamMembers, getAllUsers } from "@/lib/supabase/queries"
import { format, formatDistanceToNow } from "date-fns"

const statusConfig = {
  approved: { icon: CheckCircle, label: "Approved", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900" },
  under_review: { icon: Clock, label: "Under Review", color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900" },
  submitted: { icon: Clock, label: "Submitted", color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900" },
  rejected: { icon: AlertCircle, label: "Rejected", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900" },
}

export default function MySubmissionsPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [teamSubmissions, setTeamSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSubmissions = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Get user's submissions
        const userSubmissions = await getWorkSubmissions(user.id)
        setSubmissions(userSubmissions || [])

        // Get team submissions for comparison
        if (user.department) {
          const deptSubmissions = await getWorkSubmissions(undefined, user.department)
          setTeamSubmissions(deptSubmissions || [])
        }
      } catch (error) {
        console.error('Error loading submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [user?.id, user?.department])

  // Calculate stats
  const stats = {
    total: submissions.length,
    approved: submissions.filter(s => s.status === 'approved').length,
    underReview: submissions.filter(s => s.status === 'under_review' || s.status === 'submitted').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  }

  // Calculate team averages
  const teamStats = {
    total: teamSubmissions.length,
    approved: teamSubmissions.filter(s => s.status === 'approved').length,
    avgApprovalRate: teamSubmissions.length > 0
      ? Math.round((teamSubmissions.filter(s => s.status === 'approved').length / teamSubmissions.length) * 100)
      : 0,
    userApprovalRate: submissions.length > 0
      ? Math.round((stats.approved / submissions.length) * 100)
      : 0,
  }

  const approvalComparison = teamStats.userApprovalRate - teamStats.avgApprovalRate

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
          <h1 className="text-3xl font-bold">My Submissions</h1>
          <p className="text-muted-foreground">Track and manage all your work submissions</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Submissions</p>
              <p className="text-2xl font-bold text-accent">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
              {teamSubmissions.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  {approvalComparison > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">
                        {Math.abs(approvalComparison)}% above team avg
                      </span>
                    </>
                  ) : approvalComparison < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-red-500">
                        {Math.abs(approvalComparison)}% below team avg
                      </span>
                    </>
                  ) : (
                    <>
                      <Minus className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">At team avg</span>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Under Review</p>
              <p className="text-2xl font-bold text-blue-500">{stats.underReview}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Rejected</p>
              <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground mb-4">Start by submitting your first work item</p>
              <Link href="/employee/submit-work">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Submit New Work
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const statusConfig_ = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.submitted
              const StatusIcon = statusConfig_.icon
              const submittedDate = submission.submitted_at ? new Date(submission.submitted_at) : new Date()
              const daysSince = Math.floor((new Date().getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <Card key={submission.id} className="border border-border bg-card">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground">{submission.title || 'Untitled Submission'}</h3>
                          <Badge className={`${statusConfig_.bgColor} ${statusConfig_.color} border-0`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig_.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted {formatDistanceToNow(submittedDate, { addSuffix: true })}
                          {submission.submitted_at && ` • ${format(submittedDate, 'MMM d, yyyy')}`}
                        </p>
                        {submission.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{submission.description}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>

                    <div className="mb-4 grid gap-4 md:grid-cols-3 border-t border-border pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Reviewed By</p>
                        <p className="text-sm font-medium text-foreground">
                          {submission.reviewer_id ? (submission.reviewer?.name || 'Unknown') : 'Pending Review'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Files Attached</p>
                        <p className="text-sm font-medium text-foreground">
                          {submission.file_urls?.length || 0} file{(submission.file_urls?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Days Since Submission</p>
                        <p className="text-sm font-medium text-foreground">
                          {daysSince} day{daysSince !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {submission.review_notes && (
                      <div className="rounded-lg border border-border bg-card/50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <MessageCircle className="h-4 w-4" />
                          Feedback{submission.reviewer?.name && ` from ${submission.reviewer.name}`}
                          {submission.review_rating && (
                            <Badge variant="outline" className="ml-auto">
                              Rating: {submission.review_rating}/5
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{submission.review_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* New Submission */}
        <div className="mt-8 text-center">
          <Link href="/employee/submit-work">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Submit New Work
            </Button>
          </Link>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
