/**
 * Email Template System
 * Centralized email templates for consistent styling and content
 */

import { APP_NAME, APP_FULL_NAME } from '@/lib/constants'

export interface EmailTemplateProps {
  title: string
  content: string
  buttonText?: string
  buttonUrl?: string
  footer?: string
}

/**
 * Base email template with consistent styling
 */
export function getEmailTemplate(props: EmailTemplateProps): string {
  const {
    title,
    content,
    buttonText,
    buttonUrl,
    footer = `Best regards,<br>${APP_NAME} Team`,
  } = props

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      background: #ffffff;
    }
    .content p {
      margin: 0 0 16px 0;
      color: #555;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      font-size: 16px;
      transition: background 0.3s;
    }
    .button:hover {
      background: #5568d3;
    }
    .footer {
      padding: 30px;
      background: #f9f9f9;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info {
      background: #d1ecf1;
      border-left: 4px solid #17a2b8;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .success {
      background: #d4edda;
      border-left: 4px solid #28a745;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        padding: 10px;
      }
      .header, .content, .footer {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-wrapper">
      <div class="header">
        <h1>${title}</h1>
        <p>${APP_FULL_NAME}</p>
      </div>
      <div class="content">
        ${content}
        ${buttonText && buttonUrl ? `
          <div class="button-container">
            <a href="${buttonUrl}" class="button">${buttonText}</a>
          </div>
        ` : ''}
      </div>
      <div class="footer">
        ${footer}
        <p style="margin-top: 10px; font-size: 12px; color: #999;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Password reset email template
 */
export function getPasswordResetEmailTemplate(data: {
  name: string
  email: string
  newPassword: string
  loginUrl: string
}): string {
  const content = `
    <p>Hello ${data.name || 'User'},</p>
    <p>Your password has been reset by an administrator. Your new password is based on your initials and year joined for easy remembrance.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${data.email}</p>
      <p style="margin: 0 0 10px 0;"><strong>New Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 16px; font-weight: bold; letter-spacing: 1px;">${data.newPassword}</code></p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;"><em>Format: Your Initials + Year Joined + Special Character + Number</em></p>
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
    
    <p style="margin-top: 20px;">If you did not request this password reset, please contact your administrator immediately.</p>
  `

  return getEmailTemplate({
    title: 'Password Reset',
    content,
    buttonText: `Login to ${APP_NAME}`,
    buttonUrl: data.loginUrl,
  })
}

/**
 * Welcome email template
 */
export function getWelcomeEmailTemplate(data: {
  name: string
  email: string
  tempPassword: string
  loginUrl: string
}): string {
  const content = `
    <p>Hello ${data.name},</p>
    <p>Welcome to ${APP_NAME}! Your account has been created successfully.</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${data.email}</p>
      <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 16px; font-weight: bold; letter-spacing: 1px;">${data.tempPassword}</code></p>
    </div>
    
    <div class="info">
      <strong>📋 Next Steps:</strong>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Log in with your email and temporary password</li>
        <li>Change your password to something secure</li>
        <li>Complete your profile</li>
        <li>Explore the platform features</li>
      </ul>
    </div>
    
    <p>Click the button below to get started:</p>
  `

  return getEmailTemplate({
    title: 'Welcome to ' + APP_NAME,
    content,
    buttonText: 'Get Started',
    buttonUrl: data.loginUrl,
  })
}

/**
 * Notification email template
 */
export function getNotificationEmailTemplate(data: {
  name: string
  title: string
  message: string
  actionUrl?: string
  actionText?: string
}): string {
  const content = `
    <p>Hello ${data.name},</p>
    <p>${data.message}</p>
  `

  return getEmailTemplate({
    title: data.title,
    content,
    buttonText: data.actionText,
    buttonUrl: data.actionUrl,
  })
}

/**
 * Plain text version generator
 */
export function getPlainTextEmail(content: string): string {
  // Remove HTML tags and convert to plain text
  return content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
}

