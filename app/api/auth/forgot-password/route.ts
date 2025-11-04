import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  parseRequestBody, 
  validateEmail, 
  sanitizeEmail,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  getClientIP
} from '@/lib/api-utils'
import { rateLimitMiddleware } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 requests per 15 minutes per IP
    const rateLimit = rateLimitMiddleware(5, 15 * 60 * 1000)
    const rateLimitResult = rateLimit(request, getClientIP(request))
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response as NextResponse
    }

    // Parse and validate request body
    const { data: body, error: parseError } = await parseRequestBody(request)
    if (parseError || !body) {
      return createErrorResponse(parseError || 'Invalid request body', 400)
    }

    const { email } = body

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return createErrorResponse(emailValidation.error || 'Invalid email', 400)
    }

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email)

    // Create admin client to access database
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user exists
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('email', sanitizedEmail)
      .eq('is_active', true)
      .single()

    // We still create a request even if user doesn't exist (for security)
    // but we'll include user info if found
    const resetRequest = {
      user_id: userData?.id || null,
      user_email: sanitizedEmail,
      user_name: userData?.name || null,
      status: 'pending',
    }

    // Insert password reset request
    const { data: requestData, error: insertError } = await supabaseAdmin
      .from('password_reset_requests')
      .insert(resetRequest)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating password reset request:', insertError)
      return createErrorResponse(
        'Failed to create password reset request',
        500,
        undefined,
        'DATABASE_ERROR'
      )
    }

    // The trigger will automatically notify admins
    // So we just return success
    return createSuccessResponse(
      { requestId: requestData.id },
      'Password reset request submitted successfully. An administrator will process it shortly.'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

