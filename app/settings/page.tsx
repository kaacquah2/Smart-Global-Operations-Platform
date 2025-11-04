"use client"

import { useAuth } from "@/lib/auth-context"
import { RoleBasedNav } from "@/components/role-based-nav"
import { User, Lock, Bell, Shield, CreditCard, Save, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }, 1000)
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "privacy", label: "Privacy & Data", icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNav />

      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-16 z-30 px-6 py-4">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Success Message */}
            {showSuccess && (
              <div className="mb-6 flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-950/30 p-4 border border-green-200 dark:border-green-900/50">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Settings saved successfully</p>
                <button onClick={() => setShowSuccess(false)} className="text-green-600 dark:text-green-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-4">
              {/* Sidebar Navigation */}
              <div>
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                          isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Content Area */}
              <div className="lg:col-span-3">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-6">Profile Information</h3>
                      <div className="space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-6">
                          <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                            {user?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <Button variant="outline" size="sm" className="mb-2 bg-transparent">
                              Change Avatar
                            </Button>
                            <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 10MB</p>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">First Name</label>
                            <input
                              type="text"
                              defaultValue={user?.name.split(" ")[0]}
                              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Last Name</label>
                            <input
                              type="text"
                              defaultValue={user?.name.split(" ").slice(1).join(" ")}
                              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Email Address</label>
                          <input
                            type="email"
                            defaultValue={user?.email}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Job Title</label>
                          <input
                            type="text"
                            defaultValue={user?.position || ''}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Department</label>
                          <input
                            type="text"
                            defaultValue={user?.department}
                            disabled
                            className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-muted-foreground focus:outline-none"
                          />
                        </div>

                        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                          <Save className="h-4 w-4" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-6">Password & Security</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Current Password</label>
                          <input
                            type="password"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">New Password</label>
                          <input
                            type="password"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">Confirm Password</label>
                          <input
                            type="password"
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                        <Button onClick={handleSave} className="gap-2">
                          <Lock className="h-4 w-4" />
                          Update Password
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <Button>Enable 2FA</Button>
                    </Card>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Email Notifications", desc: "Receive updates about tasks and projects" },
                        { label: "Task Reminders", desc: "Get reminded about upcoming deadlines" },
                        { label: "Team Updates", desc: "Notifications about team activity" },
                        { label: "System Alerts", desc: "Important system and security alerts" },
                        { label: "Weekly Report", desc: "Receive weekly performance summary" },
                        { label: "Marketing Emails", desc: "Information about new features and updates" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-4 border-b border-border last:border-0"
                        >
                          <div>
                            <p className="font-medium text-foreground">{item.label}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                          <input type="checkbox" defaultChecked className="h-5 w-5 rounded cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Billing Tab */}
                {activeTab === "billing" && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Billing Information</h3>
                    <div className="space-y-6">
                      <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                        <p className="text-sm font-medium text-foreground">Current Plan: Professional</p>
                        <p className="text-sm text-muted-foreground mt-1">$299/month • Billed on 15th of each month</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-4">Payment Method</h4>
                        <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
                          <div className="h-12 w-12 rounded bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">Visa ending in 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/25</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Update
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Privacy Tab */}
                {activeTab === "privacy" && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">Privacy & Data</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-foreground mb-3">Data Export</h4>
                        <p className="text-sm text-muted-foreground mb-4">Download a copy of your data</p>
                        <Button variant="outline">Export My Data</Button>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-3">Privacy Settings</h4>
                        <div className="space-y-3">
                          {[
                            { label: "Profile visibility", checked: true },
                            { label: "Allow team to see activity", checked: true },
                            { label: "Analytics tracking", checked: false },
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <input type="checkbox" defaultChecked={item.checked} className="h-5 w-5 rounded" />
                              <label className="text-sm text-foreground">{item.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
