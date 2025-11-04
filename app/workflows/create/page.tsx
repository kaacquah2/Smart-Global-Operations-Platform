"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronRight, Plus, X, Zap } from "lucide-react"
import SidebarLayout from "@/components/sidebar-layout"

export default function CreateWorkflowPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [workflow, setWorkflow] = useState({
    name: "",
    description: "",
    trigger: "",
    actions: [] as string[],
  })

  const triggers = [
    "When task priority is marked Critical",
    "When task status changes",
    "When task becomes overdue",
    "Every day at specific time",
    "Every week on specific day",
    "When performance drops below threshold",
    "When new task is assigned",
    "When task is completed",
  ]

  const availableActions = [
    "Send email notification",
    "Assign to team member",
    "Change task priority",
    "Change task status",
    "Add comment to task",
    "Generate report",
    "Update dashboard",
    "Create alert",
    "Log to system",
    "Escalate to manager",
  ]

  const handleAddAction = (action: string) => {
    if (!workflow.actions.includes(action)) {
      setWorkflow({ ...workflow, actions: [...workflow.actions, action] })
    }
  }

  const handleRemoveAction = (action: string) => {
    setWorkflow({ ...workflow, actions: workflow.actions.filter((a) => a !== action) })
  }

  const handleCreate = () => {
    if (workflow.name && workflow.trigger && workflow.actions.length > 0) {
      router.push("/workflows")
    }
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Link href="/workflows" className="text-accent hover:underline">
            Workflows
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">Create New</span>
        </div>

        {/* Step 1: Basic Info */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Step 1: Basic Information</CardTitle>
            <CardDescription>Name your workflow and add a description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Workflow Name</label>
              <Input
                placeholder="e.g., Auto-assign critical tasks"
                value={workflow.name}
                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Input
                placeholder="What does this workflow do?"
                value={workflow.description}
                onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Trigger */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Step 2: Select Trigger</CardTitle>
            <CardDescription>Choose what will start this workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {triggers.map((trigger) => (
                <div
                  key={trigger}
                  onClick={() => setWorkflow({ ...workflow, trigger })}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    workflow.trigger === trigger ? "border-accent bg-accent/5" : "border-border hover:border-border"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{trigger}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Step 3: Select Actions</CardTitle>
            <CardDescription>What should happen when the trigger is activated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Actions */}
            {workflow.actions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Selected Actions:</p>
                <div className="space-y-2">
                  {workflow.actions.map((action) => (
                    <div
                      key={action}
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20"
                    >
                      <span className="text-sm text-foreground">{action}</span>
                      <button
                        onClick={() => handleRemoveAction(action)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Actions */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Available Actions:</p>
              <div className="grid grid-cols-2 gap-3">
                {availableActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleAddAction(action)}
                    disabled={workflow.actions.includes(action)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      workflow.actions.includes(action)
                        ? "border-accent bg-accent/5 text-accent cursor-not-allowed"
                        : "border-border hover:border-accent text-foreground hover:bg-accent/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {action}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary & Save */}
        {workflow.name && workflow.trigger && workflow.actions.length > 0 && (
          <Card className="border-border/50 border-2 border-green-500/30 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Workflow is ready to create</p>
                  <p className="text-foreground font-medium mt-1">{workflow.name}</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Create Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  )
}
