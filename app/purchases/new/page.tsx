"use client"

import { LayoutWithSidebar } from "@/app/layout-with-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { createPurchaseRequest, submitPurchaseRequest, getAllDepartments } from "@/lib/supabase/queries"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FileUpload } from "@/components/file-upload"

export const dynamic = 'force-dynamic'

export default function NewPurchaseRequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    vendor_name: '',
    vendor_contact: '',
    estimated_cost: '',
    currency: 'USD',
    justification: '',
    urgency: 'normal',
    department_id: '',
  })
  const [attachments, setAttachments] = useState<string[]>([])

  useEffect(() => {
    const loadDepartments = async () => {
      const depts = await getAllDepartments()
      setDepartments(depts)
      
      // Set user's department if available
      if (depts.length > 0 && user?.department) {
        const userDept = depts.find(d => d.name === user.department)
        if (userDept) {
          setFormData(prev => ({ ...prev, department_id: userDept.id }))
        }
      }
    }
    loadDepartments()
  }, [user])

  const handleSubmit = async (e: React.FormEvent, submitForApproval: boolean = false) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const requestData = {
        ...formData,
        requestor_id: user.id,
        department_id: formData.department_id || undefined,
        estimated_cost: parseFloat(formData.estimated_cost),
        attachments: attachments.length > 0 ? attachments : undefined,
      }

      const request = await createPurchaseRequest(requestData as any)

      if (submitForApproval) {
        await submitPurchaseRequest(request.id)
      }

      router.push(`/purchases/${request.id}`)
    } catch (error) {
      console.error('Error creating purchase request:', error)
      alert('Failed to create purchase request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutWithSidebar>
      <div className="space-y-6">
        <Link href="/purchases">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>New Purchase Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimated_cost">Estimated Cost *</Label>
                  <div className="flex gap-2">
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="estimated_cost"
                      type="number"
                      step="0.01"
                      value={formData.estimated_cost}
                      onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData({ ...formData, urgency: value })}>
                    <SelectTrigger>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor_name">Vendor Name</Label>
                  <Input
                    id="vendor_name"
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="vendor_contact">Vendor Contact</Label>
                  <Input
                    id="vendor_contact"
                    value={formData.vendor_contact}
                    onChange={(e) => setFormData({ ...formData, vendor_contact: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="justification">Justification *</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  rows={4}
                  placeholder="Explain why this purchase is necessary..."
                  required
                />
              </div>

              <div>
                <Label>Attachments (Optional)</Label>
                <div className="mt-2">
                  {user && (
                    <FileUpload
                      folder="purchase-requests"
                      userId={user.id}
                      onUploadComplete={(urls) => setAttachments([...attachments, ...urls])}
                      maxFiles={5}
                      maxSizeMB={50}
                    />
                  )}
                  {attachments.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" variant="outline" disabled={loading}>
                  Save as Draft
                </Button>
                <Button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                >
                  Submit for Approval
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </LayoutWithSidebar>
  )
}

