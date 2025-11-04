"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Settings, 
  Save, 
  Server, 
  Mail, 
  Shield, 
  Bell,
  Database,
  Globe,
  Lock,
  Users,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useState } from "react"

export default function SystemSettingsPage() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [settings, setSettings] = useState({
    // General Settings
    companyName: "SGOAP Inc.",
    companyEmail: "admin@sgoap.com",
    timezone: "America/New_York",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    
    // Security Settings
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: true,
    sessionTimeout: 30,
    twoFactorAuth: false,
    ipWhitelist: false,
    
    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    emailFrom: "noreply@sgoap.com",
    emailNotifications: true,
    
    // Notification Settings
    taskNotifications: true,
    leaveNotifications: true,
    purchaseNotifications: true,
    systemNotifications: true,
    
    // System Settings
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: "daily",
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "png"],
    
    // Feature Flags
    enableLeaveManagement: true,
    enableAssetManagement: true,
    enableTraining: true,
    enablePerformanceReviews: true,
    enableKnowledgeBase: true,
  })

  const handleSave = async () => {
    setSaving(true)
    // In production, save to database
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaving(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const settingSections = [
    {
      title: "General Settings",
      icon: Globe,
      settings: [
        { key: "companyName", label: "Company Name", type: "text" },
        { key: "companyEmail", label: "Company Email", type: "email" },
        { key: "timezone", label: "Timezone", type: "select", options: ["America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Tokyo"] },
        { key: "language", label: "Language", type: "select", options: ["en", "es", "fr", "de"] },
        { key: "dateFormat", label: "Date Format", type: "select", options: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] },
      ]
    },
    {
      title: "Security Settings",
      icon: Shield,
      settings: [
        { key: "passwordMinLength", label: "Minimum Password Length", type: "number" },
        { key: "passwordRequireUppercase", label: "Require Uppercase", type: "switch" },
        { key: "passwordRequireNumbers", label: "Require Numbers", type: "switch" },
        { key: "passwordRequireSpecial", label: "Require Special Characters", type: "switch" },
        { key: "sessionTimeout", label: "Session Timeout (minutes)", type: "number" },
        { key: "twoFactorAuth", label: "Enable Two-Factor Authentication", type: "switch" },
        { key: "ipWhitelist", label: "Enable IP Whitelist", type: "switch" },
      ]
    },
    {
      title: "Email Configuration",
      icon: Mail,
      settings: [
        { key: "smtpHost", label: "SMTP Host", type: "text" },
        { key: "smtpPort", label: "SMTP Port", type: "number" },
        { key: "smtpUser", label: "SMTP Username", type: "text" },
        { key: "smtpPassword", label: "SMTP Password", type: "password" },
        { key: "emailFrom", label: "From Email Address", type: "email" },
        { key: "emailNotifications", label: "Enable Email Notifications", type: "switch" },
      ]
    },
    {
      title: "Notification Preferences",
      icon: Bell,
      settings: [
        { key: "taskNotifications", label: "Task Notifications", type: "switch" },
        { key: "leaveNotifications", label: "Leave Notifications", type: "switch" },
        { key: "purchaseNotifications", label: "Purchase Notifications", type: "switch" },
        { key: "systemNotifications", label: "System Notifications", type: "switch" },
      ]
    },
    {
      title: "System Configuration",
      icon: Server,
      settings: [
        { key: "maintenanceMode", label: "Maintenance Mode", type: "switch" },
        { key: "autoBackup", label: "Automatic Backups", type: "switch" },
        { key: "backupFrequency", label: "Backup Frequency", type: "select", options: ["hourly", "daily", "weekly", "monthly"] },
        { key: "maxFileSize", label: "Max File Size (MB)", type: "number" },
      ]
    },
    {
      title: "Feature Management",
      icon: Settings,
      settings: [
        { key: "enableLeaveManagement", label: "Leave Management", type: "switch" },
        { key: "enableAssetManagement", label: "Asset Management", type: "switch" },
        { key: "enableTraining", label: "Training & Development", type: "switch" },
        { key: "enablePerformanceReviews", label: "Performance Reviews", type: "switch" },
        { key: "enableKnowledgeBase", label: "Knowledge Base", type: "switch" },
      ]
    }
  ]

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
                <Settings className="h-8 w-8 text-accent" />
                System Settings
              </h1>
              <p className="text-muted-foreground">
                Configure system-wide settings and preferences
              </p>
            </div>
            <div className="flex gap-2">
              {showSuccess && (
                <Badge className="bg-green-600 gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Settings Saved
                </Badge>
              )}
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save All Changes"}
              </Button>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {settingSections.map((section, idx) => {
              const SectionIcon = section.icon
              return (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SectionIcon className="h-5 w-5 text-accent" />
                      {section.title}
                    </CardTitle>
                    <CardDescription>
                      Configure {section.title.toLowerCase()} for your organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.settings.map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex-1">
                          <Label htmlFor={setting.key} className="text-sm font-medium">
                            {setting.label}
                          </Label>
                          {setting.type !== "switch" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {setting.key.includes("password") ? "Security requirement" : ""}
                            </p>
                          )}
                        </div>
                        <div className="w-64">
                          {setting.type === "switch" ? (
                            <Switch
                              id={setting.key}
                              checked={settings[setting.key as keyof typeof settings] as boolean}
                              onCheckedChange={(checked) => updateSetting(setting.key, checked)}
                            />
                          ) : setting.type === "select" ? (
                            <select
                              id={setting.key}
                              value={settings[setting.key as keyof typeof settings] as string}
                              onChange={(e) => updateSetting(setting.key, e.target.value)}
                              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                            >
                              {setting.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              id={setting.key}
                              type={setting.type}
                              value={settings[setting.key as keyof typeof settings] as string | number}
                              onChange={(e) => updateSetting(setting.key, setting.type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
                              className="w-full"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Warning Alert */}
          <Card className="mt-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    Important Notice
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Changes to system settings may affect all users. Please review carefully before saving. 
                    It's recommended to test changes in a staging environment first.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
