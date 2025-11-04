"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import type { UserRole, CreateEmployeePayload } from "@/lib/types"
import Link from "next/link"

const DEPARTMENTS = ["Sales", "Operations", "HR", "IT", "Finance", "Marketing", "Executive"]
const BRANCHES = ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "Headquarters"]
const ROLES: UserRole[] = ["employee", "department_head", "manager", "executive"]

export default function CreateEmployeePage() {
  const { user, isLoggedIn, createEmployee, getAllUsers } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<CreateEmployeePayload>({
    name: "",
    email: "",
    department: "Sales",
    branch: "Headquarters",
    position: "",
    role: "employee",
    hire_date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/auth/login")
    }
  }, [user, isLoggedIn, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!formData.name || !formData.email || !formData.position) {
        throw new Error("Please fill in all required fields")
      }

      await createEmployee(formData)
      setSuccess(true)

      // Reset form
      setTimeout(() => {
        router.push("/admin/employees")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Employee Created!</h2>
            <p className="text-muted-foreground mb-4">
              The employee profile has been created successfully. Login credentials have been sent to their email address.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              The employee will receive an email with their temporary password that they can change on first login.
            </p>
            <Button onClick={() => router.push("/admin/employees")}>Back to Employees</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link href="/admin/employees" className="flex items-center gap-2 text-accent hover:text-accent/80">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Employees</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Plus className="h-8 w-8 text-accent" />
            Create New Employee Profile
          </h1>
          <p className="text-muted-foreground">Add a new employee to the SGOAP system</p>
        </div>

        {/* Form Card */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name *</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Jane Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email Address *</label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Position *</label>
                  <Input
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g., Sales Manager"
                    required
                  />
                </div>
              </div>

              {/* Organization */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Organization</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Branch</label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                    >
                      {BRANCHES.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Role and Access */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Role & Access</h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
                  >
                    <option value="employee">Employee</option>
                    <option value="department_head">Department Head</option>
                    <option value="manager">Manager</option>
                    <option value="executive">Executive</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Role determines access level and available features
                  </p>
                </div>
              </div>

              {/* Employment Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Employment Details</h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Hire Date</label>
                  <Input name="hire_date" type="date" value={formData.hire_date} onChange={handleChange} />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-accent hover:bg-accent/90">
                  {loading ? "Creating..." : "Create Employee"}
                </Button>
              </div>

              {/* Info Box */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <p className="text-xs text-muted-foreground">
                  Once created, the employee will receive login credentials via email with a temporary password that
                  they can change on first login.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
