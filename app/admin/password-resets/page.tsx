"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarLayout } from "@/components/sidebar-layout"
import { RefreshCw, Mail, Clock, CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PasswordResetRequest {
  id: string
  user_id: string | null
  user_email: string
  user_name: string | null
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  requested_at: string
  processed_by: string | null
  processed_at: string | null
  notes: string | null
}

export default function PasswordResetRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<PasswordResetRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null)

  const supabase = createClient()

  const loadRequests = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const { data, error } = await supabase
        .from('password_reset_requests')
        .select('*')
        .order('requested_at', { ascending: false })

      if (error) {
        console.error('Error loading password reset requests:', error)
        setRequests([])
      } else {
        setRequests(data || [])
      }
    } catch (error) {
      console.error('Error loading password reset requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const handleProcessRequest = async (request: PasswordResetRequest) => {
    if (!user?.id) return

    setSelectedRequest(request)
    setConfirmDialogOpen(true)
  }

  const confirmProcessRequest = async () => {
    if (!selectedRequest || !user?.id) return

    setProcessingId(selectedRequest.id)
    setConfirmDialogOpen(false)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          processedBy: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process password reset')
      }

      // Check if email was sent successfully
      if (data.emailSent === false) {
        // Check if it's a domain verification issue
        if (data.requiresDomainVerification) {
          const errorMsg = `⚠️ Domain Verification Required\n\n` +
            `Password was reset successfully, but Resend requires domain verification to send emails.\n\n` +
            `Error: ${data.emailError || 'Unknown error'}\n\n` +
            `Current Setup: Using test domain (onboarding@resend.dev)\n` +
            `Test domain only allows sending to: ${data.accountEmail || 'your account email'}\n\n` +
            `📧 New Password: ${data.newPassword || 'N/A'}\n\n` +
            `To fix this:\n` +
            `1. Go to ${data.helpUrl || 'https://resend.com/domains'}\n` +
            `2. Verify your domain\n` +
            `3. Update FROM_EMAIL in Vercel environment variables\n\n` +
            `For now, please manually send this password to the user.`
          
          alert(errorMsg)
          console.error('Domain verification required:', data.emailError)
          console.log('New Password (for manual sending):', data.newPassword)
        } else {
          // Show error with password so admin can manually send it
          const errorMsg = `Password was reset, but email failed to send.\n\n` +
            `Email Error: ${data.emailError || 'Unknown error'}\n\n` +
            `New Password: ${data.newPassword || 'N/A'}\n\n` +
            `Please manually send this password to the user via email or secure method.`
          
          alert(errorMsg)
          console.error('Email sending failed:', data.emailError)
          console.log('New Password (for manual sending):', data.newPassword)
        }
      } else if (data.success) {
        // Success - show success message
        alert('Password reset completed successfully! Email has been sent to the user.')
      }

      // Reload requests
      await loadRequests(true)
    } catch (error) {
      console.error('Error processing password reset:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process password reset'
      alert(`Error: ${errorMessage}`)
    } finally {
      setProcessingId(null)
      setSelectedRequest(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:bg-blue-200">Processing</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    completed: requests.filter(r => r.status === 'completed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="mb-2 text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-accent" />
                Password Reset Requests
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage and process password reset requests from users
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadRequests(true)}
              disabled={refreshing || loading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground">Total Requests</p>
                    <p className="mt-2 text-2xl md:text-3xl font-bold text-foreground">{stats.total}</p>
                  </div>
                  <Mail className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                    <p className="mt-2 text-2xl md:text-3xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground">Completed</p>
                    <p className="mt-2 text-2xl md:text-3xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground">Cancelled</p>
                    <p className="mt-2 text-2xl md:text-3xl font-bold text-red-600">{stats.cancelled}</p>
                  </div>
                  <XCircle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>Reset Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No password reset requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 border border-border rounded-lg hover:bg-card/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">
                              {request.user_name || 'Unknown User'}
                            </h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><strong>Email:</strong> {request.user_email}</p>
                            <p><strong>Requested:</strong> {new Date(request.requested_at).toLocaleString()}</p>
                            {request.processed_at && (
                              <p><strong>Processed:</strong> {new Date(request.processed_at).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <Button
                              onClick={() => handleProcessRequest(request)}
                              disabled={processingId === request.id}
                              className="gap-2"
                            >
                              {processingId === request.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  Process Request
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Password Reset Request?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will generate a new password for <strong>{selectedRequest?.user_email}</strong> based on their initials and year joined.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Password Format:</strong> User Initials + Year Joined + Special Character + Number
                <br />
                Example: If user is "John Smith" and joined in 2024, password will be like "JS2024!3"
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                The new password will be sent to the user via email immediately.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmProcessRequest}>Process Request</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarLayout>
  )
}

