"use client"

import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RoleBasedNav } from "@/components/role-based-nav"
import { Mail, Phone, MapPin, Briefcase, Calendar, Shield, Edit2 } from "lucide-react"
import { useState } from "react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      employee: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
      department_head: "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300",
      manager: "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300",
      executive: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300",
      ceo: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
    }
    return colors[role] || colors.employee
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      employee: "Employee",
      department_head: "Department Head",
      manager: "Manager",
      executive: "Executive",
      ceo: "Chief Executive Officer",
    }
    return labels[role] || "Employee"
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNav />

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">View and manage your account information</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8 overflow-hidden">
          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-primary to-accent"></div>

          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative -mt-16">
                  <div className="h-32 w-32 rounded-lg border-4 border-background bg-gradient-to-br from-accent to-primary flex items-center justify-center text-4xl font-bold text-white">
                    {user?.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 pt-2">
                  <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
                  <div
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${getRoleColor(user?.role || "employee")}`}
                  >
                    {getRoleLabel(user?.role || "employee")}
                  </div>
                  <p className="mt-2 text-muted-foreground">{user?.position}</p>
                </div>
              </div>

              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Details Grid */}
            <div className="mt-8 grid gap-6 md:grid-cols-2 border-t border-border pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{user?.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Position</p>
                    <p className="font-medium text-foreground">{user?.position}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Branch</p>
                    <p className="font-medium text-foreground">{user?.branch}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <p className="font-medium text-foreground">{user?.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hire Date</p>
                    <p className="font-medium text-foreground">
                      {user?.hire_date ? new Date(user.hire_date).toLocaleDateString() : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Permissions Card */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Access & Permissions</h3>
          <div className="space-y-3">
            {user?.role === "employee" && (
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-sm font-medium text-foreground">Employee Access</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Can view personal dashboard, submit work, and collaborate with team
                </p>
              </div>
            )}
            {user?.role === "department_head" && (
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-sm font-medium text-foreground">Department Management</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Can manage team, review submissions, and access department analytics
                </p>
              </div>
            )}
            {user?.role === "manager" && (
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-sm font-medium text-foreground">Operations Management</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Can oversee multiple teams, allocate resources, and manage branch operations
                </p>
              </div>
            )}
            {user?.role === "executive" && (
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-sm font-medium text-foreground">Executive Access</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Can view all branches, access strategic analytics, and manage company-wide settings
                </p>
              </div>
            )}
            {user?.role === "ceo" && (
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-sm font-medium text-foreground">Full System Access</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete access to all features, user management, and system configuration
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
