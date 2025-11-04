"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface BulkActionsProps<T extends { id: string }> {
  items: T[]
  selectedItems: string[]
  onSelectionChange: (ids: string[]) => void
  onBulkAction: (ids: string[], action: string, comments?: string) => Promise<void>
  actionType: 'approve' | 'reject' | 'delete' | 'review'
  title: string
  description?: string
}

export function BulkActions<T extends { id: string }>({
  items,
  selectedItems,
  onSelectionChange,
  onBulkAction,
  actionType,
  title,
  description
}: BulkActionsProps<T>) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(items.map(item => item.id))
    }
  }

  const handleToggle = (id: string) => {
    if (selectedItems.includes(id)) {
      onSelectionChange(selectedItems.filter(itemId => itemId !== id))
    } else {
      onSelectionChange([...selectedItems, id])
    }
  }

  const handleBulkAction = async () => {
    if (selectedItems.length === 0) return

    setProcessing(true)
    try {
      await onBulkAction(selectedItems, actionType, comments)
      setOpen(false)
      setComments('')
      onSelectionChange([])
    } catch (error) {
      console.error('Bulk action error:', error)
      alert('Failed to perform bulk action. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const getActionButton = () => {
    switch (actionType) {
      case 'approve':
        return (
          <Button
            onClick={() => setOpen(true)}
            disabled={selectedItems.length === 0}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Approve Selected ({selectedItems.length})
          </Button>
        )
      case 'reject':
        return (
          <Button
            onClick={() => setOpen(true)}
            disabled={selectedItems.length === 0}
            variant="destructive"
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Reject Selected ({selectedItems.length})
          </Button>
        )
      default:
        return null
    }
  }

  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedItems.length === items.length && items.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <Label className="text-sm">
              Select All ({selectedItems.length}/{items.length})
            </Label>
          </div>
        </div>
        {selectedItems.length > 0 && getActionButton()}
      </div>

      {/* Bulk Action Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description || `You are about to ${actionType} ${selectedItems.length} item(s).`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Comments (Optional)</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add comments for this bulk action..."
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={processing}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm ${actionType === 'approve' ? 'Approval' : actionType === 'reject' ? 'Rejection' : 'Action'}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Items with checkboxes */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              checked={selectedItems.includes(item.id)}
              onCheckedChange={() => handleToggle(item.id)}
            />
            <div className="flex-1">
              {/* Render item content - this will be customized per use case */}
              {(item as any).title && <p className="font-semibold">{(item as any).title}</p>}
              {(item as any).description && (
                <p className="text-sm text-muted-foreground">{(item as any).description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

