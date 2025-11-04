"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, GripVertical, Clock } from "lucide-react"
import SidebarLayout from "@/components/sidebar-layout"

interface TaskCard {
  id: string
  title: string
  assignee: string
  priority: "Critical" | "High" | "Medium" | "Low"
  dueDate: string
  subtasks: number
  completedSubtasks: number
}

interface Column {
  id: string
  title: string
  color: string
  tasks: TaskCard[]
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "To Do",
      color: "bg-slate-500",
      tasks: [
        {
          id: "1",
          title: "Implement new reporting system",
          assignee: "Alice Johnson",
          priority: "High",
          dueDate: "Mar 15",
          subtasks: 4,
          completedSubtasks: 1,
        },
        {
          id: "2",
          title: "Database optimization",
          assignee: "Bob Smith",
          priority: "Medium",
          dueDate: "Mar 18",
          subtasks: 6,
          completedSubtasks: 2,
        },
        {
          id: "3",
          title: "API documentation update",
          assignee: "Carol Williams",
          priority: "Low",
          dueDate: "Mar 20",
          subtasks: 2,
          completedSubtasks: 0,
        },
      ],
    },
    {
      id: "inprogress",
      title: "In Progress",
      color: "bg-blue-500",
      tasks: [
        {
          id: "4",
          title: "Q1 performance analysis",
          assignee: "David Brown",
          priority: "Critical",
          dueDate: "Mar 10",
          subtasks: 8,
          completedSubtasks: 5,
        },
        {
          id: "5",
          title: "Team training materials",
          assignee: "Alice Johnson",
          priority: "High",
          dueDate: "Mar 12",
          subtasks: 3,
          completedSubtasks: 2,
        },
        {
          id: "6",
          title: "Client communication plan",
          assignee: "Carol Williams",
          priority: "High",
          dueDate: "Mar 13",
          subtasks: 5,
          completedSubtasks: 3,
        },
      ],
    },
    {
      id: "review",
      title: "Review",
      color: "bg-yellow-500",
      tasks: [
        {
          id: "7",
          title: "Branch expansion proposal",
          assignee: "Bob Smith",
          priority: "High",
          dueDate: "Mar 11",
          subtasks: 6,
          completedSubtasks: 6,
        },
        {
          id: "8",
          title: "Security audit report",
          assignee: "David Brown",
          priority: "Critical",
          dueDate: "Mar 9",
          subtasks: 4,
          completedSubtasks: 4,
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      color: "bg-green-500",
      tasks: [
        {
          id: "9",
          title: "Monthly dashboard update",
          assignee: "Alice Johnson",
          priority: "Medium",
          dueDate: "Mar 5",
          subtasks: 5,
          completedSubtasks: 5,
        },
        {
          id: "10",
          title: "Vendor evaluation completed",
          assignee: "Carol Williams",
          priority: "High",
          dueDate: "Mar 4",
          subtasks: 3,
          completedSubtasks: 3,
        },
        {
          id: "11",
          title: "Policy documentation",
          assignee: "Bob Smith",
          priority: "Medium",
          dueDate: "Mar 3",
          subtasks: 2,
          completedSubtasks: 2,
        },
      ],
    },
  ])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "High":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20"
      case "Medium":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "Low":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      default:
        return ""
    }
  }

  const TaskCardComponent = ({ task }: { task: TaskCard }) => (
    <Card className="cursor-grab active:cursor-grabbing border-border/50 hover:shadow-md transition-shadow group">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">{task.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{task.assignee}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {task.dueDate}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${(task.completedSubtasks / task.subtasks) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {task.completedSubtasks}/{task.subtasks}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <SidebarLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Task Board</h1>
            <p className="text-muted-foreground mt-1">Drag and drop to organize your work</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-6 pb-6">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-3 w-3 rounded-full ${column.color}`} />
                <h2 className="font-semibold text-foreground">{column.title}</h2>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {column.tasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {column.tasks.map((task) => (
                  <TaskCardComponent key={task.id} task={task} />
                ))}

                <button className="w-full p-3 rounded-lg border-2 border-dashed border-border hover:border-accent transition-colors text-muted-foreground hover:text-accent text-sm font-medium">
                  <Plus className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  )
}
