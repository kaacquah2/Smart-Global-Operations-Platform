import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createErrorResponse, createSuccessResponse, handleApiError } from '@/lib/api-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get password reset settings
export async function GET(request: NextRequest) {
  try {
    // For now, store settings in a simple table or use environment variables
    // In production, you'd want a dedicated settings table
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('key', 'password_reset_settings')
      .maybeSingle()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching settings:', error)
    }

    const defaultSettings = {
      enabled: true,
      frequency: 'quarterly',
      nextResetDate: null,
      lastResetDate: null,
      notifyUsers: true,
      daysBeforeNotification: 7,
    }

    if (data?.value) {
      try {
        // Handle JSONB (PostgreSQL returns it as object) or JSON string
        let parsed = data.value
        if (typeof data.value === 'string') {
          parsed = JSON.parse(data.value)
        }
        return createSuccessResponse({ settings: { ...defaultSettings, ...parsed } })
      } catch (e) {
        console.error('Error parsing settings:', e)
        return createSuccessResponse({ settings: defaultSettings })
      }
    }

    return createSuccessResponse({ settings: defaultSettings })
  } catch (error) {
    return handleApiError(error)
  }
}

// Save password reset settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Try to insert or update settings
    const { data: existing, error: fetchError } = await supabase
      .from('admin_settings')
      .select('id')
      .eq('key', 'password_reset_settings')
      .maybeSingle()

    // If fetch error and it's a table not found error, guide user to run migration
    if (fetchError && fetchError.code === '42P01') {
      return createErrorResponse(
        'Settings table not found. Please run the migration: supabase-admin-settings-migration.sql',
        500
      )
    }

    const settingsData = {
      key: 'password_reset_settings',
      value: body, // PostgreSQL JSONB accepts objects directly
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      // Update existing
      const { error: updateError } = await supabase
        .from('admin_settings')
        .update(settingsData)
        .eq('key', 'password_reset_settings')

      if (updateError) {
        console.error('Update error:', updateError)
        return createErrorResponse('Failed to update settings: ' + updateError.message, 500)
      }
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('admin_settings')
        .insert({
          ...settingsData,
          created_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        // If table doesn't exist, guide user to run migration
        if (insertError.code === '42P01') {
          return createErrorResponse(
            'Settings table not found. Please run the migration: supabase-admin-settings-migration.sql',
            500
          )
        }
        return createErrorResponse('Failed to save settings: ' + insertError.message, 500)
      }
    }

    return createSuccessResponse({ message: 'Settings saved successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}

