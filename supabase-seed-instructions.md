# Supabase Seed Data Instructions

## Overview
The `supabase-seed-data.sql` file contains comprehensive seed data for your SGOAP application. This includes:
- 6 Global Branches
- Multiple Departments across branches
- 10+ Users with different roles
- Sample Tasks, Workflows, Notifications
- Conversations and Messages
- Work Submissions

## Important Setup Steps

### Step 1: Run the Migration First
Make sure you've run `supabase-migration.sql` before running the seed data.

### Step 2: Create Auth Users
The seed data references user IDs, but you need to create the auth users first:

#### Option A: Manual Creation (Recommended for First Time)
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" for each user:
   - **Admin**: `admin@sgoap.com` / `admin123`
   - **CEO**: `ceo@sgoap.com` / `password123`
   - **Executive**: `executive@sgoap.com` / `password123`
   - **Manager**: `manager@sgoap.com` / `password123`
   - **Department Head**: `head@sgoap.com` / `password123`
   - **Employee**: `employee@sgoap.com` / `password123`
3. Copy the UUID from each created user
4. Update the UUIDs in `supabase-seed-data.sql` STEP 3 section
5. Re-run the STEP 3 section only

#### Option B: Programmatic Creation (Advanced)
You can use the Supabase Admin API to create users. Here's a script example:

```javascript
// This requires the SERVICE_ROLE_KEY - keep it secret!
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'YOUR_PROJECT_URL',
  'YOUR_SERVICE_ROLE_KEY' // ⚠️ Use service role key, not anon key
)

// Create auth user
const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@sgoap.com',
  password: 'admin123',
  email_confirm: true
})

if (data.user) {
  console.log('User ID:', data.user.id)
  // Use this ID in the seed data
}
```

### Step 3: Run Seed Data
1. Open Supabase Dashboard > SQL Editor
2. Copy the entire `supabase-seed-data.sql` file
3. If you manually created users, update the UUIDs in STEP 3 first
4. Run the SQL script
5. Verify data was inserted correctly

### Step 4: Verify Data
Run these queries to verify your data:

```sql
-- Check branches
SELECT COUNT(*) FROM public.branches; -- Should be 6

-- Check users
SELECT COUNT(*) FROM public.users; -- Should match number of auth users

-- Check tasks
SELECT COUNT(*) FROM public.tasks; -- Should be 10

-- Check workflows
SELECT COUNT(*) FROM public.workflows; -- Should be 4

-- Check notifications
SELECT COUNT(*) FROM public.notifications; -- Should be 8

-- Check conversations
SELECT COUNT(*) FROM public.conversations; -- Should be 4
```

## Data Structure

### Branches
- New York HQ (United States)
- London Office (United Kingdom)
- Tokyo Operations (Japan)
- Sydney Branch (Australia)
- Toronto Center (Canada)
- Singapore Hub (Singapore)

### User Roles Included
1. **Admin** - Full system access
2. **CEO** - Executive oversight
3. **Executive** - Strategic oversight
4. **Manager** - Operations management
5. **Department Head** - Department management
6. **Employee** - Standard user

### Sample Data Included
- **10 Tasks** across different statuses and priorities
- **4 Workflows** for automation
- **8 Notifications** for different users
- **4 Conversations** (3 direct, 1 group)
- **6 Messages** across conversations
- **4 Work Submissions** in various stages

## Troubleshooting

### "Foreign key constraint" errors
- Make sure you've created auth users first
- Verify UUIDs match between auth.users and public.users

### "Duplicate key" errors
- The seed uses `ON CONFLICT DO NOTHING` or `ON CONFLICT DO UPDATE`
- You can safely re-run sections if needed
- To reset, delete data first: `TRUNCATE TABLE public.tasks CASCADE;` (be careful!)

### Users not showing up
- Verify the user profile was created in `public.users`
- Check that `is_active = true`
- Ensure RLS policies allow viewing (all active users should be viewable)

### Missing relationships
- Branches need manager_id updated after users are created
- Departments need head_id updated after users are created
- Tasks need assignee_id to match user IDs

## Customization

You can modify the seed data to match your needs:
- Add more branches
- Create additional departments
- Add more employees
- Customize tasks and workflows
- Adjust notification messages

## Security Notes

- Default passwords are provided for initial setup
- **IMPORTANT**: Change all passwords after first login
- Consider implementing password reset workflows
- The seed data includes sample emails - update if needed for production

