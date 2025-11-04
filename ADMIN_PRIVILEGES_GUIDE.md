# Admin Privileges & Features Guide

This document outlines all the new admin features and privileges that have been implemented.

## ✅ Implemented Features

### 1. Position Availability Check

**Location:** Employee creation form (`/admin/employees/create`)

**Feature:** 
- Before creating a new employee, the system checks if the position is already filled
- Validates position, department, and branch combination
- Prevents duplicate positions in the same department/branch
- Shows clear error message if position is already taken

**How it works:**
- When an admin tries to create an employee with a position that already exists in the same department and branch, the system will display an error
- The admin must either choose a different position or deactivate the existing employee first

**API:** `lib/supabase/queries.ts` - `isPositionFilled()` function

---

### 2. Enhanced Delete Employee Functionality

**Location:** Employee management page (`/admin/employees`)

**Features:**
- Improved confirmation dialog with employee details
- Shows employee name, email, position, and department before deletion
- Clear indication that employee will be deactivated (not permanently deleted)
- Better error handling and user feedback

**How it works:**
- Click delete button → Modal opens showing employee details
- Admin confirms → Employee is deactivated (`is_active = false`)
- Employee can be reactivated later if needed

---

### 3. Quarterly Password Reset Schedule

**Location:** Admin Settings page (`/admin/settings`)

**Features:**
- Configure automatic password reset schedules
- Options: Quarterly, Bi-Monthly, Monthly, Yearly, or Never
- Track next reset date automatically
- Email notifications before reset deadline
- Manual trigger option for immediate reset

**Settings Available:**
- **Enable/Disable:** Toggle automatic password resets
- **Frequency:** Choose reset interval
- **Notify Users:** Enable/disable email notifications
- **Days Before Notification:** Configure advance notice period

**How it works:**
1. Admin sets reset frequency (default: Quarterly)
2. System calculates next reset date automatically
3. If notifications enabled, users receive email X days before deadline
4. On reset date, all users are flagged to reset password on next login
5. Admin can trigger immediate reset if needed

**API Endpoints:**
- `GET /api/admin/password-reset-settings` - Get current settings
- `POST /api/admin/password-reset-settings` - Save settings
- `POST /api/admin/trigger-password-reset` - Trigger reset for all users

---

### 4. Admin Settings Page

**Location:** `/admin/settings`

**Features:**
- Password reset schedule configuration
- Visual calendar showing next reset date
- Admin privileges overview
- Save and trigger actions

**Navigation:**
- Added to admin navigation menu
- Accessible via "Admin Settings" link in sidebar

---

## 🔧 Database Setup

### Required Migration

Run the SQL migration file to create the admin settings table:

```sql
-- File: supabase-admin-settings-migration.sql
```

This creates:
- `admin_settings` table for storing configuration
- RLS policies for admin-only access
- Default password reset settings

**To apply:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run `supabase-admin-settings-migration.sql`

---

## 📧 Email Notifications

### Password Reset Notification

When password reset is triggered:
- All active users receive notification email
- Email includes reset instructions
- Works with Resend or falls back to console logging

**Email Template:** `app/api/send-password-reset-notification/route.ts`

---

## 🔐 Admin Privileges Summary

Admins now have access to:

1. **Employee Management**
   - Create employees with position validation
   - Edit employee details
   - Delete/deactivate employees (with confirmation)
   - View all employees with filtering

2. **Password Management**
   - Configure password reset schedules
   - Trigger password resets manually
   - Set notification preferences
   - Track reset history

3. **Position Management**
   - Check position availability before creating
   - Prevent duplicate positions
   - View position conflicts

4. **System Settings**
   - Configure security policies
   - Manage password requirements
   - Set notification schedules

---

## 🚀 Usage Examples

### Checking Position Availability

```typescript
// Automatically checked when creating employee
const result = await createEmployee({
  name: "John Doe",
  email: "john@example.com",
  position: "Sales Manager",
  department: "Sales",
  branch: "Headquarters",
  // ... other fields
})
// If position is filled, throws error with details
```

### Configuring Password Reset Schedule

1. Navigate to `/admin/settings`
2. Enable "Automatic Password Resets"
3. Select frequency (e.g., "Quarterly")
4. Enable notifications
5. Set days before notification (e.g., 7)
6. Click "Save Settings"

### Triggering Immediate Password Reset

1. Go to `/admin/settings`
2. Click "Trigger Reset Now"
3. Confirm action
4. All users will be notified and required to reset on next login

---

## 📝 Notes

- **Position Check:** Only checks active employees. Inactive employees don't block positions.
- **Password Reset:** Uses Supabase Auth metadata to flag password reset requirement
- **Email Service:** Requires Resend API key in `.env.local` for production emails
- **Settings Storage:** Uses `admin_settings` table with JSONB for flexible configuration

---

## 🔒 Security Considerations

- All admin operations require admin role verification
- RLS policies restrict access to admin settings
- Password reset flags are stored securely in auth metadata
- Email notifications respect rate limiting

---

## 📚 Related Files

- `app/admin/settings/page.tsx` - Admin settings UI
- `app/admin/employees/page.tsx` - Enhanced employee management
- `app/admin/employees/create/page.tsx` - Employee creation with position check
- `app/api/admin/password-reset-settings/route.ts` - Settings API
- `app/api/admin/trigger-password-reset/route.ts` - Reset trigger API
- `lib/supabase/queries.ts` - Position availability check
- `supabase-admin-settings-migration.sql` - Database migration

---

## ✅ Next Steps

1. Run the database migration: `supabase-admin-settings-migration.sql`
2. Configure email service (Resend) in `.env.local`
3. Test password reset functionality
4. Set up quarterly schedule if desired
5. Train admins on new features

---

**Last Updated:** Now
**Version:** 1.0.0

