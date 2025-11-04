"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, Filter } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getEvents, getAllDepartments } from "@/lib/supabase/queries"
import { EmptyState } from "@/components/empty-state"
import { ListSkeleton } from "@/components/loading-skeleton"
import { Breadcrumbs } from "@/components/breadcrumbs"
import Link from "next/link"
import { Calendar } from "@/components/ui/calendar"

export const dynamic = 'force-dynamic'

const eventTypeColors: Record<string, string> = {
  meeting: 'bg-blue-100 text-blue-800',
  training: 'bg-green-100 text-green-800',
  workshop: 'bg-purple-100 text-purple-800',
  social: 'bg-pink-100 text-pink-800',
  holiday: 'bg-yellow-100 text-yellow-800',
  deadline: 'bg-red-100 text-red-800',
}

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('own')
  const [departments, setDepartments] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    const loadEvents = async () => {
      try {
        setLoading(true)
        
        // Load departments
        const depts = await getAllDepartments()
        setDepartments(depts || [])
        
        const today = new Date()
        const nextMonth = new Date(today)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        
        // getEvents already filters by department via target_audience and target_department
        const data = await getEvents(
          user.id,
          today.toISOString(),
          nextMonth.toISOString()
        )
        
        // Additional client-side filtering if needed
        let filteredData = data
        if (user && !['admin', 'executive', 'ceo'].includes(user.role || '')) {
          if (filterDepartment === 'own' && user.department) {
            // Already filtered by getEvents, but ensure we only show relevant events
            filteredData = data.filter(e => 
              e.target_audience === 'all' || 
              (e.target_audience === 'department' && e.target_department === user.department) ||
              (e.target_audience === 'branch' && e.target_branch === user.branch) ||
              e.organizer_id === user.id
            )
          } else if (filterDepartment !== 'all') {
            filteredData = data.filter(e => 
              e.target_audience === 'all' || 
              (e.target_audience === 'department' && e.target_department === filterDepartment) ||
              e.organizer_id === user.id
            )
          }
        }
        
        setEvents(filteredData)
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user, filterDepartment])

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.event_type === filterType
    return matchesType
  })

  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.start_time)
    return eventDate >= new Date()
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  const pastEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.start_time)
    return eventDate < new Date()
  }).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

  const canCreate = user && ['admin', 'manager', 'executive', 'ceo', 'department_head'].includes(user.role || '')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Events' }]} />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-8 w-8" />
              Events & Calendar
            </h1>
            <p className="text-muted-foreground">View and manage company events</p>
          </div>
          {canCreate && (
            <Link href="/events/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </Link>
          )}
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              {user && !['admin', 'executive', 'ceo'].includes(user.role || '') && (
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own">My Department</SelectItem>
                    {(user.role === 'department_head' || user.role === 'manager') && (
                      <SelectItem value="all">All Departments</SelectItem>
                    )}
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="list" className="space-y-6">
            {loading ? (
              <ListSkeleton items={5} />
            ) : (
              <>
                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <Card key={event.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                  {event.title}
                                  <Badge className={eventTypeColors[event.event_type] || 'bg-gray-100'}>
                                    {event.event_type}
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="mt-2 flex flex-wrap items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4" />
                                    {formatDate(event.start_time)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                                  </span>
                                  {event.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {event.location}
                                    </span>
                                  )}
                                  {event.organizer && (
                                    <span className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      {event.organizer.name}
                                    </span>
                                  )}
                                </CardDescription>
                              </div>
                              {event.requires_rsvp && (
                                <Badge variant="outline">RSVP Required</Badge>
                              )}
                            </div>
                          </CardHeader>
                          {event.description && (
                            <CardContent>
                              <p className="text-sm">{event.description}</p>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Events */}
                {pastEvents.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Past Events</h2>
                    <div className="space-y-4">
                      {pastEvents.map((event) => (
                        <Card key={event.id} className="opacity-60">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="flex items-center gap-2">
                                  {event.title}
                                  <Badge className={eventTypeColors[event.event_type] || 'bg-gray-100'}>
                                    {event.event_type}
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="mt-2">
                                  {formatDate(event.start_time)} • {event.location}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {upcomingEvents.length === 0 && pastEvents.length === 0 && (
                  <EmptyState
                    icon={CalendarIcon}
                    title="No events found"
                    description={filterType !== 'all' 
                      ? "Try adjusting your filters"
                      : "There are no events scheduled at this time"}
                  />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Events on Selected Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedDate ? (
                      <div className="space-y-2">
                        {filteredEvents
                          .filter(event => {
                            const eventDate = new Date(event.start_time)
                            return eventDate.toDateString() === selectedDate.toDateString()
                          })
                          .map(event => (
                            <div key={event.id} className="p-3 border rounded-lg">
                              <p className="font-semibold text-sm">{event.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTime(event.start_time)} - {formatTime(event.end_time)}
                              </p>
                            </div>
                          ))}
                        {filteredEvents.filter(event => {
                          const eventDate = new Date(event.start_time)
                          return eventDate.toDateString() === selectedDate.toDateString()
                        }).length === 0 && (
                          <p className="text-sm text-muted-foreground">No events on this date</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Select a date to view events</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutWithSidebar>
  )
}

