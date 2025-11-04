"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { 
  Plug, 
  Plus, 
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Key,
  Globe,
  Mail,
  Database,
  Shield
} from "lucide-react"
import { SidebarLayout } from "@/components/sidebar-layout"
import { useState } from "react"

export default function IntegrationsPage() {
  const { user } = useAuth()
  const [integrations, setIntegrations] = useState([
    {
      id: '1',
      name: 'Slack',
      category: 'Communication',
      status: 'connected',
      icon: '💬',
      description: 'Team messaging and notifications',
      lastSync: '2 minutes ago',
      apiKey: 'slk_••••••••••••••••',
      webhookUrl: 'https://hooks.slack.com/services/...',
      enabled: true,
      syncFrequency: 'realtime'
    },
    {
      id: '2',
      name: 'Microsoft 365',
      category: 'Productivity',
      status: 'connected',
      icon: '📧',
      description: 'Email, calendar, and Office integration',
      lastSync: '5 minutes ago',
      apiKey: 'm365_••••••••••••••••',
      webhookUrl: null,
      enabled: true,
      syncFrequency: 'hourly'
    },
    {
      id: '3',
      name: 'Google Workspace',
      category: 'Productivity',
      status: 'connected',
      icon: '🔷',
      description: 'Gmail, Calendar, and Drive integration',
      lastSync: '10 minutes ago',
      apiKey: 'gws_••••••••••••••••',
      webhookUrl: null,
      enabled: false,
      syncFrequency: 'daily'
    },
    {
      id: '4',
      name: 'Salesforce',
      category: 'CRM',
      status: 'disconnected',
      icon: '☁️',
      description: 'Customer relationship management',
      lastSync: 'Never',
      apiKey: null,
      webhookUrl: null,
      enabled: false,
      syncFrequency: 'hourly'
    },
    {
      id: '5',
      name: 'Zapier',
      category: 'Automation',
      status: 'connected',
      icon: '⚡',
      description: 'Workflow automation and triggers',
      lastSync: '1 minute ago',
      apiKey: 'zap_••••••••••••••••',
      webhookUrl: 'https://hooks.zapier.com/...',
      enabled: true,
      syncFrequency: 'realtime'
    },
    {
      id: '6',
      name: 'Stripe',
      category: 'Payment',
      status: 'connected',
      icon: '💳',
      description: 'Payment processing and billing',
      lastSync: 'Just now',
      apiKey: 'sk_••••••••••••••••',
      webhookUrl: 'https://api.stripe.com/...',
      enabled: true,
      syncFrequency: 'realtime'
    },
  ])

  const availableIntegrations = [
    {
      name: 'Jira',
      category: 'Project Management',
      icon: '🎯',
      description: 'Issue tracking and project management'
    },
    {
      name: 'GitHub',
      category: 'Development',
      icon: '💻',
      description: 'Code repository and version control'
    },
    {
      name: 'Notion',
      category: 'Documentation',
      icon: '📝',
      description: 'Documentation and knowledge base'
    },
  ]

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'disconnected': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length
  const enabledCount = integrations.filter(i => i.enabled).length

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
                <Plug className="h-8 w-8 text-accent" />
                Integration Management
              </h1>
              <p className="text-muted-foreground">
                Manage third-party integrations and API connections
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Integration
            </Button>
          </div>

          {/* Statistics */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Integrations</p>
                    <p className="text-2xl font-bold">{integrations.length}</p>
                  </div>
                  <Plug className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Connected</p>
                    <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Enabled</p>
                    <p className="text-2xl font-bold text-emerald-600">{enabledCount}</p>
                  </div>
                  <Shield className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold">{availableIntegrations.length}</p>
                  </div>
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Integrations */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Active Integrations</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription className="text-xs">{integration.category}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                    </div>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={integration.enabled}
                            onCheckedChange={() => toggleIntegration(integration.id)}
                          />
                          <span className={integration.enabled ? 'text-green-600' : 'text-gray-500'}>
                            {integration.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span className="font-medium">{integration.lastSync}</span>
                      </div>
                      {integration.apiKey && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Key className="h-3 w-3" />
                            API Key:
                          </span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{integration.apiKey}</code>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                          <Settings className="h-4 w-4" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Sync
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Available Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>Add new integrations to extend functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {availableIntegrations.map((integration, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-xs text-muted-foreground">{integration.category}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                      <Button className="w-full" variant="outline">
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}
