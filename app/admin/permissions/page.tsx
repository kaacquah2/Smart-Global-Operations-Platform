"use client"

import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Shield, Key } from "lucide-react"
import { useState } from "react"

const roles = [
  {
    id: "employee",
    name: "Employee",
    description: "Can view own tasks and submit work",
    permissions: ["View Own Dashboard", "Submit Work", "Message Team", "View Department Info", "Access Calendar", "Apply for Leave", "View Tasks"],
    canEdit: false,
  },
  {
    id: "department_head",
    name: "Department Head",
    description: "Can manage department and team members",
    permissions: [
      "View Department Dashboard",
      "Review Work Submissions",
      "Manage Team Members",
      "View Performance Metrics",
      "Assign Tasks",
      "Generate Reports",
      "Create Purchase Requests",
      "Approve Leave Requests",
      "View Team Analytics",
    ],
    canEdit: true,
  },
  {
    id: "manager",
    name: "Manager",
    description: "Can oversee operations and teams",
    permissions: [
      "View Branch Operations",
      "Manage Multiple Departments",
      "Resource Allocation",
      "Performance Analytics",
      "Team Scheduling",
      "Budget Management",
      "Cross-Department Coordination",
      "Strategic Reports",
      "Workflow Management",
    ],
    canEdit: true,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Strategic oversight across all operations",
    permissions: [
      "View All Branches",
      "Revenue Analytics",
      "Executive Reports",
      "Strategic Planning",
      "Policy Management",
      "Company-Wide Insights",
      "Budget Oversight",
      "Department Performance Review",
    ],
    canEdit: true,
  },
  {
    id: "admin",
    name: "Administrator",
    description: "System administration and user management",
    permissions: [
      "Manage All Employees",
      "Create and Edit Users",
      "Assign and Manage Tasks",
      "View System Analytics",
      "Generate Reports",
      "Oversee Purchase Requests",
      "Department Management",
      "System Configuration",
      "Permission Management",
      "Access All Features",
    ],
    canEdit: true,
  },
  {
    id: "ceo",
    name: "CEO",
    description: "Full system access",
    permissions: [
      "View Everything",
      "Manage Users",
      "System Configuration",
      "Strategic Direction",
      "Financial Overview",
      "Company-Wide Analytics",
      "All Administrative Functions",
    ],
    canEdit: false,
  },
]

export default function PermissionsPage() {
  const { user } = useAuth()
  const [expandedRole, setExpandedRole] = useState<string | null>(null)

  // CEO, executives, and admins can access this
  const canManagePermissions = user?.role === "ceo" || user?.role === "executive" || user?.role === "admin"

  if (!canManagePermissions) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground">Only executives and the CEO can manage system permissions.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Role & Permission Management</h1>
          <p className="text-muted-foreground">Configure roles, permissions, and access controls</p>
        </div>

        {/* Roles Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-5">
          {roles.map((role) => (
            <Card 
              key={role.id} 
              className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
            >
              <Shield className="h-8 w-8 mx-auto mb-2 text-accent" />
              <p className="font-semibold text-foreground text-sm">{role.name}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{role.description}</p>
            </Card>
          ))}
        </div>

        {/* Detailed Role Permissions */}
        <div className="space-y-4">
          {roles.map((role) => (
            <Card key={role.id} className="border border-border">
              <button
                onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                className="w-full p-6 text-left hover:bg-card/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-5 w-5 text-accent" />
                      <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                  <div className="text-accent">{expandedRole === role.id ? "−" : "+"}</div>
                </div>
              </button>

              {expandedRole === role.id && (
                <div className="border-t border-border px-6 py-4 bg-card/30">
                  <h4 className="font-semibold text-foreground mb-3">Permissions</h4>
                  <div className="grid gap-2 md:grid-cols-2 mb-4">
                    {role.permissions.map((permission, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Key className="h-4 w-4 text-accent" />
                        <span className="text-foreground">{permission}</span>
                      </div>
                    ))}
                  </div>

                  {role.canEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 bg-transparent"
                      onClick={() => {
                        // Open edit permissions dialog/modal
                        // In production, this would open a modal to edit permissions for this role
                        alert(`Edit permissions for ${role.name} role\n\nThis feature would open a modal/dialog to modify permissions for this role.`)
                      }}
                    >
                      <Lock className="h-4 w-4" />
                      Edit Permissions
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-border bg-accent/10 p-6">
          <h3 className="mb-2 font-semibold text-foreground">Permission Hierarchy</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Role permissions cascade downward. Each role has access to features of roles below it:
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-foreground">CEO (Full) → Executive → Manager → Department Head → Employee (Limited)</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
