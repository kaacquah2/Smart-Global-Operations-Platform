"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Scale, FileText, AlertCircle, Clock, ArrowRight, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getPurchaseRequests, getLegalReviews } from "@/lib/supabase/queries"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function LegalDashboard() {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [legalReviews, setLegalReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const [requests, reviews] = await Promise.all([
          getPurchaseRequests({ status: 'legal_review' }),
          getLegalReviews({ status: 'pending' })
        ])
        setPendingRequests(requests)
        setLegalReviews(reviews)
      } catch (error) {
        console.error('Error loading legal data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Legal & Compliance Dashboard</h1>
          <p className="text-muted-foreground">Manage legal reviews and compliance cases</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchase Reviews</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting legal review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legal Cases</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{legalReviews.length}</div>
              <p className="text-xs text-muted-foreground">Pending legal reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {legalReviews.filter(r => r.priority === 'high' || r.priority === 'urgent').length}
              </div>
              <p className="text-xs text-muted-foreground">Urgent cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">OK</div>
              <p className="text-xs text-muted-foreground">Compliance status</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Purchase Request Reviews</CardTitle>
                  <CardDescription>Legal review for purchase requests</CardDescription>
                </div>
                <Link href="/purchases?status=legal_review">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No pending reviews</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <Link key={request.id} href={`/purchases/${request.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-accent transition-colors">
                        <h4 className="font-semibold text-sm">{request.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          ${parseFloat(request.estimated_cost || 0).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Legal Review Cases</CardTitle>
                  <CardDescription>Standalone legal review cases</CardDescription>
                </div>
                <Button variant="outline" size="sm" disabled>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : legalReviews.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No pending cases</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {legalReviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">{review.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {review.request_type}
                        </Badge>
                        {review.priority === 'high' || review.priority === 'urgent' && (
                          <Badge variant="destructive" className="text-xs">
                            {review.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}

