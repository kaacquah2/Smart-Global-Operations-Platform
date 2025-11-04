"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import SidebarLayout from "@/components/sidebar-layout"

interface CalendarEvent {
  id: string
  date: number
  month: number
  year: number
  title: string
  assignee: string
  priority: "Critical" | "High" | "Medium" | "Low"
  time: string
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 1))

  const events: CalendarEvent[] = [
    {
      id: "1",
      date: 3,
      month: 2,
      year: 2025,
      title: "Security audit report",
      assignee: "David Brown",
      priority: "Critical",
      time: "9:00 AM",
    },
    {
      id: "2",
      date: 5,
      month: 2,
      year: 2025,
      title: "Monthly dashboard update",
      assignee: "Alice Johnson",
      priority: "Medium",
      time: "2:00 PM",
    },
    {
      id: "3",
      date: 9,
      month: 2,
      year: 2025,
      title: "Performance analysis due",
      assignee: "David Brown",
      priority: "Critical",
      time: "5:00 PM",
    },
    {
      id: "4",
      date: 10,
      month: 2,
      year: 2025,
      title: "Client presentation",
      assignee: "Carol Williams",
      priority: "High",
      time: "10:00 AM",
    },
    {
      id: "5",
      date: 12,
      month: 2,
      year: 2025,
      title: "Team sync meeting",
      assignee: "Alice Johnson",
      priority: "Medium",
      time: "3:30 PM",
    },
    {
      id: "6",
      date: 15,
      month: 2,
      year: 2025,
      title: "Database optimization",
      assignee: "Bob Smith",
      priority: "High",
      time: "11:00 AM",
    },
    {
      id: "7",
      date: 18,
      month: 2,
      year: 2025,
      title: "Branch expansion proposal",
      assignee: "Bob Smith",
      priority: "High",
      time: "1:00 PM",
    },
    {
      id: "8",
      date: 20,
      month: 2,
      year: 2025,
      title: "Q1 review meeting",
      assignee: "Alice Johnson",
      priority: "High",
      time: "4:00 PM",
    },
  ]

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const getEventsForDay = (day: number) => {
    return events.filter(
      (e) => e.date === day && e.month === currentDate.getMonth() && e.year === currentDate.getFullYear(),
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-destructive/10 text-destructive"
      case "High":
        return "bg-orange-500/10 text-orange-600"
      case "Medium":
        return "bg-blue-500/10 text-blue-600"
      case "Low":
        return "bg-green-500/10 text-green-600"
      default:
        return ""
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Task Calendar</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Visualize your tasks and deadlines</p>
          </div>
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="border-border/50">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4 gap-4">
                <CardTitle className="text-lg md:text-xl">{monthName}</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={previousMonth} className="flex-1 sm:flex-none">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextMonth} className="flex-1 sm:flex-none">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 overflow-x-auto">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 min-w-[350px]">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-xs font-semibold text-muted-foreground text-center py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 md:gap-2 min-w-[350px]">
                    {emptyDays.map((i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {days.map((day) => {
                      const dayEvents = getEventsForDay(day)
                      return (
                        <div
                          key={day}
                          className="aspect-square p-2 rounded-lg border border-border/50 hover:bg-accent/5 transition-colors cursor-pointer relative"
                        >
                          <div className="text-xs font-semibold text-foreground mb-1">{day}</div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs p-0.5 rounded truncate ${getPriorityColor(event.priority)}`}
                                title={event.title}
                              >
                                {event.title.substring(0, 12)}...
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div>
            <Card className="border-border/50 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {events
                  .filter((e) => e.month === currentDate.getMonth() && e.year === currentDate.getFullYear())
                  .sort((a, b) => a.date - b.date)
                  .slice(0, 8)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-border/50 hover:bg-card transition-colors cursor-pointer space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Mar {event.date}</p>
                          <p className="text-sm font-medium text-foreground line-clamp-2">{event.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{event.time}</span>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
