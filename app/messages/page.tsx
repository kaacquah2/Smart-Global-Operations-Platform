"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Send, Search, Paperclip, Plus, ChevronLeft } from "lucide-react"

const conversations = [
  {
    id: "1",
    name: "Sarah Johnson",
    lastMessage: "Great work on the Q1 report!",
    timestamp: "2024-03-20 10:30",
    unread: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    messages: [
      { from: "Sarah Johnson", text: "Hey, got time to discuss the Q1 report?", time: "09:15" },
      { from: "You", text: "What would you like to know?", time: "09:20" },
      { from: "Sarah Johnson", text: "Great work on the Q1 report!", time: "10:30" },
    ],
  },
  {
    id: "2",
    name: "Mike Chen",
    lastMessage: "When can you review my submission?",
    timestamp: "2024-03-20 08:45",
    unread: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    messages: [{ from: "Mike Chen", text: "When can you review my submission?", time: "08:45" }],
  },
  {
    id: "3",
    name: "Patricia Williams",
    lastMessage: "See you at the team meeting tomorrow",
    timestamp: "2024-03-19 16:00",
    unread: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia",
    messages: [],
  },
  {
    id: "4",
    name: "Team Updates",
    lastMessage: "New project kickoff next Monday",
    timestamp: "2024-03-20 09:00",
    unread: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Team",
    isGroup: true,
    messages: [],
  },
]

export default function MessagesPage() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDepartment, setFilterDepartment] = useState<boolean>(true)

  const activeConversation = selectedConversation ? conversations.find((c) => c.id === selectedConversation) : null

  // Filter conversations: by default show department-related conversations for non-admin users
  let filteredConversations = conversations.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  
  // For non-admin users, prioritize department conversations
  // (In real implementation, conversations would have department metadata)
  if (user && !['admin', 'executive', 'ceo'].includes(user.role || '') && filterDepartment) {
    // Mock: Show "Team Updates" and prioritize department members
    // Real implementation would filter by department_id from database
    filteredConversations = filteredConversations.sort((a, b) => {
      const aIsDept = a.isGroup || a.name.includes('Team')
      const bIsDept = b.isGroup || b.name.includes('Team')
      if (aIsDept && !bIsDept) return -1
      if (!aIsDept && bIsDept) return 1
      return 0
    })
  }

  const handleSendMessage = () => {
    if (messageText.trim() && activeConversation) {
      console.log("[v0] Message sent to", activeConversation.name, ":", messageText)
      setMessageText("")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`w-full md:w-80 border-r border-border bg-card/50 flex flex-col transition-all ${selectedConversation ? "hidden md:flex" : "flex"}`}
      >
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Messages</h1>
            <Button size="sm" variant="outline" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-card ${
                selectedConversation === conversation.id ? "bg-card" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={conversation.avatar || "/placeholder.svg"}
                  alt={conversation.name}
                  className="h-10 w-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm font-medium truncate ${conversation.unread ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                    >
                      {conversation.name}
                    </p>
                    {conversation.unread && <div className="h-2 w-2 rounded-full bg-accent"></div>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                </div>
                <p className="text-xs text-muted-foreground flex-shrink-0">{conversation.timestamp.split(" ")[1]}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-border bg-card/50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedConversation(null)} className="md:hidden">
                <ChevronLeft className="h-6 w-6 text-muted-foreground" />
              </button>
              <img
                src={activeConversation.avatar || "/placeholder.svg"}
                alt={activeConversation.name}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <p className="font-semibold text-foreground">{activeConversation.name}</p>
                {!activeConversation.isGroup && <p className="text-xs text-green-500">Active now</p>}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeConversation.messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="mb-2 text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Start a conversation with {activeConversation.name}</p>
                </div>
              </div>
            ) : (
              activeConversation.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.from === "You" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 ${
                      msg.from === "You" ? "bg-accent text-accent-foreground" : "bg-card border border-border"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${msg.from === "You" ? "text-accent-foreground/70" : "text-muted-foreground"}`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-card/50 p-4">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button onClick={handleSendMessage} disabled={!messageText.trim()} className="gap-2">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mx-auto">
              <Send className="h-8 w-8 text-accent" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">Select a conversation</p>
            <p className="text-sm text-muted-foreground">Choose from your messages to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}
