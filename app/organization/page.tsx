"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Building2, 
  Users, 
  Network, 
  Search,
  BookOpen,
  FileText,
  Calendar,
  Megaphone,
  DollarSign,
  Scale,
  Shield,
  Package
} from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAllUsers, getAllDepartments, getBranches } from "@/lib/supabase/queries"
import { RefreshCw } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { EmptyState } from "@/components/empty-state"
import { ListSkeleton } from "@/components/loading-skeleton"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function OrganizationPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)

  // Memoize the load function
  const loadData = useCallback(async (forceRefresh = false) => {
    // Cache check - skip if fetched within 30 seconds
    const now = Date.now()
    if (!forceRefresh && now - lastFetchTime < 30000 && users.length > 0) {
      setLoading(false)
      return
    }

    try {
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const [usersData, deptsData, branchesData] = await Promise.all([
        getAllUsers(),
        getAllDepartments(),
        getBranches()
      ])
      setUsers(usersData || [])
      setDepartments(deptsData || [])
      setBranches(branchesData || [])
      setLastFetchTime(Date.now())
    } catch (error) {
      console.error('Error loading organization data:', error)
      setUsers([])
      setDepartments([])
      setBranches([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [lastFetchTime, users.length])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  const [filterDepartment, setFilterDepartment] = useState<string>('own')

  // Memoize filtered users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.position?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    // Filter by department if not admin/executive/ceo
    if (user && !['admin', 'executive', 'ceo'].includes(user.role || '')) {
      if (filterDepartment === 'own') {
        // Show only same department users
        filtered = filtered.filter(u => u.department === user.department)
      } else if (filterDepartment !== 'all') {
        // Filter by selected department
        filtered = filtered.filter(u => u.department === filterDepartment)
      }
      // filterDepartment === 'all' shows all users (for managers/dept heads)
    }
    
    return filtered
  }, [users, searchQuery, filterDepartment, user])

  const quickLinks = [
    { icon: BookOpen, label: 'Policies', href: '/policies', description: 'Company policies' },
    { icon: Megaphone, label: 'Announcements', href: '/announcements', description: 'Company announcements' },
    { icon: Calendar, label: 'Events', href: '/events', description: 'Company events' },
    { icon: FileText, label: 'Leave Management', href: '/leave', description: 'Leave requests' },
    { icon: DollarSign, label: 'Finance', href: '/finance/dashboard', description: 'Finance dashboard' },
    { icon: Package, label: 'Procurement', href: '/procurement/dashboard', description: 'Procurement dashboard' },
    { icon: Scale, label: 'Legal', href: '/legal/dashboard', description: 'Legal dashboard' },
    { icon: Shield, label: 'Audit', href: '/audit/dashboard', description: 'Audit dashboard' },
  ]

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Organization' }]} />

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Organization Hub
            </h1>
            <p className="text-muted-foreground">Company structure, directory, and resources</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <Icon className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-1">{link.label}</h3>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Departments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Departments
              </CardTitle>
              <CardDescription>{departments.length} departments across all branches</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ListSkeleton items={5} />
              ) : departments.length === 0 ? (
                <EmptyState
                  icon={Network}
                  title="No departments"
                  description="Departments will appear here once created"
                />
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {departments.map((dept) => (
                    <div key={dept.id} className="p-3 border rounded-lg">
                      <p className="font-semibold">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dept.branch?.name || 'Unknown Branch'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Branches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Branches
              </CardTitle>
              <CardDescription>{branches.length} office locations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ListSkeleton items={3} />
              ) : branches.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No branches"
                  description="Branch locations will appear here"
                />
              ) : (
                <div className="space-y-2">
                  {branches.map((branch) => (
                    <div key={branch.id} className="p-3 border rounded-lg">
                      <p className="font-semibold">{branch.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {branch.city}, {branch.country}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Employee Directory */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Directory
                </CardTitle>
                <CardDescription className="mt-1">
                  {filteredUsers.length} employee{filteredUsers.length !== 1 ? 's' : ''}
                  {user && !['admin', 'executive', 'ceo'].includes(user.role || '') && 
                    ` from ${filterDepartment === 'own' ? 'your department' : filterDepartment === 'all' ? 'all departments' : filterDepartment}`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {user && !['admin', 'executive', 'ceo'].includes(user.role || '') && (
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own">My Department</SelectItem>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <ListSkeleton items={10} />
            ) : filteredUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No employees found"
                description={searchQuery ? "Try a different search term" : "No employees in directory"}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((employee) => (
                  <div key={employee.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      {employee.avatar ? (
                        <img
                          src={employee.avatar}
                          alt={employee.name}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{employee.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{employee.position}</p>
                        <p className="text-xs text-muted-foreground truncate">{employee.department}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutWithSidebar>
  )
}

