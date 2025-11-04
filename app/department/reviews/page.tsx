"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, X, MessageSquare, FileText, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getWorkSubmissionsForReview, reviewWorkSubmission } from "@/lib/supabase/queries"

export const dynamic = 'force-dynamic'

export default function ReviewsPage() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState<string>("5")

  useEffect(() => {
    if (!user || !['department_head', 'manager', 'executive', 'ceo', 'admin'].includes(user.role || '')) return

    const loadSubmissions = async () => {
      try {
        const data = await getWorkSubmissionsForReview(user.id)
        setSubmissions(data)
      } catch (error) {
        console.error('Error loading work submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [user])

  const handleApprove = async (id: string) => {
    if (!user) return
    try {
      await reviewWorkSubmission(id, user.id, 'approved', feedback, parseInt(rating))
      setSubmissions(submissions.filter(s => s.id !== id))
      setReviewing(null)
      setFeedback("")
      setRating("5")
    } catch (error) {
      console.error('Error approving submission:', error)
      alert('Failed to approve submission. Please try again.')
    }
  }

  const handleReject = async (id: string) => {
    if (!user) return
    try {
      await reviewWorkSubmission(id, user.id, 'rejected', feedback)
      setSubmissions(submissions.filter(s => s.id !== id))
      setReviewing(null)
      setFeedback("")
      setRating("5")
    } catch (error) {
      console.error('Error rejecting submission:', error)
      alert('Failed to reject submission. Please try again.')
    }
  }

  const getDaysWaiting = (submittedAt: string) => {
    const submitted = new Date(submittedAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - submitted.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (!user || !['department_head', 'manager', 'executive', 'ceo', 'admin'].includes(user.role || '')) {
    return (
      <LayoutWithSidebar>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">You don't have permission to review work submissions.</p>
          </CardContent>
        </Card>
      </LayoutWithSidebar>
    )
  }

  const pendingCount = submissions.length
  const awaitingAction = submissions.filter(s => getDaysWaiting(s.submitted_at) > 2).length

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pending Work Reviews</h1>
          <p className="text-muted-foreground">Review work submissions from your team members</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Awaiting Action</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{awaitingAction}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviewed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending reviews</h3>
              <p className="text-muted-foreground">All work submissions have been reviewed</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const employee = submission.employee
              const daysWaiting = getDaysWaiting(submission.submitted_at)
              
              return (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{submission.title}</CardTitle>
                        <CardDescription className="mt-1">
                          From <strong>{employee?.name || 'Unknown'}</strong> - Waiting {daysWaiting} day{daysWaiting !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{submission.description}</p>
                    
                    <div className="mb-4 flex items-center gap-2 border-t pt-4">
                      <span className="text-xs font-medium text-muted-foreground">
                        {submission.file_urls?.length || 0} file{(submission.file_urls?.length || 0) !== 1 ? 's' : ''} attached
                      </span>
                    </div>

                    {reviewing === submission.id ? (
                      <div className="space-y-4 rounded-lg border p-4">
                        <div>
                          <Label>Feedback (optional)</Label>
                          <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Add your feedback here..."
                            rows={3}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Rating (1-5)</Label>
                          <Select value={rating} onValueChange={setRating}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 - Excellent</SelectItem>
                              <SelectItem value="4">4 - Good</SelectItem>
                              <SelectItem value="3">3 - Satisfactory</SelectItem>
                              <SelectItem value="2">2 - Needs Improvement</SelectItem>
                              <SelectItem value="1">1 - Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(submission.id)}
                            className="flex-1 gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(submission.id)}
                            variant="destructive"
                            className="flex-1 gap-2"
                          >
                            <X className="h-4 w-4" />
                            Request Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setReviewing(null)
                              setFeedback("")
                              setRating("5")
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setReviewing(submission.id)} 
                        variant="outline" 
                        className="w-full gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Review Submission
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </LayoutWithSidebar>
  )
}
