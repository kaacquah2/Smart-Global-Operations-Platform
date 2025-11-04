"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Briefcase,
  Download,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
} from "lucide-react"
import type { User } from "@/lib/types"
import Link from "next/link"
import { SidebarLayout } from "@/components/sidebar-layout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminEmployeesPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const { getAllUsers, deleteUser } = useAuth()
  const [employees, setEmployees] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterDept, setFilterDept] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/auth/login")
      return
    }
    const loadEmployees = async () => {
      const users = await getAllUsers()
      setEmployees(users)
      setCurrentPage(1) // Reset to first page when data changes
    }
    loadEmployees()
  }, [user, isLoggedIn, router, getAllUsers])

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || emp.role === filterRole
    const matchesDept = filterDept === "all" || emp.department === filterDept

    return matchesSearch && matchesRole && matchesDept
  })

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex)
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const toggleRowExpand = (empId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(empId)) {
        next.delete(empId)
      } else {
        next.add(empId)
      }
      return next
    })
  }

  const handleEmployeeView = (emp: User) => {
    setSelectedEmployee(emp)
    setEmployeeDialogOpen(true)
  }

  const handleDeleteEmployee = (emp: User) => {
    setEmployeeToDelete(emp)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return
    
    setDeleting(true)
    try {
      await deleteUser(employeeToDelete.id)
      setEmployees(employees.filter((e) => e.id !== employeeToDelete.id))
      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
    } catch (error) {
      console.error('Failed to delete employee:', error)
      alert('Failed to delete employee. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      ceo: "bg-purple-100 text-purple-800",
      executive: "bg-blue-100 text-blue-800",
      manager: "bg-accent/20 text-accent",
      department_head: "bg-cyan-100 text-cyan-800",
      employee: "bg-green-100 text-green-800",
    }
    return colors[role] || "bg-gray-100 text-gray-800"
  }

  const departments = Array.from(new Set(employees.map((e) => e.department)))
  const roles = Array.from(new Set(employees.map((e) => e.role)))

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrator",
      ceo: "CEO",
      executive: "Executive",
      manager: "Manager",
      department_head: "Dept. Head",
      employee: "Employee",
    }
    return labels[role] || role
  }

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-8 w-8 text-accent" />
              Employee Management
            </h2>
            <Link href="/admin/employees/create">
              <Button className="gap-2 bg-accent hover:bg-accent/90">
                <Plus className="h-4 w-4" />
                Add New Employee
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground">Manage all employees, departments, and their roles</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-3xl font-bold text-foreground">{employees.length}</p>
                </div>
                <Users className="h-10 w-10 text-accent/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold text-green-600">{employees.filter((e) => e.is_active).length}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Departments</p>
                  <p className="text-3xl font-bold text-accent">{departments.length}</p>
                </div>
                <Briefcase className="h-10 w-10 text-accent/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Roles</p>
                  <p className="text-3xl font-bold text-blue-600">{roles.length}</p>
                </div>
                <Shield className="h-10 w-10 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Filter by Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                  >
                    <option value="all">All Roles</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {getRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Filter by Department</label>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Actions</label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 flex-1 bg-transparent"
                      onClick={() => {
                        // Export functionality
                        const csv = [
                          ['Name', 'Email', 'Position', 'Department', 'Role', 'Branch', 'Status'].join(','),
                          ...filteredEmployees.map(emp => 
                            [
                              emp.name,
                              emp.email,
                              emp.position || '',
                              emp.department,
                              emp.role,
                              emp.branch,
                              emp.is_active ? 'Active' : 'Inactive'
                            ].join(',')
                          )
                        ].join('\n')
                        
                        const blob = new Blob([csv], { type: 'text/csv' })
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `employees-export-${new Date().toISOString().split('T')[0]}.csv`
                        a.click()
                        window.URL.revokeObjectURL(url)
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardContent className="pt-6">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No employees found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Position</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Branch</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.map((emp) => {
                      const isExpanded = expandedRows.has(emp.id)
                      return (
                        <React.Fragment key={emp.id}>
                          <tr 
                            className="border-b border-border/50 hover:bg-accent/5 transition cursor-pointer"
                            onClick={() => toggleRowExpand(emp.id)}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                                  {emp.name.charAt(0)}
                                </div>
                                <span className="font-medium text-foreground">{emp.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-muted-foreground">{emp.email}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-foreground">{emp.position}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-foreground">{emp.department}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleColor(emp.role)}`}
                              >
                                {getRoleLabel(emp.role)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-muted-foreground">{emp.branch}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium ${emp.is_active ? "text-green-600" : "text-red-600"}`}
                              >
                                <span className={`w-2 h-2 rounded-full ${emp.is_active ? "bg-green-600" : "bg-red-600"}`} />
                                {emp.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-foreground"
                                  title="View details"
                                  onClick={() => handleEmployeeView(emp)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-accent"
                                  title="Edit employee"
                                  onClick={() => router.push(`/admin/employees/${emp.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteEmployee(emp)
                                  }}
                                  title="Delete employee"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="border-b border-border/50 bg-accent/5">
                              <td colSpan={8} className="py-4 px-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
                                    <p className="text-sm text-foreground flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {emp.email}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Position</p>
                                    <p className="text-sm text-foreground">{emp.position || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Department</p>
                                    <p className="text-sm text-foreground">{emp.department}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Branch</p>
                                    <p className="text-sm text-foreground">{emp.branch || 'N/A'}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t">
                                  <Button variant="outline" size="sm" onClick={(e) => {
                                    e.stopPropagation()
                                    handleEmployeeView(emp)
                                  }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Full Details
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/admin/employees/${emp.id}/edit`)
                                  }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Employee
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Detail Dialog */}
      <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEmployee?.name || 'Employee Details'}</DialogTitle>
            <DialogDescription>
              View detailed information about the employee
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.position || 'No position'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p className="text-sm text-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedEmployee.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Role</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleColor(selectedEmployee.role)}`}>
                    {getRoleLabel(selectedEmployee.role)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Department</p>
                  <p className="text-sm text-foreground">{selectedEmployee.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Branch</p>
                  <p className="text-sm text-foreground">{selectedEmployee.branch || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${selectedEmployee.is_active ? "text-green-600" : "text-red-600"}`}>
                    <span className={`w-2 h-2 rounded-full ${selectedEmployee.is_active ? "bg-green-600" : "bg-red-600"}`} />
                    {selectedEmployee.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Position</p>
                  <p className="text-sm text-foreground">{selectedEmployee.position || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => {
                  setEmployeeDialogOpen(false)
                  router.push(`/admin/employees/${selectedEmployee.id}`)
                }}>
                  View Full Profile
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => {
                  setEmployeeDialogOpen(false)
                  router.push(`/admin/employees/${selectedEmployee.id}/edit`)
                }}>
                  Edit Employee
                </Button>
                <Button variant="outline" onClick={() => setEmployeeDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The employee will be deactivated and unable to access the system.
            </DialogDescription>
          </DialogHeader>
          {employeeToDelete && (
            <div className="space-y-4 py-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-2">Employee to be deactivated:</p>
                <div className="space-y-1">
                  <p className="text-sm text-foreground"><strong>Name:</strong> {employeeToDelete.name}</p>
                  <p className="text-sm text-foreground"><strong>Email:</strong> {employeeToDelete.email}</p>
                  <p className="text-sm text-foreground"><strong>Position:</strong> {employeeToDelete.position || 'N/A'}</p>
                  <p className="text-sm text-foreground"><strong>Department:</strong> {employeeToDelete.department}</p>
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> The employee account will be deactivated (not permanently deleted). 
                  You can reactivate them later if needed.
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setEmployeeToDelete(null)
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteEmployee}
              disabled={deleting}
            >
              {deleting ? 'Deactivating...' : 'Deactivate Employee'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  )
}
