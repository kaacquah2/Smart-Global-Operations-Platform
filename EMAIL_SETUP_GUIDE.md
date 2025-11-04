# Email Credentials Setup Guide

## ✅ Implementation Status

**Email functionality is now implemented!** When an admin creates a new employee, they will automatically receive login credentials via email.

## 📧 How It Works

1. **Admin creates employee** via `/admin/employees/create`
2. **System generates** a secure 12-character temporary password
3. **Auth user is created** in Supabase
4. **User profile is created** in the database
5. **Email is sent** automatically with login credentials

## 🚀 Setup Options

### Option 1: Resend (Recommended for Production)

Resend is a modern email API that's easy to integrate and has a generous free tier.

#### 1. Install Resend
```bash
npm install resend
```

#### 2. Get API Key
1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your domain (or use their test domain for development)

#### 3. Configure Environment Variables
Add to your `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### 4. That's it!
The system will automatically use Resend to send emails.

---

### Option 2: SendGrid

#### 1. Install SendGrid
```bash
npm install @sendgrid/mail
```

#### 2. Update `app/api/send-credentials/route.ts`

Replace the Resend section with:
```typescript
import sgMail from '@sendgrid/mail'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL || 'noreply@sgoap.com',
    subject: 'Welcome to SGOAP - Your Login Credentials',
    html: `...` // Same HTML template
  }
  
  await sgMail.send(msg)
}
```

#### 3. Configure Environment Variables
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

---

### Option 3: Supabase Email Templates (Free, but Limited)

Supabase has built-in email templates, but customization is limited.

#### 1. Configure in Supabase Dashboard
1. Go to **Authentication** > **Email Templates**
2. Customize the "Magic Link" template (or create custom)
3. Set up SMTP in **Settings** > **Auth** > **SMTP Settings**

#### 2. Update Implementation
The current implementation will fall back to console logging if no email service is configured.

---

### Option 4: Development Mode (No Email Service)

If you don't configure an email service, the system will:
- ✅ Still create the employee successfully
- ✅ Log credentials to console (server logs)
- ⚠️ **NOT send actual emails**

**Console Output:**
```
📧 === EMPLOYEE CREDENTIALS (DEVELOPMENT MODE) ===
To: employee@example.com
Name: John Doe
Email: employee@example.com
Password: Abc123!@#xyz
Login URL: http://localhost:3000/auth/login
================================================
```

---

## 🔐 Password Requirements

The generated temporary password:
- ✅ 12 characters long
- ✅ Contains uppercase letters
- ✅ Contains lowercase letters
- ✅ Contains numbers
- ✅ Contains special characters (!@#$%^&*)
- ✅ Meets security requirements

**Important:** Users should change their password on first login!

---

## 📝 Email Template

The email includes:
- ✅ Welcome message
- ✅ Employee's name
- ✅ Email address
- ✅ Temporary password (clearly displayed)
- ✅ Security warning to change password
- ✅ Direct login link
- ✅ Professional styling

---

## 🔧 API Routes Created

### 1. `/api/admin/create-user`
- **Purpose:** Creates auth user using Supabase Admin API
- **Method:** POST
- **Authentication:** Requires service role key
- **Body:** `{ email, password, name }`

### 2. `/api/send-credentials`
- **Purpose:** Sends credentials email to new employee
- **Method:** POST
- **Body:** `{ email, name, tempPassword }`

---

## 🛡️ Security Notes

1. **Service Role Key**: Keep `SUPABASE_SERVICE_ROLE_KEY` secure and never expose it to the client
2. **Email Failures**: Employee creation won't fail if email sending fails (logged for admin review)
3. **Password Storage**: Temporary passwords are never stored - only sent via email
4. **First Login**: Users should be prompted to change password on first login (to be implemented)

---

## ✅ Testing

### Test Employee Creation:

1. **As Admin:**
   - Go to `/admin/employees/create`
   - Fill in employee details
   - Submit form

2. **Check:**
   - ✅ Employee appears in employee list
   - ✅ Email received (if service configured)
   - ✅ Console logs credentials (if no service)
   - ✅ User can login with provided credentials

---

## 🐛 Troubleshooting

### Email Not Sending?

1. **Check environment variables:**
   ```bash
   echo $RESEND_API_KEY  # or SENDGRID_API_KEY
   ```

2. **Check server logs:**
   - Look for email service errors
   - Check if credentials are logged to console

3. **Verify email service:**
   - Resend: Check dashboard for sent emails
   - SendGrid: Check Activity Feed

4. **Test API route:**
   ```bash
   curl -X POST http://localhost:3000/api/send-credentials \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User","tempPassword":"Test123!@#"}'
   ```

---

## 📈 Next Steps

1. **Implement password change on first login**
   - Detect first login
   - Force password change
   - Update password in Supabase

2. **Add email preferences**
   - Allow users to manage notification preferences
   - Unsubscribe options

3. **Email queue system**
   - Queue failed emails for retry
   - Track email delivery status

4. **Email templates customization**
   - Admin panel to customize templates
   - Multi-language support

---

**The email functionality is ready to use once you configure an email service!** 🎉

