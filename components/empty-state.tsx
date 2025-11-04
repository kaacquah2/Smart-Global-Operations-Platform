"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  actionHref
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {Icon && (
          <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {description && (
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            {description}
          </p>
        )}
        {(action || actionLabel) && (
          <div className="mt-4">
            {action && (
              <Button onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            {actionLabel && actionHref && (
              <Button asChild>
                <a href={actionHref}>{actionLabel}</a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

