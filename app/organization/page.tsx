"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
  Package,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Eye
} from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAllUsers, getAllDepartments, getBranches } from "@/lib/supabase/queries"
import { RefreshCw } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { EmptyState } from "@/components/empty-state"
import { ListSkeleton } from "@/components/loading-skeleton"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set())
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set())
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false)
  const [branchFilter, setBranchFilter] = useState<string>('all')

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

  // Get employees for a department
  const getDepartmentEmployees = (deptName: string) => {
    return users.filter(u => u.department === deptName && u.is_active)
  }

  // Get departments for a branch
  const getBranchDepartments = (branchName: string) => {
    return departments.filter(d => d.branch?.name === branchName)
  }

  // Get employees for a branch
  const getBranchEmployees = (branchName: string) => {
    return users.filter(u => u.branch === branchName && u.is_active)
  }

  const toggleDepartment = (deptId: string) => {
    setExpandedDepartments(prev => {
      const next = new Set(prev)
      if (next.has(deptId)) {
        next.delete(deptId)
      } else {
        next.add(deptId)
      }
      return next
    })
  }

  const toggleBranch = (branchId: string) => {
    setExpandedBranches(prev => {
      const next = new Set(prev)
      if (next.has(branchId)) {
        next.delete(branchId)
      } else {
        next.add(branchId)
      }
      return next
    })
  }

  const handleEmployeeClick = (employee: any) => {
    setSelectedEmployee(employee)
    setEmployeeDialogOpen(true)
  }

  // Filter departments and branches
  const filteredDepartments = useMemo(() => {
    if (branchFilter === 'all') return departments
    return departments.filter(d => d.branch?.name === branchFilter)
  }, [departments, branchFilter])

  const filteredBranches = useMemo(() => {
    return branches
  }, [branches])

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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Departments
                  </CardTitle>
                  <CardDescription>{departments.length} departments across all branches</CardDescription>
                </div>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ListSkeleton items={5} />
              ) : filteredDepartments.length === 0 ? (
                <EmptyState
                  icon={Network}
                  title="No departments"
                  description="Departments will appear here once created"
                />
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredDepartments.map((dept) => {
                    const isExpanded = expandedDepartments.has(dept.id)
                    const deptEmployees = getDepartmentEmployees(dept.name)
                    return (
                      <div key={dept.id} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleDepartment(dept.id)}
                          className="w-full p-3 text-left hover:bg-accent/50 transition-colors flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{dept.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {dept.branch?.name || 'Unknown Branch'} • {deptEmployees.length} employees
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        {isExpanded && deptEmployees.length > 0 && (
                          <div className="border-t bg-card/50 p-3 space-y-2 max-h-60 overflow-y-auto">
                            {deptEmployees.slice(0, 10).map((emp) => (
                              <button
                                key={emp.id}
                                onClick={() => handleEmployeeClick(emp)}
                                className="w-full p-2 rounded hover:bg-accent/50 transition-colors text-left"
                              >
                                <div className="flex items-center gap-2">
                                  {emp.avatar ? (
                                    <img
                                      src={emp.avatar}
                                      alt={emp.name}
                                      className="h-8 w-8 rounded-full"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Users className="h-4 w-4 text-primary" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{emp.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{emp.position}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                            {deptEmployees.length > 10 && (
                              <p className="text-xs text-muted-foreground text-center pt-2">
                                +{deptEmployees.length - 10} more employees
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
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
              ) : filteredBranches.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No branches"
                  description="Branch locations will appear here"
                />
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredBranches.map((branch) => {
                    const isExpanded = expandedBranches.has(branch.id)
                    const branchDepts = getBranchDepartments(branch.name)
                    const branchEmployees = getBranchEmployees(branch.name)
                    return (
                      <div key={branch.id} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleBranch(branch.id)}
                          className="w-full p-3 text-left hover:bg-accent/50 transition-colors flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{branch.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {branch.city}, {branch.country}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {branchDepts.length} departments • {branchEmployees.length} employees
                            </p>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="border-t bg-card/50 p-3 space-y-3">
                            {branchDepts.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-2">Departments:</p>
                                <div className="flex flex-wrap gap-2">
                                  {branchDepts.map(dept => (
                                    <Badge key={dept.id} variant="outline" className="text-xs">
                                      {dept.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {branchEmployees.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-2">Employees ({branchEmployees.length}):</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {branchEmployees.slice(0, 5).map(emp => (
                                    <button
                                      key={emp.id}
                                      onClick={() => handleEmployeeClick(emp)}
                                      className="w-full text-left p-2 rounded hover:bg-accent/50 transition-colors text-xs"
                                    >
                                      <p className="font-medium">{emp.name}</p>
                                      <p className="text-muted-foreground">{emp.position} • {emp.department}</p>
                                    </button>
                                  ))}
                                  {branchEmployees.length > 5 && (
                                    <p className="text-xs text-muted-foreground text-center pt-1">
                                      +{branchEmployees.length - 5} more employees
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
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
                  <button
                    key={employee.id}
                    onClick={() => handleEmployeeClick(employee)}
                    className="p-4 border rounded-lg hover:shadow-md transition-all text-left hover:border-accent"
                  >
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
                        <Badge variant="outline" className="text-xs mt-1">
                          {employee.branch}
                        </Badge>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Detail Dialog */}
        <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
              <DialogDescription>
                View employee information and contact details
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {selectedEmployee.avatar ? (
                    <img
                      src={selectedEmployee.avatar}
                      alt={selectedEmployee.name}
                      className="h-16 w-16 rounded-full"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{selectedEmployee.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedEmployee.position}</p>
                  </div>
                </div>
                <div className="grid gap-3 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedEmployee.email}</span>
                  </div>
                  {selectedEmployee.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedEmployee.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedEmployee.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedEmployee.branch}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedEmployee.role}</Badge>
                    <Badge variant={selectedEmployee.is_active ? 'default' : 'secondary'}>
                      {selectedEmployee.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/messages`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Message
                    </Link>
                  </Button>
                  {user && ['admin', 'executive', 'ceo'].includes(user.role || '') && (
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/admin/employees/${selectedEmployee.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LayoutWithSidebar>
  )
}

