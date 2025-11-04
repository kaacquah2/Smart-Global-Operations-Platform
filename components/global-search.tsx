"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, FileText, DollarSign, Calendar, Users, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getTasks, getPurchaseRequests } from "@/lib/supabase/queries"
import { getLeaveRequests } from "@/lib/supabase/queries"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface SearchResult {
  id: string
  type: 'task' | 'purchase' | 'leave' | 'user'
  title: string
  description?: string
  status?: string
  href: string
}

export function GlobalSearch() {
  const { user } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const search = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        const [tasks, purchases, leaves] = await Promise.all([
          getTasks({ assignee_id: user.id }),
          getPurchaseRequests({ requestor_id: user.id }),
          getLeaveRequests(user.id)
        ])

        const searchResults: SearchResult[] = []

        // Search tasks
        tasks
          .filter(t => 
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.description?.toLowerCase().includes(query.toLowerCase())
          )
          .forEach(task => {
            searchResults.push({
              id: task.id,
              type: 'task',
              title: task.title,
              description: task.description,
              status: task.status,
              href: `/tasks/${task.id}`
            })
          })

        // Search purchase requests
        purchases
          .filter(p => 
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase())
          )
          .forEach(purchase => {
            searchResults.push({
              id: purchase.id,
              type: 'purchase',
              title: purchase.title,
              description: purchase.description,
              status: purchase.status,
              href: `/purchases/${purchase.id}`
            })
          })

        // Search leave requests
        leaves
          .filter(l => 
            l.leave_type?.name?.toLowerCase().includes(query.toLowerCase()) ||
            l.reason?.toLowerCase().includes(query.toLowerCase())
          )
          .forEach(leave => {
            searchResults.push({
              id: leave.id,
              type: 'leave',
              title: `${leave.leave_type?.name || 'Leave'} Request`,
              description: `${leave.total_days} days - ${leave.status}`,
              status: leave.status,
              href: `/leave`
            })
          })

        setResults(searchResults.slice(0, 10)) // Limit to 10 results
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(search, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [query, user])

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    setOpen(false)
    setQuery('')
    setResults([])
  }

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'task': return FileText
      case 'purchase': return DollarSign
      case 'leave': return Calendar
      case 'user': return Users
      default: return FileText
    }
  }

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800'
      case 'purchase': return 'bg-green-100 text-green-800'
      case 'leave': return 'bg-purple-100 text-purple-800'
      case 'user': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative w-full sm:w-64 justify-start text-muted-foreground"
      >
        <Search className="h-4 w-4 mr-2" />
        <span>Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Search across tasks, purchase requests, leave, and more
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Type to search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No results found
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {results.map((result) => {
                  const Icon = getTypeIcon(result.type)
                  return (
                    <Card
                      key={result.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSelect(result)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm truncate">{result.title}</p>
                              <Badge className={getTypeColor(result.type)} variant="outline">
                                {result.type}
                              </Badge>
                              {result.status && (
                                <Badge variant="outline" className="text-xs">
                                  {result.status}
                                </Badge>
                              )}
                            </div>
                            {result.description && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {result.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {!loading && !query && (
              <div className="text-center py-8 text-muted-foreground">
                Start typing to search...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

