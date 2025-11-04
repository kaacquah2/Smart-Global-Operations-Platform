"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Settings,
  Shield,
  Key,
  Clock,
  Save,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  RefreshCw,
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PasswordResetSettings {
  enabled: boolean
  frequency: "quarterly" | "monthly" | "bi-monthly" | "yearly" | "never"
  nextResetDate: string | null
  lastResetDate: string | null
  notifyUsers: boolean
  daysBeforeNotification: number
}

export default function AdminSettingsPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  
  const [settings, setSettings] = useState<PasswordResetSettings>({
    enabled: true,
    frequency: "quarterly",
    nextResetDate: null,
    lastResetDate: null,
    notifyUsers: true,
    daysBeforeNotification: 7,
  })

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/auth/login")
      return
    }
    loadSettings()
  }, [user, isLoggedIn, router])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/password-reset-settings')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateNextResetDate = (frequency: string): string => {
    const today = new Date()
    let nextDate = new Date(today)

    switch (frequency) {
      case "quarterly":
        nextDate.setMonth(today.getMonth() + 3)
        break
      case "monthly":
        nextDate.setMonth(today.getMonth() + 1)
        break
      case "bi-monthly":
        nextDate.setMonth(today.getMonth() + 2)
        break
      case "yearly":
        nextDate.setFullYear(today.getFullYear() + 1)
        break
      default:
        return ""
    }

    return nextDate.toISOString().split('T')[0]
  }

  const handleFrequencyChange = (frequency: string) => {
    const nextResetDate = frequency === "never" ? null : calculateNextResetDate(frequency)
    setSettings({
      ...settings,
      frequency: frequency as PasswordResetSettings["frequency"],
      nextResetDate,
      enabled: frequency !== "never",
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/password-reset-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleTriggerReset = async () => {
    if (!confirm("Are you sure you want to trigger a password reset for all users? This will force them to reset their passwords on next login.")) {
      return
    }

    setLoading(true)
    setError("")
    try {
      const response = await fetch('/api/admin/trigger-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to trigger password reset')
      }

      const data = await response.json()
      alert(`Password reset triggered successfully. ${data.count || 0} users will be notified.`)
      loadSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger password reset")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-accent" />
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-8 w-8 text-accent" />
              Admin Settings
            </h2>
          </div>
          <p className="text-muted-foreground">Manage system settings and password policies</p>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="h-5 w-5" />
                <span>Settings saved successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Password Reset Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password Reset Schedule
            </CardTitle>
            <CardDescription>
              Configure automatic password reset schedules for all users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-foreground">Enable Automatic Password Resets</label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically require users to reset their passwords at scheduled intervals
                  </p>
                </div>
                <Button
                  variant={settings.enabled ? "default" : "outline"}
                  onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                >
                  {settings.enabled ? "Enabled" : "Disabled"}
                </Button>
              </div>

              {settings.enabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Reset Frequency</label>
                    <Select value={settings.frequency} onValueChange={handleFrequencyChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quarterly">Quarterly (Every 3 months)</SelectItem>
                        <SelectItem value="bi-monthly">Bi-Monthly (Every 2 months)</SelectItem>
                        <SelectItem value="monthly">Monthly (Every month)</SelectItem>
                        <SelectItem value="yearly">Yearly (Every year)</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How often users will be required to reset their passwords
                    </p>
                  </div>

                  {settings.nextResetDate && (
                    <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">Next Scheduled Reset</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(settings.nextResetDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-foreground">Notify Users Before Reset</label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Send email notifications to users before password reset deadline
                      </p>
                    </div>
                    <Button
                      variant={settings.notifyUsers ? "default" : "outline"}
                      onClick={() => setSettings({ ...settings, notifyUsers: !settings.notifyUsers })}
                    >
                      {settings.notifyUsers ? "Enabled" : "Disabled"}
                    </Button>
                  </div>

                  {settings.notifyUsers && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Days Before Notification</label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.daysBeforeNotification}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            daysBeforeNotification: parseInt(e.target.value) || 7,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        How many days before the reset deadline to notify users
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
              {settings.enabled && (
                <Button
                  variant="outline"
                  onClick={handleTriggerReset}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Trigger Reset Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Privileges Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Privileges
            </CardTitle>
            <CardDescription>
              Overview of available admin capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Users className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Employee Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Create, edit, deactivate, and manage employee accounts
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Key className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Password Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Set password reset schedules and trigger resets
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Shield className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Access Control</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage user roles and permissions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Clock className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Position Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Check position availability before creating employees
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}

