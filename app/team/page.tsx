"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Send, Phone, Mail, Users, TrendingUp, MessageCircle, Loader2, Filter } from "lucide-react"
import SidebarLayout from "@/components/sidebar-layout"
import { getTeamMembers, getTasks, getAllUsers, getAllDepartments } from "@/lib/supabase/queries"

interface TeamMember {
  id: string
  name: string
  role: string
  status: "online" | "offline" | "busy"
  avatar: string
  tasks: number
  productivity: number
  email: string
  phone?: string
  department?: string
  position?: string
}

interface Message {
  id: string
  author: string
  content: string
  timestamp: string
  reactions: { emoji: string; count: number }[]
}

export default function TeamPage() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [allTasks, setAllTasks] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDepartment, setFilterDepartment] = useState<string>('own')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      author: "System",
      content: "Welcome to team collaboration! Select a team member to start chatting.",
      timestamp: "Just now",
      reactions: [],
    },
  ])
  const [messageInput, setMessageInput] = useState("")

  useEffect(() => {
    const loadTeamData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Load departments for filtering
        const depts = await getAllDepartments()
        setDepartments(depts || [])

        // Get team members based on user role
        let members: any[] = []
        if (['admin', 'executive', 'ceo'].includes(user.role || '')) {
          // Admins/Executives/CEO see all users
          const allUsers = await getAllUsers()
          members = (allUsers || []).filter(u => u.id !== user.id)
        } else if (user.role === 'department_head' || user.role === 'manager') {
          // Managers/Department Heads see their team
          members = await getTeamMembers(user.id)
        } else {
          // Employees see their department members
          const allUsers = await getAllUsers()
          members = (allUsers || []).filter(u => 
            u.department === user.department && 
            u.is_active && 
            u.id !== user.id
          )
        }

        // Get all tasks for productivity calculation
        const tasks = await getTasks()
        setAllTasks(tasks || [])

        // Transform members to TeamMember format with real data
        const transformedMembers: TeamMember[] = members.map(member => {
          const memberTasks = (tasks || []).filter(t => t.assignee_id === member.id)
          const completedTasks = memberTasks.filter(t => t.status === 'completed').length
          const totalTasks = memberTasks.length || 1
          const productivity = Math.round((completedTasks / totalTasks) * 100)

          // Get initials for avatar
          const nameParts = member.name.split(' ')
          const initials = nameParts.length > 1 
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
            : member.name.substring(0, 2).toUpperCase()

          // Mock status (in real app, this would come from presence/status system)
          const statuses: ("online" | "offline" | "busy")[] = ["online", "offline", "busy"]
          const status = statuses[Math.floor(Math.random() * statuses.length)]

          return {
            id: member.id,
            name: member.name,
            role: member.position || member.role || 'Employee',
            status,
            avatar: initials,
            tasks: memberTasks.length,
            productivity,
            email: member.email,
            phone: member.phone || undefined,
            department: member.department,
            position: member.position
          }
        })

        // Apply department filter
        let filtered = transformedMembers
        if (user && !['admin', 'executive', 'ceo'].includes(user.role || '')) {
          if (filterDepartment === 'own') {
            filtered = transformedMembers.filter(m => m.department === user.department)
          } else if (filterDepartment !== 'all') {
            filtered = transformedMembers.filter(m => m.department === filterDepartment)
          }
        }

        setTeamMembers(filtered)
      } catch (error) {
        console.error('Error loading team data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTeamData()
  }, [user?.id, user?.role, user?.department, filterDepartment])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-gray-400"
      case "busy":
        return "bg-orange-500"
      default:
        return "bg-gray-400"
    }
  }

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessages([
        ...messages,
        {
          id: String(messages.length + 1),
          author: "You",
          content: messageInput,
          timestamp: "just now",
          reactions: [],
        },
      ])
      setMessageInput("")
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Team Collaboration</h1>
            <p className="text-muted-foreground mt-1">
              Manage your team and communicate in real-time
              {user && !['admin', 'executive', 'ceo'].includes(user.role || '') && 
                ` • ${teamMembers.length} member${teamMembers.length !== 1 ? 's' : ''} from ${filterDepartment === 'own' ? 'your department' : filterDepartment === 'all' ? 'all departments' : filterDepartment}`
              }
            </p>
          </div>
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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Invite Member
          </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Team Members */}
          <div className="col-span-1">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">
                  Team Members ({teamMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No team members found</p>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedMember?.id === member.id
                        ? "bg-accent/10 border-2 border-accent"
                        : "border border-border/50 hover:bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                          {member.avatar}
                        </div>
                        <div
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${getStatusColor(member.status)}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                          {member.department && (
                            <p className="text-xs text-muted-foreground/70 truncate">{member.department}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat & Member Details */}
          <div className="col-span-2 space-y-6">
            {selectedMember ? (
              <>
                {/* Member Details */}
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                            {selectedMember.avatar}
                          </div>
                          <div
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${getStatusColor(selectedMember.status)}`}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{selectedMember.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
                          {selectedMember.department && (
                            <p className="text-xs text-muted-foreground/70">{selectedMember.department}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {selectedMember.email && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 bg-transparent"
                            onClick={() => window.location.href = `mailto:${selectedMember.email}`}
                          >
                          <Mail className="h-4 w-4" />
                        </Button>
                        )}
                        {selectedMember.phone && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 bg-transparent"
                            onClick={() => window.location.href = `tel:${selectedMember.phone}`}
                          >
                          <Phone className="h-4 w-4" />
                        </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Tasks</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{selectedMember.tasks}</p>
                        </div>
                        <Users className="h-6 w-6 text-accent" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50 bg-card/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Productivity</p>
                          <p className="text-2xl font-bold text-foreground mt-1">{selectedMember.productivity}%</p>
                        </div>
                        <TrendingUp className="h-6 w-6 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Chat */}
                <Card className="border-border/50 flex flex-col h-96">
                  <CardHeader>
                    <CardTitle className="text-lg">Chat</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <p className="text-xs font-semibold text-foreground">
                          {msg.author} <span className="text-muted-foreground font-normal">{msg.timestamp}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{msg.content}</p>
                        {msg.reactions.length > 0 && (
                          <div className="flex gap-2">
                            {msg.reactions.map((r, idx) => (
                              <span key={idx} className="text-xs bg-muted p-1 rounded">
                                {r.emoji} {r.count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                  <div className="border-t border-border p-4 flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={handleSendMessage} className="gap-2">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="border-border/50 h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-foreground font-medium">Select a team member to start chatting</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
