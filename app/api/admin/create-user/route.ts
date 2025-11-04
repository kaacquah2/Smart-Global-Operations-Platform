import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  parseRequestBody, 
  validateRequiredFields,
  validateEmail,
  validatePassword,
  sanitizeEmail,
  sanitizeString,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  getClientIP
} from '@/lib/api-utils'
import { rateLimitMiddleware } from '@/lib/rate-limit'

// This route uses the service role key to create users via Admin API
// Only accessible from server-side

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 10 requests per minute per IP
    const rateLimit = rateLimitMiddleware(10, 60 * 1000)
    const rateLimitResult = rateLimit(request, getClientIP(request))
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response as NextResponse
    }

    // Parse request body
    const { data: body, error: parseError } = await parseRequestBody(request)
    if (parseError || !body) {
      return createErrorResponse(parseError || 'Invalid request body', 400)
    }

    // Validate required fields
    const requiredValidation = validateRequiredFields(body, ['email', 'password'])
    if (!requiredValidation.isValid) {
      return createErrorResponse(
        'Missing required fields',
        400,
        requiredValidation.errors
      )
    }

    const { email, password, name } = body

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return createErrorResponse(emailValidation.error || 'Invalid email', 400)
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return createErrorResponse(passwordValidation.error || 'Invalid password', 400)
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email)
    const sanitizedName = name ? sanitizeString(name) : undefined

    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create user using Admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: sanitizedEmail,
      password: password,
      email_confirm: true, // Auto-confirm email so they can login immediately
      user_metadata: {
        name: sanitizedName,
      },
    })

    if (error) {
      console.error('Error creating auth user:', error)
      return createErrorResponse(
        error.message || 'Failed to create auth user',
        400,
        undefined,
        'AUTH_ERROR'
      )
    }

    if (!data.user) {
      return createErrorResponse(
        'No user data returned',
        500,
        undefined,
        'AUTH_ERROR'
      )
    }

    return createSuccessResponse({
      userId: data.user.id,
      email: data.user.email,
    }, 'User created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

