"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Megaphone } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { createAnnouncement, getAllDepartments, getBranches } from "@/lib/supabase/queries"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"

export const dynamic = 'force-dynamic'

export default function NewAnnouncementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as 'general' | 'important' | 'urgent' | 'event' | 'policy_update',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    target_audience: 'all' as 'all' | 'department' | 'branch' | 'role',
    target_department: '',
    target_branch: '',
    target_roles: [] as string[],
    is_pinned: false,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  })

  useEffect(() => {
    if (!user) return
    
    const loadData = async () => {
      const [depts, brs] = await Promise.all([
        getAllDepartments(),
        getBranches()
      ])
      setDepartments(depts || [])
      setBranches(brs || [])
    }
    
    loadData()
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_pinned: checked }))
  }

  const handleRoleToggle = (role: string) => {
    setFormData(prev => {
      const currentRoles = prev.target_roles || []
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role]
      return { ...prev, target_roles: newRoles }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('You must be logged in to create an announcement')
      return
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const announcementData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        priority: formData.priority,
        target_audience: formData.target_audience,
        target_department: formData.target_audience === 'department' ? formData.target_department : undefined,
        target_branch: formData.target_audience === 'branch' ? formData.target_branch : undefined,
        target_roles: formData.target_audience === 'role' && formData.target_roles.length > 0 ? formData.target_roles : undefined,
        is_pinned: formData.is_pinned,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : new Date().toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
        created_by: user.id,
      }

      await createAnnouncement(announcementData as any)
      router.push('/announcements')
    } catch (error) {
      console.error('Error creating announcement:', error)
      alert('Failed to create announcement. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canCreate = user && ['admin', 'manager', 'executive', 'ceo', 'department_head'].includes(user.role || '')

  if (!canCreate) {
    return (
      <LayoutWithSidebar>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">You don't have permission to create announcements.</p>
            <Link href="/announcements">
              <Button variant="outline" className="mt-4">
                Go Back
              </Button>
            </Link>
          </CardContent>
        </Card>
      </LayoutWithSidebar>
    )
  }

  const roles = ['employee', 'department_head', 'manager', 'executive', 'ceo', 'admin']

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Announcements', href: '/announcements' }, { label: 'New Announcement' }]} />

        <div className="flex items-center gap-4">
          <Link href="/announcements">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Megaphone className="h-8 w-8" />
              Create New Announcement
            </h1>
            <p className="text-muted-foreground">Share important information with your team</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Announcement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter announcement title"
                  required
                  className="mt-2"
                />
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Enter announcement content..."
                  rows={8}
                  required
                  className="mt-2"
                />
              </div>

              {/* Type and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="policy_update">Policy Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <Label htmlFor="target_audience">Target Audience *</Label>
                <Select value={formData.target_audience} onValueChange={(value) => handleSelectChange('target_audience', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="branch">Branch</SelectItem>
                    <SelectItem value="role">Specific Roles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Fields */}
              {formData.target_audience === 'department' && (
                <div>
                  <Label htmlFor="target_department">Select Department</Label>
                  <Select value={formData.target_department} onValueChange={(value) => handleSelectChange('target_department', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.target_audience === 'branch' && (
                <div>
                  <Label htmlFor="target_branch">Select Branch</Label>
                  <Select value={formData.target_branch} onValueChange={(value) => handleSelectChange('target_branch', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.name}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.target_audience === 'role' && (
                <div>
                  <Label>Select Roles</Label>
                  <div className="mt-2 space-y-2">
                    {roles.map(role => (
                      <div key={role} className="flex items-center gap-2">
                        <Checkbox
                          id={`role-${role}`}
                          checked={formData.target_roles.includes(role)}
                          onCheckedChange={() => handleRoleToggle(role)}
                        />
                        <Label htmlFor={`role-${role}`} className="font-normal cursor-pointer capitalize">
                          {role.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Pin Announcement */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="is_pinned" className="font-normal cursor-pointer">
                  Pin this announcement (show at top of list)
                </Label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Announcement'}
                </Button>
                <Link href="/announcements" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </LayoutWithSidebar>
  )
}

