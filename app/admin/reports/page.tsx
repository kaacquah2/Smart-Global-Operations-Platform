"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  TrendingUp,
  Users,
  Target,
  ShoppingCart,
  Building2,
  BarChart3,
  FileSpreadsheet,
  FileJson,
  File
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useState } from "react"

const reportTemplates = [
  {
    id: "user-report",
    title: "User Activity Report",
    description: "Comprehensive report of all user activities and login statistics",
    icon: Users,
    category: "Users",
    format: ["PDF", "CSV", "Excel"]
  },
  {
    id: "task-report",
    title: "Task Performance Report",
    description: "Task completion rates, deadlines, and team performance metrics",
    icon: Target,
    category: "Tasks",
    format: ["PDF", "CSV", "Excel"]
  },
  {
    id: "purchase-report",
    title: "Purchase Request Report",
    description: "Purchase requests, approvals, and spending analysis",
    icon: ShoppingCart,
    category: "Finance",
    format: ["PDF", "CSV", "Excel"]
  },
  {
    id: "department-report",
    title: "Department Performance Report",
    description: "Department-wise performance metrics and KPIs",
    icon: Building2,
    category: "Analytics",
    format: ["PDF", "Excel"]
  },
  {
    id: "attendance-report",
    title: "Attendance & Leave Report",
    description: "Employee attendance, leave usage, and time tracking",
    icon: Calendar,
    category: "HR",
    format: ["PDF", "CSV", "Excel"]
  },
  {
    id: "system-report",
    title: "System Usage Report",
    description: "System metrics, uptime, and usage statistics",
    icon: BarChart3,
    category: "System",
    format: ["PDF", "JSON"]
  }
]

export default function ReportsPage() {
  const { user } = useAuth()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState("30d")
  const [format, setFormat] = useState("PDF")
  const [generating, setGenerating] = useState(false)

  const handleGenerateReport = async (reportId: string) => {
    setSelectedReport(reportId)
    setGenerating(true)
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setGenerating(false)
    // In production, trigger download or show preview
    alert(`Report generated! In production, this would download the ${format} file.`)
  }

  const categories = Array.from(new Set(reportTemplates.map(r => r.category)))

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-8 w-8 text-accent" />
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground">
              Generate comprehensive reports for your organization
            </p>
          </div>

          {/* Report Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Select date range and format for your reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="6m">Last 6 Months</option>
                    <option value="1y">Last Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Export Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="CSV">CSV Spreadsheet</option>
                    <option value="Excel">Excel Workbook</option>
                    <option value="JSON">JSON Data</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Templates by Category */}
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryReports = reportTemplates.filter(r => r.category === category)
              return (
                <div key={category}>
                  <h2 className="text-xl font-semibold mb-4 text-foreground">{category} Reports</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryReports.map((report) => {
                      const ReportIcon = report.icon
                      const isGenerating = generating && selectedReport === report.id
                      const isAvailable = report.format.includes(format)

                      return (
                        <Card key={report.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <div className={`p-2 rounded-lg bg-accent/10`}>
                                <ReportIcon className="h-5 w-5 text-accent" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {report.category}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription className="mt-2">
                              {report.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-1">
                                {report.format.map((fmt) => {
                                  const FormatIcon = 
                                    fmt === "PDF" ? File :
                                    fmt === "CSV" || fmt === "Excel" ? FileSpreadsheet :
                                    FileJson
                                  return (
                                    <Badge key={fmt} variant="outline" className="text-xs">
                                      <FormatIcon className="h-3 w-3 mr-1" />
                                      {fmt}
                                    </Badge>
                                  )
                                })}
                              </div>
                              <Button
                                onClick={() => handleGenerateReport(report.id)}
                                disabled={isGenerating || !isAvailable}
                                className="w-full gap-2"
                                variant={isAvailable ? "default" : "outline"}
                              >
                                {isGenerating ? (
                                  <>
                                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4" />
                                    Generate Report
                                  </>
                                )}
                              </Button>
                              {!isAvailable && (
                                <p className="text-xs text-muted-foreground text-center">
                                  {format} format not available for this report
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reports</p>
                    <p className="text-2xl font-bold">{reportTemplates.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Export Formats</p>
                    <p className="text-2xl font-bold">4</p>
                  </div>
                  <Download className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ready to Export</p>
                    <p className="text-2xl font-bold text-green-600">All</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
