"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import {
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  Lightbulb,
  RefreshCw,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"

const predictedPerformance = [
  { week: "W1", predicted: 88, baseline: 85 },
  { week: "W2", predicted: 90, baseline: 85 },
  { week: "W3", predicted: 92, baseline: 85 },
  { week: "W4", predicted: 94, baseline: 85 },
]

const riskFactors = [
  {
    id: 1,
    title: "Tokyo Branch - Resource Shortage",
    risk: "high",
    probability: 78,
    impact: "Critical",
    recommendation: "Allocate 3 additional staff members to address workload imbalance",
    daysUntilIssue: 14,
  },
  {
    id: 2,
    title: "London Office - Budget Overrun",
    risk: "medium",
    probability: 62,
    impact: "High",
    recommendation: "Review cost allocation and optimize vendor contracts",
    daysUntilIssue: 21,
  },
  {
    id: 3,
    title: "Sydney - Task Completion Slowdown",
    risk: "medium",
    probability: 55,
    impact: "Medium",
    recommendation: "Implement automation for repetitive tasks and provide training",
    daysUntilIssue: 30,
  },
]

const opportunities = [
  {
    id: 1,
    title: "New York - High Performer Potential",
    type: "Growth",
    description: "Sarah Johnson shows 23% improvement trajectory. Consider for management role.",
    impact: "Potential $150K revenue increase",
    actions: 6,
  },
  {
    id: 2,
    title: "Process Optimization",
    type: "Efficiency",
    description: "Marketing team processes can be automated, saving 20 hours/week.",
    impact: "Save $2,400/month",
    actions: 3,
  },
  {
    id: 3,
    title: "Cross-branch Collaboration",
    type: "Strategy",
    description: "Tokyo and Singapore can collaborate on project to reduce costs by 15%.",
    impact: "Save $180K annually",
    actions: 4,
  },
]

export default function AIInsights() {
  const [selectedRisk, setSelectedRisk] = useState<number | null>(null)

  return (
    <LayoutWithSidebar>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Brain className="h-8 w-8 text-accent" />
                AI-Powered Insights
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Predictive analytics and intelligent recommendations</p>
            </div>
            <Button className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Regenerate Insights
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* AI Confidence Indicator */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Model Confidence</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">94.2%</p>
                  <p className="mt-1 text-sm text-muted-foreground">Based on 156,000 data points analyzed</p>
                </div>
                <div className="text-right">
                  <Zap className="h-12 w-12 text-accent inline-block" />
                </div>
              </div>
            </Card>

            {/* Performance Prediction */}
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Next Quarter Prediction
                </h3>
                <p className="text-sm text-muted-foreground">Based on current trajectory</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={predictedPerformance}>
                  <defs>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--color-accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--color-accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--color-muted-foreground))" />
                  <YAxis stroke="hsl(var(--color-muted-foreground))" domain={[80, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--color-card))",
                      border: "1px solid hsl(var(--color-border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="hsl(var(--color-accent))"
                    fillOpacity={1}
                    fill="url(#colorPred)"
                  />
                  <Line type="monotone" dataKey="baseline" stroke="hsl(var(--color-primary))" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                <span className="font-medium">Expected improvement of 6-8% in Q3 based on current initiatives.</span>
              </div>
            </Card>

            {/* Risk Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Risk Assessment
              </h3>
              <div className="space-y-4">
                {riskFactors.map((risk) => (
                  <Card
                    key={risk.id}
                    className="p-6 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setSelectedRisk(selectedRisk === risk.id ? null : risk.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-foreground">{risk.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Expected impact in {risk.daysUntilIssue} days
                        </p>
                      </div>
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium text-xs ${
                          risk.risk === "high"
                            ? "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"
                            : "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${risk.risk === "high" ? "bg-red-600" : "bg-yellow-600"}`}
                        />
                        {risk.risk === "high" ? "High Risk" : "Medium Risk"}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 mb-4 pb-4 border-b border-border">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Probability</p>
                        <p className="text-lg font-bold text-foreground">{risk.probability}%</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Impact</p>
                        <p className="text-lg font-bold text-foreground">{risk.impact}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Risk Score</p>
                        <p className="text-lg font-bold text-foreground">
                          {Math.round(risk.probability * (risk.impact === "Critical" ? 0.5 : 0.35))}
                        </p>
                      </div>
                    </div>

                    {selectedRisk === risk.id && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          AI Recommendation:
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-300 mt-2">{risk.recommendation}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Strategic Opportunities
              </h3>
              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <Card key={opp.id} className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-foreground">{opp.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{opp.description}</p>
                      </div>
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium text-xs ${
                          opp.type === "Growth"
                            ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                            : opp.type === "Efficiency"
                              ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                              : "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400"
                        }`}
                      >
                        {opp.type}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Potential Impact</p>
                        <p className="text-lg font-bold text-foreground mt-1">{opp.impact}</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Calendar className="h-4 w-4" />
                        Plan ({opp.actions} steps)
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Insights Summary */}
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <h3 className="text-lg font-semibold text-foreground mb-4">Executive Summary</h3>
              <div className="space-y-3 text-sm text-foreground">
                <p>• AI models predict a 6-8% performance improvement in Q3 if current initiatives continue</p>
                <p>• 3 high-priority risks identified requiring immediate attention within 14-30 days</p>
                <p>• 3 strategic opportunities identified with combined potential savings of $390K+ annually</p>
                <p>• Recommend focusing on Tokyo resource allocation as top priority to prevent 78% probability risk</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
