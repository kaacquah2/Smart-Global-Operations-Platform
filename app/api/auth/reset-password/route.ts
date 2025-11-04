import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { APP_NAME, APP_FULL_NAME } from '@/lib/constants'
import { getLoginUrl } from '@/lib/url-utils'
import { 
  parseRequestBody, 
  validateRequiredFields,
  validateUUID,
  sanitizeString,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  getClientIP
} from '@/lib/api-utils'
import { rateLimitMiddleware } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Generates a password based on user initials and year joined
 * Format: Initials(2) + Year(4) + SpecialChar(1) + Number(1)
 * Example: "JS2024!3" for John Smith joined in 2024
 * 
 * @param name - User's full name (used to extract initials)
 * @param hireDate - User's hire date (used to extract year)
 * @returns Generated password string
 */
function generatePasswordFromUserInfo(name: string | null, hireDate: string | null): string {
  // Extract initials from name
  let initials = ''
  if (name) {
    const nameParts = name.trim().split(/\s+/)
    if (nameParts.length >= 2) {
      // First and last name initials
      initials = (nameParts[0][0] || '').toUpperCase() + (nameParts[nameParts.length - 1][0] || '').toUpperCase()
    } else if (nameParts.length === 1) {
      // Single name - use first two characters
      initials = nameParts[0].substring(0, 2).toUpperCase()
    }
  }
  
  // If no initials extracted, use default
  if (!initials || initials.length < 2) {
    initials = 'US' // Default initials
  }
  
  // Extract year from hire_date
  let year = ''
  if (hireDate) {
    const date = new Date(hireDate)
    if (!isNaN(date.getTime())) {
      year = date.getFullYear().toString()
    }
  }
  
  // If no year, use current year
  if (!year) {
    year = new Date().getFullYear().toString()
  }
  
  // Format: Initials + Year + SpecialChar + Number
  // Example: JS2024!1 or AB2023@5
  const specialChars = '!@#$%^&*'
  const specialChar = specialChars[Math.floor(Math.random() * specialChars.length)]
  const randomNum = Math.floor(Math.random() * 10)
  
  // Ensure password meets security requirements: Initials(2) + Year(4) + Special(1) + Number(1) = 8+ chars
  const password = `${initials}${year}${specialChar}${randomNum}`
  
  return password
}

/**
 * Sends password reset email to user
 * Tries Supabase Edge Function first, falls back to direct Resend API
 * 
 * @param email - User's email address
 * @param name - User's name for personalization
 * @param newPassword - The newly generated password
 * @param loginUrl - URL to login page
 * @returns Result object with success status and message ID
 */
