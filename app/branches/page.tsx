"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { MapPin, Users, TrendingUp, Plus, Search, Filter, MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { getBranches, getBranchStats } from "@/lib/supabase/queries"
import { getUserById } from "@/lib/supabase/queries"

export const dynamic = 'force-dynamic'

interface BranchWithStats {
  id: string
  name: string
  country: string
  city: string
  manager_id: string | null
  status: string
  staff?: number
  tasks?: number
  performance?: number
  revenue?: string
  manager_name?: string | undefined
}

export default function Branches() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [branches, setBranches] = useState<BranchWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBranches = async () => {
      setLoading(true)
      const branchesData = await getBranches()
      
      // Load stats and manager names for each branch
      const branchesWithStats = await Promise.all(
        branchesData.map(async (branch) => {
          const stats = await getBranchStats(branch.name)
          let managerName: string | undefined = undefined
          if (branch.manager_id) {
            const manager = await getUserById(branch.manager_id)
            managerName = manager?.name || undefined
          }
          return {
            ...branch,
            ...stats,
            manager_name: managerName,
          }
        })
      )
      
      setBranches(branchesWithStats)
      setLoading(false)
    }

    loadBranches()
  }, [])

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || branch.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <LayoutWithSidebar>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Global Branches</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage operations across {branches.length} locations</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Branch
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by branch name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading branches...</p>
              </div>
            ) : (
              <>
                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                          {branches.reduce((sum, b) => sum + (b.staff || 0), 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                          {branches.length > 0 
                            ? Math.round(branches.reduce((sum, b) => sum + (b.performance || 0), 0) / branches.length)
                            : 0}%
                        </p>
                      </div>
                      <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/30 text-green-600">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                          {branches.reduce((sum, b) => sum + (b.tasks || 0), 0)}
                        </p>
                      </div>
                      <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Branches List */}
                <div className="space-y-4">
                  {filteredBranches.length === 0 ? (
                    <Card className="p-6 text-center">
                      <p className="text-muted-foreground">No branches found</p>
                    </Card>
                  ) : (
                    filteredBranches.map((branch) => (
                <Card key={branch.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{branch.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{branch.city}</p>
                        {branch.manager_name && (
                          <p className="text-xs text-muted-foreground mt-0.5">Manager: {branch.manager_name}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-5 mb-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Staff</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{branch.staff || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Active Tasks</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{branch.tasks || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Performance</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{branch.performance || 0}%</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Country</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{branch.country}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Status</p>
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-950/30 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                        <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                        {branch.status === 'active' ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>

                  {/* Performance Bar */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground">Performance Score</p>
                      <p className="text-sm font-semibold text-foreground">{branch.performance || 0}%</p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${branch.performance || 0}%` }}
                      />
                    </div>
                  </div>
                </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
