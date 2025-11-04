"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ArrowLeft, CheckCircle, AlertCircle, Copy, Check } from "lucide-react"
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
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string; name: string } | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
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

      const result = await createEmployee(formData)
      setCreatedCredentials({
        email: result.user.email,
        password: result.tempPassword,
        name: result.user.name,
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (success && createdCredentials) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Employee Created Successfully!</h2>
              <p className="text-muted-foreground">
                Login credentials have been sent to <strong>{createdCredentials.email}</strong>
              </p>
            </div>

            {/* Credentials Display */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4 text-center">Employee Credentials</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Employee Name</label>
                  <div className="flex items-center gap-2 bg-card border border-border rounded-md p-3">
                    <span className="flex-1 font-mono text-sm">{createdCredentials.name}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Email Address</label>
                  <div className="flex items-center gap-2 bg-card border border-border rounded-md p-3">
                    <span className="flex-1 font-mono text-sm">{createdCredentials.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(createdCredentials.email, 'email')}
                      className="h-8 w-8 p-0"
                    >
                      {copiedField === 'email' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Temporary Password</label>
                  <div className="flex items-center gap-2 bg-card border border-border rounded-md p-3">
                    <span className="flex-1 font-mono text-sm font-bold">{createdCredentials.password}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(createdCredentials.password, 'password')}
                      className="h-8 w-8 p-0"
                    >
                      {copiedField === 'password' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ Important:</strong> Save these credentials securely. The employee will also receive them via email. 
                  They should change their password on first login.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.push("/admin/employees/create")}
                className="flex-1"
              >
                Create Another Employee
              </Button>
              <Button 
                onClick={() => router.push("/admin/employees")}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                Back to Employees
              </Button>
            </div>
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
