import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { APP_NAME, APP_FULL_NAME } from '@/lib/constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Generate a secure temporary password
function generateTemporaryPassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one of each required type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Email sending function
async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  newPassword: string,
  loginUrl: string
) {
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@sgoap.com',
        to: email,
        subject: `Password Reset - ${APP_NAME}`,
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
                <h1>Password Reset - ${APP_NAME}</h1>
                <p style="margin-top: 10px; font-size: 14px; opacity: 0.9;">${APP_FULL_NAME}</p>
              </div>
              <div class="content">
                <p>Hello ${name || 'User'},</p>
                <p>Your password has been reset by an administrator. Below are your new login credentials:</p>
                
                <div class="credentials">
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>New Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${newPassword}</code></p>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> Please change your password immediately after logging in for security purposes.
                </div>
                
                <p>You can access the system by clicking the button below:</p>
                <a href="${loginUrl}" class="button">Login to ${APP_NAME}</a>
                
                <p>If you did not request this password reset, please contact your administrator immediately.</p>
                
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
  
  // Fallback - Log credentials (for development)
  console.log('\n📧 === PASSWORD RESET CREDENTIALS (DEVELOPMENT MODE) ===')
  console.log(`To: ${email}`)
  console.log(`Name: ${name || 'User'}`)
  console.log(`Email: ${email}`)
  console.log(`New Password: ${newPassword}`)
  console.log(`Login URL: ${loginUrl}`)
  console.log('================================================\n')
  
  return { success: true, messageId: 'logged-to-console' }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, processedBy } = body

    if (!requestId || !processedBy) {
      return NextResponse.json(
        { error: 'Request ID and processed by are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Get the password reset request
    const { data: resetRequest, error: fetchError } = await supabaseAdmin
      .from('password_reset_requests')
      .select('*, users:user_id(id, name, email)')
      .eq('id', requestId)
      .single()

    if (fetchError || !resetRequest) {
      return NextResponse.json(
        { error: 'Password reset request not found' },
        { status: 404 }
      )
    }

    if (resetRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      )
    }

    // Generate new password
    const newPassword = generateTemporaryPassword()

    // Update user password in Supabase Auth (only if user_id exists)
    if (resetRequest.user_id) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        resetRequest.user_id,
        { password: newPassword }
      )

      if (authError) {
        console.error('Error updating password:', authError)
        return NextResponse.json(
          { error: 'Failed to update password. User may not exist in auth system.' },
          { status: 500 }
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
          return NextResponse.json(
            { error: 'Failed to update password' },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'User not found in the system' },
          { status: 404 }
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
      return NextResponse.json(
        { error: 'Failed to update request status' },
        { status: 500 }
      )
    }

    // Send email with new password
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`
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
      // Password was updated but email failed - still return success but log warning
      console.warn('Password reset successful but email failed:', emailResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset completed successfully. New password has been sent via email.',
      emailSent: emailResult.success
    })
  } catch (error) {
    console.error('Error in reset-password route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

