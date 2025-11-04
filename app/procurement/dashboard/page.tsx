"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, FileText, AlertCircle, Clock, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getPurchaseRequests } from "@/lib/supabase/queries"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function ProcurementDashboard() {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const requests = await getPurchaseRequests({ status: 'procurement_review' })
        setPendingRequests(requests)
      } catch (error) {
        console.error('Error loading procurement data:', error)
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

  const vendorRequests = pendingRequests.filter(r => r.vendor_name)

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Procurement Dashboard</h1>
          <p className="text-muted-foreground">Manage vendor relationships and procurement reviews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting procurement review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPendingValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Pending procurement value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Vendors</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorRequests.length}</div>
              <p className="text-xs text-muted-foreground">Requests with vendor info</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Vendor management coming soon</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pending Procurement Reviews</CardTitle>
                <CardDescription>Review purchase requests for vendor selection and procurement approval</CardDescription>
              </div>
              <Link href="/purchases?status=procurement_review">
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
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No purchase requests awaiting procurement review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.slice(0, 5).map((request) => (
                  <Link key={request.id} href={`/purchases/${request.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <h4 className="font-semibold">{request.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.vendor_name && `Vendor: ${request.vendor_name} • `}
                          Category: {request.category}
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
                        <Badge variant="outline" className="bg-orange-50">
                          Procurement Review
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutWithSidebar>
  )
}

