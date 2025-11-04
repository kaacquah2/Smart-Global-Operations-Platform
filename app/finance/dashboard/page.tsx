"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getPurchaseRequests } from "@/lib/supabase/queries"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function FinanceDashboard() {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        // Get purchase requests in finance review stage
        const requests = await getPurchaseRequests({ status: 'finance_review' })
        setPendingRequests(requests)
      } catch (error) {
        console.error('Error loading finance data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const totalPendingValue = pendingRequests.reduce(
    (sum, r) => sum + parseFloat(r.estimated_cost || 0),
    0
  )

  const highValueRequests = pendingRequests.filter(
    r => parseFloat(r.estimated_cost || 0) > 10000
  )

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <p className="text-muted-foreground">Manage budgets, approvals, and financial reviews</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting your review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPendingValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total pending amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Value</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highValueRequests.length}</div>
              <p className="text-xs text-muted-foreground">Requests over $10K</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Healthy</div>
              <p className="text-xs text-muted-foreground">Within budget limits</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Reviews */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pending Purchase Request Reviews</CardTitle>
                <CardDescription>Review purchase requests waiting for finance approval</CardDescription>
              </div>
              <Link href="/purchases?status=finance_review">
                <Button variant="outline">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No purchase requests awaiting finance review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.slice(0, 5).map((request) => (
                  <Link key={request.id} href={`/purchases/${request.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold">{request.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          From {request.requestor?.name} • {request.department?.name || 'Unknown Department'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">
                            ${parseFloat(request.estimated_cost || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50">
                          Finance Review
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">View All Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/purchases">
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  All Purchase Requests
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Budget Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Financial Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                <DollarSign className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}

