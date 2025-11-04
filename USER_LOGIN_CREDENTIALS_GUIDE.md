# User Login Credentials Setup Guide

This guide explains how to create login credentials for all user types in the system.

## 📋 User Types Created

1. **Admin** (Headquarters)
2. **HQ Employees** (different departments)
3. **HQ Department Heads**
4. **Branch Employees**
5. **Branch Department Heads**

## 🔐 Login Credentials

After setup, users can log in with these emails (passwords set during auth user creation):

### Admin
- **Email:** `admin@sgoap.com`
- **Role:** Admin
- **Branch:** New York HQ
- **Department:** Information Technology (IT)

### Headquarters Employees
1. **HR Employee**
   - Email: `employee.hq.hr@sgoap.com`
   - Name: Sarah Johnson
   - Department: Human Resources (HR)

2. **Finance Employee**
   - Email: `employee.hq.finance@sgoap.com`
   - Name: David Martinez
   - Department: Finance & Accounting

3. **Marketing Employee**
   - Email: `employee.hq.marketing@sgoap.com`
   - Name: Emily Chen
   - Department: Marketing & Communications

### Headquarters Department Heads
1. **HR Director**
   - Email: `head.hq.hr@sgoap.com`
   - Name: Jennifer Thompson
   - Department: Human Resources (HR)

2. **CFO**
   - Email: `head.hq.finance@sgoap.com`
   - Name: Robert Anderson
   - Department: Finance & Accounting

3. **General Counsel**
   - Email: `head.hq.legal@sgoap.com`
   - Name: Amanda Williams
   - Department: Legal & Compliance

### Branch Employees (London Office)
1. **Sales Representative**
   - Email: `employee.branch.sales@sgoap.com`
   - Name: James Mitchell
   - Department: Sales & Business Development

2. **Operations Coordinator**
   - Email: `employee.branch.ops@sgoap.com`
   - Name: Sophie Brown
   - Department: Operations & Logistics

### Branch Department Heads (London Office)
1. **Sales Manager**
   - Email: `head.branch.sales@sgoap.com`
   - Name: Michael O'Connor
   - Department: Sales & Business Development

2. **Finance Manager**
   - Email: `head.branch.finance@sgoap.com`
   - Name: Lisa Chang
   - Department: Finance & Accounting

## 🚀 Setup Instructions

### Method 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Authentication** > **Users**

2. **Create Auth Users**
   - Click **"Add User"** for each email listed above
   - Set a temporary password (users will change on first login)
   - Use email confirmation: **Auto Confirm** (for testing)

3. **Run the SQL Script**
   - Go to **SQL Editor**
   - Run `supabase-user-login-credentials.sql`
   - This creates user profiles linked to auth users

### Method 2: Supabase Management API

```bash
# Using Supabase CLI or Management API
# Create auth users programmatically

supabase auth admin create-user \
  --email admin@sgoap.com \
  --password "TempPass123!" \
  --email-confirmed true

# Repeat for all users...
```

Then run the SQL script.

### Method 3: Bulk User Creation Script

Create a script to bulk create users:

```javascript
// Example using Supabase Admin SDK
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const users = [
  { email: 'admin@sgoap.com', password: 'TempPass123!' },
  { email: 'employee.hq.hr@sgoap.com', password: 'TempPass123!' },
  { email: 'head.hq.hr@sgoap.com', password: 'TempPass123!' },
  // ... all other users
]

for (const user of users) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  })
  console.log(`Created: ${user.email}`, error ? error.message : 'Success')
}
```

## 📝 Default Passwords (Development Only)

For **development/testing only**, you can use a common temporary password:
- **Password:** `TempPass123!`

**⚠️ IMPORTANT:** Change all passwords in production!

## ✅ Verification Steps

After creating users:

1. **Check Auth Users:**
   ```sql
   SELECT email, created_at, email_confirmed_at 
   FROM auth.users 
   WHERE email LIKE '%@sgoap.com';
   ```

2. **Check User Profiles:**
   ```sql
   SELECT email, name, role, department, branch 
   FROM public.users 
   ORDER BY role, branch, department;
   ```

3. **Test Login:**
   - Go to your login page
   - Try logging in with each credential
   - Verify role-based access works

## 🔄 Updating Passwords

### Via Dashboard:
1. Go to Authentication > Users
2. Find the user
3. Click **"Reset Password"**
4. User will receive password reset email

### Via SQL (if needed):
```sql
-- Update password hash (requires pgcrypto)
UPDATE auth.users 
SET encrypted_password = crypt('NewPassword123!', gen_salt('bf'))
WHERE email = 'admin@sgoap.com';
```

## 📊 User Hierarchy

```
Admin
├── HQ Department Heads
│   ├── HQ Employees (reporting to heads)
│   └── Branch Department Heads
│       └── Branch Employees (reporting to heads)
```

## 🛠️ Troubleshooting

### User can't log in
1. Check auth user exists: `SELECT * FROM auth.users WHERE email = '...'`
2. Check email is confirmed: `email_confirmed_at IS NOT NULL`
3. Check user profile exists: `SELECT * FROM public.users WHERE email = '...'`
4. Verify password is correct (reset if needed)

### User profile missing
- Run the SQL script again
- Check for errors in SQL Editor
- Verify auth user ID matches profile ID

### Role not working
- Verify `role` field in `public.users` table
- Check RLS policies allow access
- Ensure role is one of: `employee`, `department_head`, `manager`, `executive`, `ceo`, `admin`

## 📞 Support

If you encounter issues:
1. Check Supabase logs
2. Verify all SQL migrations have been run
3. Check RLS policies are correctly set
4. Review user creation steps above

---

**Note:** For production, implement proper password policies and user onboarding flows.

