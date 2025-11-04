import { NextRequest, NextResponse } from 'next/server'
import { APP_NAME, APP_FULL_NAME } from '@/lib/constants'
import { getLoginUrl } from '@/lib/url-utils'
import { 
  parseRequestBody, 
  validateRequiredFields,
  validateEmail,
  sanitizeEmail,
  sanitizeString,
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  getClientIP
} from '@/lib/api-utils'
import { rateLimitMiddleware } from '@/lib/rate-limit'

// Email sending function for password reset notification
async function sendPasswordResetNotificationEmail(
  email: string,
  name: string,
  loginUrl: string
) {
  // Option 1: Use Resend (recommended)
  if (process.env.RESEND_API_KEY) {
    try {
      // @ts-ignore - Optional dependency
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: `Password Reset Required - ${APP_NAME}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Required</h1>
                <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">${APP_FULL_NAME}</p>
              </div>
              <div class="content">
                <p>Hello ${name},</p>
                <p>As part of our security policy, you are required to reset your password.</p>
                
                <div class="warning">
                  <strong>⚠️ Action Required:</strong> You must reset your password before you can access your account again.
                </div>
                
                <p>Please click the button below to reset your password:</p>
                <a href="${loginUrl}" class="button">Reset Password</a>
                
                <p>If you have any questions or need assistance, please contact your administrator or the IT department.</p>
                
                <p>Best regards,<br>${APP_NAME} Security Team</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
      
      if (error) {
        console.error('Resend email error:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true, messageId: data?.id }
    } catch (error) {
      console.error('Failed to send email via Resend:', error)
      return { success: false, error: 'Email service not configured' }
    }
  }
  
  // Option 2: Fallback - Log notification (for development)
  console.log('\n📧 === PASSWORD RESET NOTIFICATION (DEVELOPMENT MODE) ===')
  console.log(`To: ${email}`)
  console.log(`Name: ${name}`)
  console.log(`Password reset required`)
  console.log(`Login URL: ${loginUrl}`)
  console.log('================================================\n')
  
  return { success: true, messageId: 'logged-to-console' }
}

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
    const requiredValidation = validateRequiredFields(body, ['email', 'name'])
    if (!requiredValidation.isValid) {
      return createErrorResponse(
        'Missing required fields',
        400,
        requiredValidation.errors
      )
    }

    const { email, name } = body

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return createErrorResponse(emailValidation.error || 'Invalid email', 400)
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email)
    const sanitizedName = sanitizeString(name)
    
    const loginUrl = getLoginUrl(request)
    
    const result = await sendPasswordResetNotificationEmail(
      sanitizedEmail, 
      sanitizedName, 
      loginUrl
    )
    
    if (!result.success) {
      return createErrorResponse(
        result.error || 'Failed to send email',
        500,
        undefined,
        'EMAIL_ERROR'
      )
    }
    
    return createSuccessResponse(
      { messageId: result.messageId },
      'Password reset notification sent successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

