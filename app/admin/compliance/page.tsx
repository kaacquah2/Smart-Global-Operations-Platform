"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  FileText,
  Calendar,
  Download,
  TrendingUp,
  Users,
  Database,
  Lock,
  Eye
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useState } from "react"
import { format } from "date-fns"

export default function CompliancePage() {
  const { user } = useAuth()

  const complianceStandards = [
    {
      id: '1',
      name: 'GDPR Compliance',
      status: 'compliant',
      progress: 95,
      lastAudit: '2024-05-15',
      nextAudit: '2024-11-15',
      requirements: 25,
      completed: 24,
      description: 'General Data Protection Regulation compliance',
      category: 'Data Protection'
    },
    {
      id: '2',
      name: 'SOC 2 Type II',
      status: 'compliant',
      progress: 88,
      lastAudit: '2024-03-20',
      nextAudit: '2025-03-20',
      requirements: 50,
      completed: 44,
      description: 'Security and availability controls',
      category: 'Security'
    },
    {
      id: '3',
      name: 'ISO 27001',
      status: 'in_progress',
      progress: 72,
      lastAudit: '2024-01-10',
      nextAudit: '2024-07-10',
      requirements: 114,
      completed: 82,
      description: 'Information security management',
      category: 'Security'
    },
    {
      id: '4',
      name: 'HIPAA',
      status: 'non_compliant',
      progress: 45,
      lastAudit: '2023-12-05',
      nextAudit: '2024-06-05',
      requirements: 30,
      completed: 14,
      description: 'Health Insurance Portability and Accountability Act',
      category: 'Healthcare'
    },
    {
      id: '5',
      name: 'PCI DSS',
      status: 'compliant',
      progress: 92,
      lastAudit: '2024-04-18',
      nextAudit: '2024-10-18',
      requirements: 12,
      completed: 11,
      description: 'Payment Card Industry Data Security Standard',
      category: 'Payment Security'
    },
  ]

  const auditTrail = [
    {
      id: '1',
      action: 'Data Access',
      user: 'John Admin',
      resource: 'Employee Records',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      ipAddress: '192.168.1.100',
      status: 'approved',
      complianceStandard: 'GDPR'
    },
    {
      id: '2',
      action: 'Data Export',
      user: 'Sarah Manager',
      resource: 'Customer Database',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      ipAddress: '192.168.1.105',
      status: 'approved',
      complianceStandard: 'GDPR'
    },
    {
      id: '3',
      action: 'Policy Update',
      user: 'Mike Executive',
      resource: 'Privacy Policy',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      ipAddress: '192.168.1.120',
      status: 'approved',
      complianceStandard: 'ISO 27001'
    },
    {
      id: '4',
      action: 'Unauthorized Access Attempt',
      user: 'Unknown',
      resource: 'Admin Panel',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      ipAddress: '203.0.113.45',
      status: 'blocked',
      complianceStandard: 'SOC 2'
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'non_compliant': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const overallCompliance = {
    compliant: complianceStandards.filter(s => s.status === 'compliant').length,
    inProgress: complianceStandards.filter(s => s.status === 'in_progress').length,
    nonCompliant: complianceStandards.filter(s => s.status === 'non_compliant').length,
    avgProgress: Math.round(complianceStandards.reduce((sum, s) => sum + s.progress, 0) / complianceStandards.length),
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-8 w-8 text-accent" />
                Compliance & Audit Tools
              </h1>
              <p className="text-muted-foreground">
                Monitor compliance standards and audit trails
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Audit Report
            </Button>
          </div>

          {/* Statistics */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Compliant Standards</p>
                    <p className="text-2xl font-bold text-green-600">{overallCompliance.compliant}</p>
                    <p className="text-xs text-muted-foreground">of {complianceStandards.length} total</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-600">{overallCompliance.inProgress}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Non-Compliant</p>
                    <p className="text-2xl font-bold text-red-600">{overallCompliance.nonCompliant}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                    <p className="text-2xl font-bold text-emerald-600">{overallCompliance.avgProgress}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Standards */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Compliance Standards</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {complianceStandards.map((standard) => (
                <Card key={standard.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-lg">{standard.name}</CardTitle>
                        <CardDescription>{standard.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(standard.status)}>
                        {standard.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">{standard.progress}%</span>
                        </div>
                        <Progress value={standard.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                          <span>{standard.completed} of {standard.requirements} requirements met</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Last Audit</p>
                          <p className="text-sm font-medium">{format(new Date(standard.lastAudit), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Next Audit</p>
                          <p className="text-sm font-medium">{format(new Date(standard.nextAudit), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Track all compliance-related activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Timestamp</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Action</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Resource</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">IP Address</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Standard</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditTrail.map((audit) => (
                      <tr key={audit.id} className="border-b border-border/50 hover:bg-accent/5">
                        <td className="py-4 px-4 text-sm">
                          {format(audit.timestamp, 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium">{audit.action}</span>
                        </td>
                        <td className="py-4 px-4 text-sm">{audit.user}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{audit.resource}</td>
                        <td className="py-4 px-4 text-sm font-mono text-muted-foreground">{audit.ipAddress}</td>
                        <td className="py-4 px-4">
                          <Badge variant="outline">{audit.complianceStandard}</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge 
                            className={
                              audit.status === 'approved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }
                          >
                            {audit.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
