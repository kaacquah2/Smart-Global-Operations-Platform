"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Megaphone, Pin, Calendar, Filter, Search, ChevronDown, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAnnouncements } from "@/lib/supabase/queries"
import { EmptyState } from "@/components/empty-state"
import { ListSkeleton } from "@/components/loading-skeleton"
import { Breadcrumbs } from "@/components/breadcrumbs"
import Link from "next/link"

export const dynamic = 'force-dynamic'

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const typeColors: Record<string, string> = {
  general: 'bg-gray-100 text-gray-800',
  important: 'bg-blue-100 text-blue-800',
  urgent: 'bg-red-100 text-red-800',
  event: 'bg-green-100 text-green-800',
  policy_update: 'bg-purple-100 text-purple-800',
}

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return

    const loadAnnouncements = async () => {
      try {
        const data = await getAnnouncements(user.id)
        setAnnouncements(data)
      } catch (error) {
        console.error('Error loading announcements:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnnouncements()
  }, [user])

  const toggleAnnouncement = (announcementId: string) => {
    setExpandedAnnouncements(prev => {
      const next = new Set(prev)
      if (next.has(announcementId)) {
        next.delete(announcementId)
      } else {
        next.add(announcementId)
      }
      return next
    })
  }

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ann.content?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || ann.type === filterType
    const matchesPriority = filterPriority === 'all' || ann.priority === filterPriority
    return matchesSearch && matchesType && matchesPriority
  })

  const pinnedAnnouncements = filteredAnnouncements.filter(ann => ann.is_pinned)
  const regularAnnouncements = filteredAnnouncements.filter(ann => !ann.is_pinned)

  const canCreate = user && ['admin', 'manager', 'executive', 'ceo', 'department_head'].includes(user.role || '')

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Announcements' }]} />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Megaphone className="h-8 w-8" />
              Announcements
            </h1>
            <p className="text-muted-foreground">Stay updated with company announcements</p>
          </div>
          {canCreate && (
            <Link href="/announcements/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="policy_update">Policy Update</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        {loading ? (
          <ListSkeleton items={5} />
        ) : filteredAnnouncements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements found"
            description={searchQuery || filterType !== 'all' || filterPriority !== 'all' 
              ? "Try adjusting your filters"
              : "There are no announcements at this time"}
          />
        ) : (
          <div className="space-y-4">
            {/* Pinned Announcements */}
            {pinnedAnnouncements.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Pin className="h-5 w-5" />
                  Pinned
                </h2>
                {pinnedAnnouncements.map((announcement) => {
                  const isExpanded = expandedAnnouncements.has(announcement.id)
                  return (
                    <Card key={announcement.id} className="border-l-4 border-l-blue-500">
                      <button
                        onClick={() => toggleAnnouncement(announcement.id)}
                        className="w-full text-left"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {announcement.title}
                                <Pin className="h-4 w-4 text-blue-500" />
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                                )}
                              </CardTitle>
                              <CardDescription className="mt-1 flex items-center gap-4">
                                <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                                <Badge className={typeColors[announcement.type] || 'bg-gray-100'}>
                                  {announcement.type}
                                </Badge>
                                <Badge className={priorityColors[announcement.priority] || 'bg-gray-100'}>
                                  {announcement.priority}
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </button>
                      <CardContent>
                        {isExpanded ? (
                          <div className="pt-2">
                            <p className="whitespace-pre-wrap">{announcement.content}</p>
                            {announcement.created_by && (
                              <p className="text-xs text-muted-foreground mt-4">
                                Created by: {announcement.created_by}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap line-clamp-3">{announcement.content}</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Regular Announcements */}
            {regularAnnouncements.length > 0 && (
              <div className="space-y-4">
                {pinnedAnnouncements.length > 0 && (
                  <h2 className="text-lg font-semibold mt-6">All Announcements</h2>
                )}
                {regularAnnouncements.map((announcement) => {
                  const isExpanded = expandedAnnouncements.has(announcement.id)
                  return (
                    <Card key={announcement.id}>
                      <button
                        onClick={() => toggleAnnouncement(announcement.id)}
                        className="w-full text-left"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                {announcement.title}
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                                )}
                              </CardTitle>
                              <CardDescription className="mt-1 flex items-center gap-4">
                                <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                                <Badge className={typeColors[announcement.type] || 'bg-gray-100'}>
                                  {announcement.type}
                                </Badge>
                                <Badge className={priorityColors[announcement.priority] || 'bg-gray-100'}>
                                  {announcement.priority}
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                      </button>
                      <CardContent>
                        {isExpanded ? (
                          <div className="pt-2">
                            <p className="whitespace-pre-wrap">{announcement.content}</p>
                            {announcement.created_by && (
                              <p className="text-xs text-muted-foreground mt-4">
                                Created by: {announcement.created_by}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap line-clamp-3">{announcement.content}</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutWithSidebar>
  )
}

