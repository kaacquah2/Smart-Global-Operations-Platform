"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, FileText, AlertTriangle, Clock, ArrowRight, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getPurchaseRequests, getAuditCases } from "@/lib/supabase/queries"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function AuditDashboard() {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [auditCases, setAuditCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const [requests, cases] = await Promise.all([
          getPurchaseRequests({ status: 'audit_review' }),
          getAuditCases({ status: 'pending' })
        ])
        setPendingRequests(requests)
        setAuditCases(cases)
      } catch (error) {
        console.error('Error loading audit data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const highRiskCases = auditCases.filter(c => c.risk_level === 'high' || c.risk_level === 'critical')

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audit Dashboard</h1>
          <p className="text-muted-foreground">Manage audit reviews and compliance monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchase Reviews</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting audit review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audit Cases</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditCases.length}</div>
              <p className="text-xs text-muted-foreground">Active audit cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{highRiskCases.length}</div>
              <p className="text-xs text-muted-foreground">High/critical risk cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">Compliance rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Purchase Request Reviews</CardTitle>
                  <CardDescription>Audit review for purchase requests</CardDescription>
                </div>
                <Link href="/purchases?status=audit_review">
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
                  <CardTitle>Audit Cases</CardTitle>
                  <CardDescription>Active audit cases</CardDescription>
                </div>
                <Button variant="outline" size="sm" disabled>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : auditCases.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active cases</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditCases.slice(0, 3).map((case_) => (
                    <div key={case_.id} className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">{case_.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {case_.case_type}
                        </Badge>
                        {case_.risk_level && (
                          <Badge 
                            variant={case_.risk_level === 'high' || case_.risk_level === 'critical' ? 'destructive' : 'outline'} 
                            className="text-xs"
                          >
                            {case_.risk_level}
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

