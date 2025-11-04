import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Trigger password reset for all users
export async function POST(request: NextRequest) {
  try {
    // Get all active users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('is_active', true)

    if (fetchError) {
      return createErrorResponse('Failed to fetch users', 500)
    }

    if (!users || users.length === 0) {
      return createSuccessResponse({ count: 0, message: 'No active users found' })
    }

    let resetCount = 0
    const errors: string[] = []

    // Set password reset flag for each user
    // In a real implementation, you'd:
    // 1. Set a flag in auth.users metadata indicating password reset required
    // 2. Send email notifications
    // 3. Force password change on next login

    for (const user of users) {
      try {
        // Update user metadata to require password reset
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          user_metadata: {
            require_password_reset: true,
            password_reset_date: new Date().toISOString(),
          },
        })

        if (updateError) {
          errors.push(`Failed to update ${user.email}: ${updateError.message}`)
        } else {
          resetCount++

          // Send notification email (optional)
          try {
            await fetch('/api/send-password-reset-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
              }),
            })
          } catch (emailError) {
            console.error(`Failed to send email to ${user.email}:`, emailError)
            // Don't fail the whole operation if email fails
          }
        }
      } catch (err) {
        errors.push(`Error processing ${user.email}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    // Update settings to record last reset date
    const { data: settingsData } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'password_reset_settings')
      .maybeSingle()

    if (settingsData?.value) {
      try {
        // Handle JSONB (PostgreSQL returns it as object) or JSON string
        let settings = settingsData.value
        if (typeof settingsData.value === 'string') {
          settings = JSON.parse(settingsData.value)
        }

        const nextResetDate = calculateNextResetDate(settings.frequency || 'quarterly')

        await supabase
          .from('admin_settings')
          .update({
            value: {
              ...settings,
              lastResetDate: new Date().toISOString(),
              nextResetDate,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'password_reset_settings')
      } catch (e) {
        console.error('Failed to update settings:', e)
      }
    }

    return createSuccessResponse({
      count: resetCount,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Password reset triggered for ${resetCount} users`,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

function calculateNextResetDate(frequency: string): string {
  const today = new Date()
  let nextDate = new Date(today)

  switch (frequency) {
    case 'quarterly':
      nextDate.setMonth(today.getMonth() + 3)
      break
    case 'monthly':
      nextDate.setMonth(today.getMonth() + 1)
      break
    case 'bi-monthly':
      nextDate.setMonth(today.getMonth() + 2)
      break
    case 'yearly':
      nextDate.setFullYear(today.getFullYear() + 1)
      break
    default:
      return ''
  }

  return nextDate.toISOString().split('T')[0]
}