async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  newPassword: string,
  loginUrl: string
) {
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'
  
  // Build email HTML
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset - ${APP_NAME}</h1>
          <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">${APP_FULL_NAME}</p>
        </div>
        <div class="content">
          <p>Hello ${name || 'User'},</p>
          <p>Your password has been reset by an administrator. Your new password is based on your initials and year joined for easy remembrance.</p>
          
          <div class="credentials">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>New Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 16px; font-weight: bold; letter-spacing: 1px;">${newPassword}</code></p>
            <p style="margin-top: 10px; font-size: 12px; color: #666;"><em>Format: Your Initials + Year Joined + Special Character + Number</em></p>
          </div>
          
          <div class="warning">
            <strong>🔐 Security Notice:</strong> 
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Please change your password immediately after logging in for security purposes</li>
              <li>Use a strong, unique password that you haven't used elsewhere</li>
              <li>Do not share your password with anyone</li>
            </ul>
          </div>
          
          <p>You can access the system by clicking the button below:</p>
          <a href="${loginUrl}" class="button">Login to ${APP_NAME}</a>
          
          <p>If you did not request this password reset, please contact your administrator immediately.</p>
          
          <p>Best regards,<br>${APP_NAME} Team</p>
        </div>
      </div>
    </body>
    </html>
  `

  const emailText = `
Password Reset - ${APP_NAME}
${APP_FULL_NAME}

Hello ${name || 'User'},

Your password has been reset by an administrator. Your new password is based on your initials and year joined for easy remembrance.

Email: ${email}
New Password: ${newPassword}

Password Format: Your Initials + Year Joined + Special Character + Number

🔐 Security Notice:
- Please change your password immediately after logging in for security purposes
- Use a strong, unique password that you haven't used elsewhere
- Do not share your password with anyone

You can access the system by visiting:
${loginUrl}

If you did not request this password reset, please contact your administrator immediately.

Best regards,
${APP_NAME} Team
  `

  // Try Supabase Edge Function first
  try {
    console.log(`📧 Attempting to send password reset email via Edge Function (resend-email) to: ${email}`)
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: edgeData, error: edgeError } = await supabaseAdmin.functions.invoke('resend-email', {
      body: {
        to: email,
        subject: `Password Reset - ${APP_NAME}`,
        html: emailHtml,
        text: emailText,
        from: fromEmail,
      },
    })

    if (!edgeError && edgeData?.success) {
      console.log(`✅ Password reset email sent successfully via Edge Function (resend-email) to ${email}`)
      console.log(`Message ID: ${edgeData.data?.id}`)
      return { success: true, messageId: edgeData.data?.id, method: 'edge-function' }
    }

    // If Edge Function failed, log but continue to direct Resend fallback
    if (edgeError) {
      console.warn('⚠️ Edge Function (resend-email) failed, trying direct Resend:', edgeError.message)
      console.warn('Edge Function error details:', edgeError)
    }
  } catch (edgeError: any) {
    console.warn('⚠️ Edge Function (resend-email) not available or failed, trying direct Resend:', edgeError?.message)
  }

  // Fallback to direct Resend
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY is not set in environment variables')
    console.log('\n📧 === PASSWORD RESET CREDENTIALS (EMAIL NOT SENT - NO API KEY) ===')
    console.log(`To: ${email}`)
    console.log(`Name: ${name || 'User'}`)
    console.log(`New Password: ${newPassword}`)
    console.log(`Login URL: ${loginUrl}`)
    console.log('================================================\n')
    return { 
      success: false, 
      error: 'Email service not configured. RESEND_API_KEY is missing and Edge Function is not available.' 
    }
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)
    
    console.log(`📧 Attempting to send password reset email via direct Resend to: ${email}`)
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Password Reset - ${APP_NAME}`,
      html: emailHtml,
      text: emailText,
    })
    
    if (error) {
      console.error('❌ Resend email error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Check for domain verification error
      if (error.message?.includes('verify a domain') || error.message?.includes('testing emails')) {
        return {
          success: false,
          error: 'Domain verification required. Resend test domain only allows sending to your account email.',
          details: error,
          requiresDomainVerification: true,
          accountEmail: 'elsablankson5252@gmail.com',
          helpUrl: 'https://resend.com/domains'
        }
      }
      
      return { 
        success: false, 
        error: error.message || 'Failed to send email via Resend',
        details: error 
      }
    }
    
    console.log(`✅ Password reset email sent successfully via direct Resend to ${email}`)
    console.log(`Message ID: ${data?.id}`)
    
    return { success: true, messageId: data?.id, method: 'direct-resend' }
  } catch (error: any) {
    console.error('❌ Failed to send email via Resend:', error)
    console.error('Error stack:', error?.stack)
    return { 
      success: false, 
      error: error?.message || 'Failed to send email',
      details: error?.toString() 
    }
  }
}

