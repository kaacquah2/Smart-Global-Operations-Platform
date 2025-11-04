"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
} from "lucide-react"
import type { User } from "@/lib/types"
import Link from "next/link"
import { SidebarLayout } from "@/components/sidebar-layout"

export default function AdminEmployeesPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const { getAllUsers, deleteUser } = useAuth()
  const [employees, setEmployees] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterDept, setFilterDept] = useState<string>("all")

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/auth/login")
      return
    }
    const loadEmployees = async () => {
      const users = await getAllUsers()
      setEmployees(users)
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

  const handleDeleteEmployee = (empId: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteUser(empId)
      setEmployees(employees.filter((e) => e.id !== empId))
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
                    <Button variant="outline" size="sm" className="gap-2 flex-1 bg-transparent">
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
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="border-b border-border/50 hover:bg-accent/5 transition">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
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
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-accent"
                              title="Edit employee"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteEmployee(emp.id)}
                              title="Delete employee"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
