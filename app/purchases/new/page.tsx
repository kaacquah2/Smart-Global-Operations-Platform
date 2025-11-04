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
import { useFormValidation } from "@/lib/hooks/use-form-validation"
import { ValidationRules } from "@/lib/validation"
import { 
  generateFieldId, 
  generateErrorId, 
  getFieldAriaLabel, 
  getFieldAriaDescribedBy, 
  getFieldAriaInvalid 
} from "@/lib/accessibility"

export const dynamic = 'force-dynamic'

export default function NewPurchaseRequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [attachments, setAttachments] = useState<string[]>([])

  const form = useFormValidation(
    {
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
    },
    {
      title: ValidationRules.required,
      description: ValidationRules.required,
      category: ValidationRules.required,
      estimated_cost: ValidationRules.positiveNumber,
      justification: ValidationRules.required,
      vendor_name: ValidationRules.optional,
      vendor_contact: ValidationRules.optional,
      currency: ValidationRules.required,
      urgency: ValidationRules.required,
      department_id: ValidationRules.optional,
    },
    {
      validateOnChange: true,
      validateOnBlur: true,
      onSubmit: async (data) => {
        if (!user) return
        setLoading(true)
        try {
          const requestData = {
            ...data,
            requestor_id: user.id,
            department_id: data.department_id || undefined,
            estimated_cost: parseFloat(data.estimated_cost),
            attachments: attachments.length > 0 ? attachments : undefined,
          }

          const request = await createPurchaseRequest(requestData as any)
          router.push(`/purchases/${request.id}`)
        } catch (error) {
          console.error('Error creating purchase request:', error)
          alert('Failed to create purchase request. Please try again.')
          throw error
        } finally {
          setLoading(false)
        }
      },
    }
  )

  useEffect(() => {
    const loadDepartments = async () => {
      const depts = await getAllDepartments()
      setDepartments(depts)
      
      // Set user's department if available
      if (depts.length > 0 && user?.department) {
        const userDept = depts.find(d => d.name === user.department)
        if (userDept) {
          form.setFieldValue('department_id', userDept.id)
        }
      }
    }
    loadDepartments()
  }, [user])

  const handleSubmitForApproval = async () => {
    const isValid = await form.handleSubmit()
    if (!isValid || !user) return

    setLoading(true)
    try {
      const requestData = {
        ...form.data,
        requestor_id: user.id,
        department_id: form.data.department_id || undefined,
        estimated_cost: parseFloat(form.data.estimated_cost),
        attachments: attachments.length > 0 ? attachments : undefined,
      }

      const request = await createPurchaseRequest(requestData as any)
      await submitPurchaseRequest(request.id)
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
            <form onSubmit={form.handleSubmit} className="space-y-6" aria-label="New purchase request form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={generateFieldId('purchase', 'title')}>Title *</Label>
                  <Input
                    id={generateFieldId('purchase', 'title')}
                    value={form.data.title}
                    onChange={(e) => form.handleChange('title')(e.target.value)}
                    onBlur={form.handleBlur('title')}
                    aria-label={getFieldAriaLabel('Title', true)}
                    aria-invalid={getFieldAriaInvalid(!!form.errors.title)}
                    aria-describedby={getFieldAriaDescribedBy(generateFieldId('purchase', 'title'), !!form.errors.title)}
                    required
                  />
                  {form.errors.title && form.touched.title && (
                    <p id={generateErrorId(generateFieldId('purchase', 'title'))} className="text-sm text-destructive mt-1" role="alert">
                      {form.errors.title}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={generateFieldId('purchase', 'category')}>Category *</Label>
                  <Select 
                    value={form.data.category} 
                    onValueChange={(value) => form.handleChange('category')(value)}
                  >
                    <SelectTrigger
                      id={generateFieldId('purchase', 'category')}
                      aria-label={getFieldAriaLabel('Category', true)}
                      aria-invalid={getFieldAriaInvalid(!!form.errors.category)}
                    >
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
                  {form.errors.category && form.touched.category && (
                    <p id={generateErrorId(generateFieldId('purchase', 'category'))} className="text-sm text-destructive mt-1" role="alert">
                      {form.errors.category}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor={generateFieldId('purchase', 'description')}>Description *</Label>
                <Textarea
                  id={generateFieldId('purchase', 'description')}
                  value={form.data.description}
                  onChange={(e) => form.handleChange('description')(e.target.value)}
                  onBlur={form.handleBlur('description')}
                  rows={4}
                  aria-label={getFieldAriaLabel('Description', true)}
                  aria-invalid={getFieldAriaInvalid(!!form.errors.description)}
                  aria-describedby={getFieldAriaDescribedBy(generateFieldId('purchase', 'description'), !!form.errors.description)}
                  required
                />
                {form.errors.description && form.touched.description && (
                  <p id={generateErrorId(generateFieldId('purchase', 'description'))} className="text-sm text-destructive mt-1" role="alert">
                    {form.errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={generateFieldId('purchase', 'estimated_cost')}>Estimated Cost *</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={form.data.currency} 
                      onValueChange={(value) => form.handleChange('currency')(value)}
                    >
                      <SelectTrigger className="w-24" aria-label="Currency">
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
                      id={generateFieldId('purchase', 'estimated_cost')}
                      type="number"
                      step="0.01"
                      value={form.data.estimated_cost}
                      onChange={(e) => form.handleChange('estimated_cost')(e.target.value)}
                      onBlur={form.handleBlur('estimated_cost')}
                      aria-label={getFieldAriaLabel('Estimated Cost', true)}
                      aria-invalid={getFieldAriaInvalid(!!form.errors.estimated_cost)}
                      aria-describedby={getFieldAriaDescribedBy(generateFieldId('purchase', 'estimated_cost'), !!form.errors.estimated_cost)}
                      required
                    />
                  </div>
                  {form.errors.estimated_cost && form.touched.estimated_cost && (
                    <p id={generateErrorId(generateFieldId('purchase', 'estimated_cost'))} className="text-sm text-destructive mt-1" role="alert">
                      {form.errors.estimated_cost}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={generateFieldId('purchase', 'urgency')}>Urgency</Label>
                  <Select 
                    value={form.data.urgency} 
                    onValueChange={(value) => form.handleChange('urgency')(value)}
                  >
                    <SelectTrigger
                      id={generateFieldId('purchase', 'urgency')}
                      aria-label="Urgency level"
                    >
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
                  <Label htmlFor={generateFieldId('purchase', 'vendor_name')}>Vendor Name</Label>
                  <Input
                    id={generateFieldId('purchase', 'vendor_name')}
                    value={form.data.vendor_name}
                    onChange={(e) => form.handleChange('vendor_name')(e.target.value)}
                    onBlur={form.handleBlur('vendor_name')}
                    aria-label="Vendor Name"
                  />
                </div>
                <div>
                  <Label htmlFor={generateFieldId('purchase', 'vendor_contact')}>Vendor Contact</Label>
                  <Input
                    id={generateFieldId('purchase', 'vendor_contact')}
                    value={form.data.vendor_contact}
                    onChange={(e) => form.handleChange('vendor_contact')(e.target.value)}
                    onBlur={form.handleBlur('vendor_contact')}
                    aria-label="Vendor Contact"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={generateFieldId('purchase', 'justification')}>Justification *</Label>
                <Textarea
                  id={generateFieldId('purchase', 'justification')}
                  value={form.data.justification}
                  onChange={(e) => form.handleChange('justification')(e.target.value)}
                  onBlur={form.handleBlur('justification')}
                  rows={4}
                  placeholder="Explain why this purchase is necessary..."
                  aria-label={getFieldAriaLabel('Justification', true)}
                  aria-invalid={getFieldAriaInvalid(!!form.errors.justification)}
                  aria-describedby={getFieldAriaDescribedBy(generateFieldId('purchase', 'justification'), !!form.errors.justification)}
                  required
                />
                {form.errors.justification && form.touched.justification && (
                  <p id={generateErrorId(generateFieldId('purchase', 'justification'))} className="text-sm text-destructive mt-1" role="alert">
                    {form.errors.justification}
                  </p>
                )}
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
                <Button type="submit" variant="outline" disabled={loading || form.isSubmitting} aria-label="Save purchase request as draft">
                  Save as Draft
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSubmitForApproval}
                  disabled={loading || form.isSubmitting}
                  aria-label="Submit purchase request for approval"
                >
                  {loading || form.isSubmitting ? "Submitting..." : "Submit for Approval"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </LayoutWithSidebar>
  )
}