/**
 * POST /api/auth/reset-password
 * 
 * Processes a password reset request from admin
 * 
 * Request body:
 * - requestId: UUID of the password reset request
 * - processedBy: UUID of the admin processing the request
 * 
 * @param request - Next.js request object
 * @returns JSON response with success status and email details
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/auth/reset-password', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     requestId: 'uuid-here',
 *     processedBy: 'admin-uuid-here'
 *   })
 * })
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 requests per 15 minutes per IP
    const rateLimit = rateLimitMiddleware(5, 15 * 60 * 1000)
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
    const requiredValidation = validateRequiredFields(body, ['requestId', 'processedBy'])
    if (!requiredValidation.isValid) {
      return createErrorResponse(
        'Missing required fields',
        400,
        requiredValidation.errors
      )
    }

    const { requestId, processedBy } = body

    // Validate UUIDs
    const requestIdValidation = validateUUID(requestId)
    if (!requestIdValidation.isValid) {
      return createErrorResponse('Invalid request ID format', 400)
    }

    const processedByValidation = validateUUID(processedBy)
    if (!processedByValidation.isValid) {
      return createErrorResponse('Invalid processed by ID format', 400)
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get the password reset request with user details
    const { data: resetRequest, error: fetchError } = await supabaseAdmin
      .from('password_reset_requests')
      .select('*, users:user_id(id, name, email, hire_date)')
      .eq('id', requestId)
      .single()

    if (fetchError || !resetRequest) {
      return createErrorResponse(
        'Password reset request not found',
        404,
        undefined,
        'NOT_FOUND'
      )
    }

    if (resetRequest.status !== 'pending') {
      return createErrorResponse(
        'This request has already been processed',
        400,
        undefined,
        'ALREADY_PROCESSED'
      )
    }

    // Get user details for password generation
    let userNameForPassword: string | null = resetRequest.user_name || null
    let userHireDate: string | null = null
    
    // Try to get user details from the joined user data or fetch separately
    if (resetRequest.user_id) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('name, hire_date')
        .eq('id', resetRequest.user_id)
        .single()
      
      if (!userError && userData) {
        userNameForPassword = userData.name || userNameForPassword
        userHireDate = userData.hire_date || null
      }
    }
    
    // Fallback to user name from reset request
    if (!userNameForPassword) {
      userNameForPassword = resetRequest.user_name || (resetRequest.users as any)?.name || null
    }

    // Generate new password based on user initials and year joined
    const newPassword = generatePasswordFromUserInfo(userNameForPassword, userHireDate)

    // Update user password in Supabase Auth (only if user_id exists)
    if (resetRequest.user_id) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        resetRequest.user_id,
        { password: newPassword }
      )

      if (authError) {
        console.error('Error updating password:', authError)
        return createErrorResponse(
          'Failed to update password. User may not exist in auth system.',
          500,
          undefined,
          'AUTH_ERROR'
        )
      }
    } else {
      // If no user_id, try to find user by email
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', resetRequest.user_email)
        .eq('is_active', true)
        .single()

      if (userData?.id) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          userData.id,
          { password: newPassword }
        )

        if (authError) {
          console.error('Error updating password:', authError)
          return createErrorResponse(
            'Failed to update password',
            500,
            undefined,
            'AUTH_ERROR'
          )
        }
      } else {
        return createErrorResponse(
          'User not found in the system',
          404,
          undefined,
          'NOT_FOUND'
        )
      }
    }

    // Update the request status
    const { error: updateError } = await supabaseAdmin
      .from('password_reset_requests')
      .update({
        status: 'completed',
        processed_by: processedBy,
        processed_at: new Date().toISOString(),
        new_password: newPassword, // Temporarily store for email
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error updating request:', updateError)
      return createErrorResponse(
        'Failed to update request status',
        500,
        undefined,
        'DATABASE_ERROR'
      )
    }

    // Send email with new password
    const loginUrl = getLoginUrl(request)
    const userName = resetRequest.user_name || (resetRequest.users as any)?.name || null
    const userEmail = resetRequest.user_email

    const emailResult = await sendPasswordResetEmail(
      userEmail,
      userName,
      newPassword,
      loginUrl
    )

    // Clear the password from database after sending (for security)
    setTimeout(async () => {
      await supabaseAdmin
        .from('password_reset_requests')
        .update({ new_password: null })
        .eq('id', requestId)
    }, 5000) // Clear after 5 seconds

    if (!emailResult.success) {
      // Password was updated but email failed - return error so admin knows
      console.error('❌ Password reset completed but email failed:', emailResult.error)
      console.error('Email error details:', emailResult.details)
      
      // Check if it's a domain verification issue
      if (emailResult.requiresDomainVerification) {
        return NextResponse.json({
          success: false,
          error: 'Domain verification required',
          message: `Password was reset successfully, but email failed: ${emailResult.error}`,
          emailSent: false,
          emailError: emailResult.error,
          requiresDomainVerification: true,
          helpUrl: emailResult.helpUrl,
          accountEmail: emailResult.accountEmail,
          newPassword: newPassword,
          warning: 'To send emails to other recipients, please verify a domain at resend.com/domains. For now, you can manually send the password to the user.'
        }, { status: 200 }) // Still 200 because password was reset
      }
      
      return NextResponse.json({
        success: false,
        error: 'Password was reset successfully, but email could not be sent.',
        message: `Password reset completed, but email failed: ${emailResult.error}`,
        emailSent: false,
        emailError: emailResult.error,
        newPassword: newPassword,
        warning: 'Please manually send the password to the user via email or other secure method.'
      }, { status: 200 }) // Still 200 because password was reset
    }

    return createSuccessResponse(
      { 
        emailSent: true,
        messageId: emailResult.messageId 
      },
      'Password reset completed successfully. New password has been sent via email.'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

