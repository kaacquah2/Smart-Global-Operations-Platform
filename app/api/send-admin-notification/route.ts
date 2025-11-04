import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

// Email sending function for admin notification
async function sendAdminNotificationEmail(
  adminEmail: string,
  employeeEmail: string,
  employeeName: string,
  tempPassword: string,
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
        to: adminEmail,
        subject: `New Employee Created: ${employeeName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .info { background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Employee Created</h1>
                <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">${APP_FULL_NAME}</p>
              </div>
              <div class="content">
                <p>Hello Admin,</p>
                <p>A new employee account has been created successfully. Below are the login credentials for your records:</p>
                
                <div class="info">
                  <p><strong>Employee Name:</strong> ${employeeName}</p>
                  <p><strong>Employee Email:</strong> ${employeeEmail}</p>
                </div>
                
                <div class="credentials">
                  <p><strong>Email:</strong> ${employeeEmail}</p>
                  <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${tempPassword}</code></p>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> Please keep these credentials secure. The employee has also received these credentials via email and should change their password on first login.
                </div>
                
                <p>If you need to share these credentials with the employee again, you can view them in the employee management section.</p>
                
                <p>Best regards,<br>${APP_NAME} System</p>
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
  
  // Option 2: Fallback - Log credentials (for development)
  console.log('\n📧 === ADMIN NOTIFICATION (DEVELOPMENT MODE) ===')
  console.log(`To: ${adminEmail}`)
  console.log(`New Employee: ${employeeName}`)
  console.log(`Employee Email: ${employeeEmail}`)
  console.log(`Temporary Password: ${tempPassword}`)
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
    const requiredValidation = validateRequiredFields(body, ['adminEmail', 'employeeEmail', 'employeeName', 'tempPassword'])
    if (!requiredValidation.isValid) {
      return createErrorResponse(
        'Missing required fields',
        400,
        requiredValidation.errors
      )
    }

    const { adminEmail, employeeEmail, employeeName, tempPassword } = body

    // Validate emails
    const adminEmailValidation = validateEmail(adminEmail)
    if (!adminEmailValidation.isValid) {
      return createErrorResponse(adminEmailValidation.error || 'Invalid admin email', 400)
    }

    const employeeEmailValidation = validateEmail(employeeEmail)
    if (!employeeEmailValidation.isValid) {
      return createErrorResponse(employeeEmailValidation.error || 'Invalid employee email', 400)
    }

    // Sanitize inputs
    const sanitizedAdminEmail = sanitizeEmail(adminEmail)
    const sanitizedEmployeeEmail = sanitizeEmail(employeeEmail)
    const sanitizedEmployeeName = sanitizeString(employeeName)
    
    const loginUrl = getLoginUrl(request)
    
    const result = await sendAdminNotificationEmail(
      sanitizedAdminEmail, 
      sanitizedEmployeeEmail, 
      sanitizedEmployeeName, 
      tempPassword, 
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
      'Admin notification email sent successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

