# Forgot Password Feature Implementation

## Overview

The forgot password feature allows users to request password resets through an admin-controlled process. When a user requests a password reset, administrators are notified and can process the request, generating a new password and sending it via email.

## Setup Instructions

### 1. Database Setup

Run the SQL migration file to create the password reset requests table:

```sql
-- Run this file in Supabase SQL Editor
supabase-password-reset.sql
```

This creates:
- `password_reset_requests` table
- Row Level Security policies
- Automatic notification trigger for admins
- Indexes for performance

### 2. How It Works

#### User Flow:
1. User clicks "Forgot?" on the login page
2. User enters their email address
3. A password reset request is created
4. Admins receive notifications automatically
5. Admin processes the request
6. New password is generated and sent via email
7. User receives email with new password

#### Admin Flow:
1. Admin receives notification about password reset request
2. Admin navigates to `/admin/password-resets`
3. Admin views all pending requests
4. Admin clicks "Process Request" on a pending request
5. System generates new password and updates user account
6. Email is sent to user with new password
7. Request status changes to "completed"

## Files Created/Modified

### New Files:
- `supabase-password-reset.sql` - Database schema and triggers
- `app/api/auth/forgot-password/route.ts` - API endpoint for submitting requests
- `app/api/auth/reset-password/route.ts` - API endpoint for processing requests
- `app/admin/password-resets/page.tsx` - Admin interface for managing requests

### Modified Files:
- `app/auth/login/page.tsx` - Added forgot password dialog
- `app/admin/dashboard/page.tsx` - Added link to password reset management

## API Endpoints

### POST `/api/auth/forgot-password`
Submits a password reset request.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset request submitted successfully...",
  "requestId": "uuid"
}
```

### POST `/api/auth/reset-password`
Processes a password reset request (admin only).

**Request Body:**
```json
{
  "requestId": "uuid",
  "processedBy": "admin-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset completed successfully...",
  "emailSent": true
}
```

## Admin Interface

Access the password reset management page at:
- **URL:** `/admin/password-resets`
- **Access:** Admin, Executive, and CEO roles only

### Features:
- View all password reset requests
- Filter by status (pending, completed, cancelled)
- See statistics (total, pending, completed, cancelled)
- Process pending requests with one click
- View request details (user, email, timestamps)

## Notifications

When a password reset request is created:
- All admins receive a notification automatically
- Notification type: `alert`
- Title: "Password Reset Request"
- Description includes user name and email

## Email Configuration

The system uses the same email service as employee creation:
- **Resend** (recommended) - Set `RESEND_API_KEY` in `.env.local`
- **Development Mode** - Credentials logged to console if no email service configured

Email template includes:
- Welcome message
- New password (clearly displayed)
- Security warning to change password
- Direct login link

## Security Features

1. **Password Storage**: New passwords are temporarily stored in the database but cleared after 24 hours
2. **Request Tracking**: All requests are logged with timestamps and admin who processed them
3. **Status Management**: Requests can only be processed once
4. **User Verification**: System verifies user exists before processing
5. **Email Verification**: Only emails matching active users are processed

## Database Schema

```sql
password_reset_requests
├── id (UUID, Primary Key)
├── user_id (UUID, FK to users)
├── user_email (TEXT, Required)
├── user_name (TEXT, Optional)
├── status (TEXT: pending|processing|completed|cancelled)
├── requested_at (TIMESTAMPTZ)
├── processed_by (UUID, FK to users)
├── processed_at (TIMESTAMPTZ)
├── new_password (TEXT, Temporary - cleared after 24h)
├── notes (TEXT, Optional)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

## Usage Example

1. **User requests password reset:**
   - Goes to login page
   - Clicks "Forgot?"
   - Enters email: `employee@company.com`
   - Submits request

2. **Admin receives notification:**
   - Sees notification: "Password Reset Request"
   - Clicks notification or navigates to `/admin/password-resets`

3. **Admin processes request:**
   - Sees pending request for `employee@company.com`
   - Clicks "Process Request"
   - Confirms action
   - System generates new password: `Abc123!@#xyz`
   - Password updated in Supabase Auth
   - Email sent to user

4. **User receives email:**
   - Subject: "Password Reset - SGOAP"
   - Contains new password
   - Can login immediately
   - Prompted to change password

## Troubleshooting

### Request not appearing:
- Check if SQL migration was run
- Verify RLS policies are enabled
- Check admin role permissions

### Email not sending:
- Verify `RESEND_API_KEY` is set in `.env.local`
- Check console logs for email errors
- In development mode, check server console for credentials

### Password update fails:
- Verify user exists in Supabase Auth
- Check that user_id matches between tables
- Verify service role key has proper permissions

## Future Enhancements

Potential improvements:
- Add request cancellation option
- Add bulk processing
- Add request expiration (auto-cancel after X days)
- Add email templates customization
- Add request history/audit log
- Add user self-service option (optional)

