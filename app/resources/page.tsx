"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Users, TrendingUp, AlertCircle, CheckCircle2, Zap } from "lucide-react"
import SidebarLayout from "@/components/sidebar-layout"

interface ResourceData {
  name: string
  allocation: number
  utilization: number
  capacity: number
}

interface TeamWorkload {
  member: string
  tasks: number
  hours: number
  efficiency: number
  status: "optimal" | "overloaded" | "underutilized"
}

export default function ResourcesPage() {
  const resourceData: ResourceData[] = [
    { name: "Alice Johnson", allocation: 45, utilization: 42, capacity: 100 },
    { name: "Bob Smith", allocation: 75, utilization: 70, capacity: 100 },
    { name: "Carol Williams", allocation: 55, utilization: 52, capacity: 100 },
    { name: "David Brown", allocation: 80, utilization: 78, capacity: 100 },
  ]

  const teamWorkload: TeamWorkload[] = [
    { member: "Alice Johnson", tasks: 8, hours: 32, efficiency: 94, status: "optimal" },
    { member: "Bob Smith", tasks: 12, hours: 48, efficiency: 87, status: "overloaded" },
    { member: "Carol Williams", tasks: 6, hours: 24, efficiency: 91, status: "optimal" },
    { member: "David Brown", tasks: 5, hours: 18, efficiency: 85, status: "underutilized" },
  ]

  const utilizationTrend = [
    { week: "Week 1", utilization: 65, target: 75 },
    { week: "Week 2", utilization: 72, target: 75 },
    { week: "Week 3", utilization: 78, target: 75 },
    { week: "Week 4", utilization: 82, target: 75 },
    { week: "Week 5", utilization: 80, target: 75 },
  ]

  const workloadDistribution = [
    { member: "Alice", current: 45, optimal: 50 },
    { member: "Bob", current: 75, optimal: 50 },
    { member: "Carol", current: 55, optimal: 50 },
    { member: "David", current: 35, optimal: 50 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "bg-green-500/10 text-green-600"
      case "overloaded":
        return "bg-destructive/10 text-destructive"
      case "underutilized":
        return "bg-blue-500/10 text-blue-600"
      default:
        return ""
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "optimal":
        return <CheckCircle2 className="h-4 w-4" />
      case "overloaded":
        return <AlertCircle className="h-4 w-4" />
      case "underutilized":
        return <TrendingUp className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Resource Allocation</h1>
            <p className="text-muted-foreground mt-1">Optimize your team's workload and capacity</p>
          </div>
          <Button className="gap-2">
            <Zap className="h-4 w-4" />
            Optimize Resources
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Utilization</p>
                  <p className="text-2xl font-bold text-foreground mt-1">78%</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Optimal Load</p>
                  <p className="text-2xl font-bold text-foreground mt-1">2</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overloaded</p>
                  <p className="text-2xl font-bold text-foreground mt-1">1</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Capacity</p>
                  <p className="text-2xl font-bold text-foreground mt-1">22%</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Utilization Trend */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Utilization Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={utilizationTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                    formatter={(value) => `${value}%`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="utilization"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-accent)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="var(--color-muted-foreground)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Workload Distribution */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Workload vs Optimal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workloadDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="member" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                    formatter={(value) => `${value}%`}
                  />
                  <Legend />
                  <Bar dataKey="current" fill="var(--color-accent)" />
                  <Bar dataKey="optimal" fill="var(--color-muted)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Team Workload Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Team Workload Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamWorkload.map((member, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-card/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-foreground">{member.member}</h3>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(member.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(member.status)}
                          {member.status.replace("_", " ")}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex gap-6 text-xs text-muted-foreground">
                      <span>Tasks: {member.tasks}</span>
                      <span>Hours: {member.hours}</span>
                      <span>Efficiency: {member.efficiency}%</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent transition-all" style={{ width: `${member.efficiency}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="border-border/50 border-2 border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle>Resource Optimization Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Bob Smith is overloaded</p>
                <p className="text-sm text-muted-foreground">
                  Consider reassigning 3-4 tasks to David Brown who has available capacity
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">David Brown is underutilized</p>
                <p className="text-sm text-muted-foreground">
                  Capacity utilization at 35%. Ready to take on additional projects
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Overall team efficiency improved</p>
                <p className="text-sm text-muted-foreground">
                  Weekly utilization increased from 65% to 80%. Maintain current pace
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}
