import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { APP_NAME, APP_FULL_NAME } from '@/lib/constants'

// Generate a secure temporary password
function generateTemporaryPassword(): string {
  // Generate a random 12-character password
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one of each required type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)] // uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)] // lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)] // number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)] // special
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Email sending function (using Supabase or external service)
async function sendCredentialsEmail(
  email: string,
  name: string,
  tempPassword: string,
  loginUrl: string
) {
  // Option 1: Use Resend (recommended)
  // You'll need to install: npm install resend
  // And set RESEND_API_KEY in your .env.local
  
  if (process.env.RESEND_API_KEY) {
    try {
      // @ts-ignore - Optional dependency
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: `Welcome to ${APP_NAME} - Your Login Credentials`,
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
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to ${APP_NAME}!</h1>
                <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">${APP_FULL_NAME}</p>
              </div>
              <div class="content">
                <p>Hello ${name},</p>
                <p>Your employee account has been created successfully. Below are your login credentials:</p>
                
                <div class="credentials">
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${tempPassword}</code></p>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> Please change your password immediately after your first login for security purposes.
                </div>
                
                <p>You can access the system by clicking the button below:</p>
                <a href="${loginUrl}" class="button">Login to ${APP_NAME}</a>
                
                <p>If you have any questions or need assistance, please contact your administrator or the IT department.</p>
                
                <p>Best regards,<br>${APP_NAME} Team</p>
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
  // In production, you should use a proper email service
  console.log('\n📧 === EMPLOYEE CREDENTIALS (DEVELOPMENT MODE) ===')
  console.log(`To: ${email}`)
  console.log(`Name: ${name}`)
  console.log(`Email: ${email}`)
  console.log(`Password: ${tempPassword}`)
  console.log(`Login URL: ${loginUrl}`)
  console.log('================================================\n')
  
  return { success: true, messageId: 'logged-to-console' }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, tempPassword } = body
    
    if (!email || !name || !tempPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`
    
    const result = await sendCredentialsEmail(email, name, tempPassword, loginUrl)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Credentials email sent successfully',
      messageId: result.messageId 
    })
  } catch (error) {
    console.error('Error in send-credentials route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

