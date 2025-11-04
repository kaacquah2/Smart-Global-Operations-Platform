"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Zap, Play, Pause, Copy, Trash2, Clock, AlertCircle } from "lucide-react"
import SidebarLayout from "@/components/sidebar-layout"

interface Workflow {
  id: string
  name: string
  trigger: string
  actions: string[]
  status: "active" | "paused" | "draft"
  runs: number
  lastRun: string
  efficiency: number
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: "1",
      name: "Auto-Assign High Priority Tasks",
      trigger: "When task priority is marked Critical",
      actions: ["Assign to manager", "Send email notification", "Add to dashboard"],
      status: "active",
      runs: 234,
      lastRun: "2 minutes ago",
      efficiency: 94,
    },
    {
      id: "2",
      name: "Daily Branch Performance Report",
      trigger: "Every day at 6:00 AM",
      actions: ["Generate report", "Send email to managers", "Update dashboard"],
      status: "active",
      runs: 45,
      lastRun: "Today at 6:00 AM",
      efficiency: 99,
    },
    {
      id: "3",
      name: "Escalate Overdue Tasks",
      trigger: "When task becomes 2 days overdue",
      actions: ["Change priority to Critical", "Reassign to manager", "Create alert"],
      status: "active",
      runs: 156,
      lastRun: "Yesterday at 3:45 PM",
      efficiency: 97,
    },
    {
      id: "4",
      name: "Weekly Resource Optimization",
      trigger: "Every Monday at 8:00 AM",
      actions: ["Analyze workload distribution", "Suggest reallocation", "Send recommendations"],
      status: "paused",
      runs: 23,
      lastRun: "7 days ago",
      efficiency: 88,
    },
    {
      id: "5",
      name: "Performance Threshold Alert",
      trigger: "When branch performance drops below 80%",
      actions: ["Send alert to management", "Log incident", "Generate analysis"],
      status: "active",
      runs: 89,
      lastRun: "4 hours ago",
      efficiency: 92,
    },
  ])

  const toggleWorkflow = (id: string) => {
    setWorkflows(
      workflows.map((w) => (w.id === id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w)),
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Workflow Automation</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Automate tasks and streamline your operations</p>
          </div>
          <Link href="/workflows/create">
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Workflows</p>
                  <p className="text-3xl font-bold text-foreground mt-1">4</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Runs</p>
                  <p className="text-3xl font-bold text-foreground mt-1">547</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Play className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Efficiency</p>
                  <p className="text-3xl font-bold text-foreground mt-1">94%</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <AlertCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflows List */}
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{workflow.name}</h3>
                      <Badge variant={workflow.status === "active" ? "default" : "secondary"}>{workflow.status}</Badge>
                      <div className="flex items-center gap-1 text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">
                        <AlertCircle className="h-3 w-3" />
                        {workflow.efficiency}% efficient
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      <span className="font-medium">Trigger:</span> {workflow.trigger}
                    </p>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-foreground mb-2">Actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {workflow.actions.map((action, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {workflow.runs} runs
                      </div>
                      <span>Last run: {workflow.lastRun}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleWorkflow(workflow.id)} className="gap-1">
                      {workflow.status === "active" ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Resume
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SidebarLayout>
  )
}
