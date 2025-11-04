"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Search, Download, BookOpen, Shield, Lock, Heart, DollarSign, Home } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getPolicies } from "@/lib/supabase/queries"
import { EmptyState } from "@/components/empty-state"
import { ListSkeleton } from "@/components/loading-skeleton"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const dynamic = 'force-dynamic'

const categoryIcons: Record<string, any> = {
  'HR Policies': BookOpen,
  'Code of Conduct': Shield,
  'IT & Security': Lock,
  'Health & Safety': Heart,
  'Financial': DollarSign,
  'Remote Work': Home,
}

export default function PoliciesPage() {
  const { user } = useAuth()
  const [policies, setPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null)

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const data = await getPolicies()
        setPolicies(data)
      } catch (error) {
        console.error('Error loading policies:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPolicies()
  }, [])

  const categories = Array.from(new Set(policies.map(p => p.policy_categories?.name).filter(Boolean)))

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          policy.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          policy.content?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || policy.policy_categories?.name === selectedCategory
    
    // Role/department-based filtering
    // Policies with target_roles or target_departments should be filtered
    // If no target specified, show to all
    let matchesRole = true
    if (user && policy.target_roles && Array.isArray(policy.target_roles)) {
      matchesRole = policy.target_roles.length === 0 || policy.target_roles.includes(user.role)
    }
    
    let matchesDepartment = true
    if (user && policy.target_departments && Array.isArray(policy.target_departments)) {
      matchesDepartment = policy.target_departments.length === 0 || 
                         policy.target_departments.includes(user.department) ||
                         ['admin', 'executive', 'ceo'].includes(user.role || '')
    }
    
    return matchesSearch && matchesCategory && matchesRole && matchesDepartment
  })

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Policies' }]} />

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Policies & Documents
          </h1>
          <p className="text-muted-foreground">Company policies and procedures</p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat}>
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Policy List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Policy Library</CardTitle>
                <CardDescription>{filteredPolicies.length} policies</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ListSkeleton items={5} />
                ) : filteredPolicies.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No policies found"
                    description="Try adjusting your search or filters"
                  />
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {filteredPolicies.map((policy) => {
                      const CategoryIcon = categoryIcons[policy.policy_categories?.name || ''] || FileText
                      return (
                        <button
                          key={policy.id}
                          onClick={() => setSelectedPolicy(policy)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedPolicy?.id === policy.id
                              ? 'bg-accent border-primary'
                              : 'hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <CategoryIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{policy.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {policy.policy_categories?.name || 'Uncategorized'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  v{policy.version}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(policy.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Policy Viewer */}
          <div className="lg:col-span-2">
            {selectedPolicy ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {selectedPolicy.title}
                        <Badge variant="outline">v{selectedPolicy.version}</Badge>
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-4">
                        <span>Category: {selectedPolicy.policy_categories?.name || 'Uncategorized'}</span>
                        {selectedPolicy.effective_date && (
                          <span>Effective: {new Date(selectedPolicy.effective_date).toLocaleDateString()}</span>
                        )}
                      </CardDescription>
                    </div>
                    {selectedPolicy.file_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedPolicy.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedPolicy.description && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground">{selectedPolicy.description}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold mb-2">Policy Content</h3>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-sm">
                        {selectedPolicy.content || 'No content available'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <EmptyState
                    icon={FileText}
                    title="Select a policy"
                    description="Choose a policy from the list to view its details"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}

