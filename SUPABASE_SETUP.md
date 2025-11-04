# Supabase Setup Guide

This project has been migrated to use Supabase for database and authentication. Follow these steps to set up your Supabase instance.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details (name, database password, region)
4. Wait for the project to be created

## 2. Run Database Migration

1. In your Supabase dashboard, go to the SQL Editor
2. Open the `supabase-migration.sql` file from this project
3. Copy and paste the entire SQL script into the SQL Editor
4. Click "Run" to execute the migration
5. This will create all necessary tables, RLS policies, and enable real-time

## 3. Configure Environment Variables

1. In your Supabase dashboard, go to Settings > API
2. Copy your project URL and anon/public key
3. Create a `.env.local` file in your project root (or update existing one):

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Set Up Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Enable Email provider (it's enabled by default)
3. Configure email templates if needed
4. For development, you can disable email confirmation in Authentication > Settings > Email Auth

## 5. Create Initial Users

You have two options:

### Option A: Create users via Supabase Dashboard
1. Go to Authentication > Users
2. Click "Add User" 
3. Enter email and password
4. After creating the auth user, manually create a profile in the `users` table via SQL Editor:

```sql
INSERT INTO public.users (id, email, name, role, department, branch, is_active)
VALUES (
  'user-uuid-from-auth-users',
  'user@example.com',
  'User Name',
  'admin',
  'IT',
  'Headquarters',
  true
);
```

### Option B: Use the admin panel in the app
1. First create an admin user manually (using Option A)
2. Log in as admin
3. Use the admin panel to create other users (this will create both auth and profile)

## 6. Enable Realtime (Optional but Recommended)

1. In Supabase dashboard, go to Database > Replication
2. Enable replication for:
   - `tasks` table
   - `messages` table  
   - `notifications` table

This enables real-time updates in the application.

## 7. Test Your Setup

1. Start your development server: `npm run dev`
2. Try logging in with a user you created
3. Check that pages load data from Supabase
4. Test real-time updates by opening the app in multiple tabs

## Important Notes

- All pages are now set to `dynamic = 'force-dynamic'` for real-time updates
- Authentication uses Supabase Auth instead of localStorage
- All hardcoded data has been replaced with Supabase queries
- RLS (Row Level Security) policies are in place for data protection

## Troubleshooting

### "User profile not found" error
- Make sure you created a profile in the `users` table for each auth user
- Check that the user ID in auth.users matches the id in public.users

### Real-time not working
- Verify realtime is enabled in Database > Replication
- Check that tables are added to the `supabase_realtime` publication in the migration SQL

### RLS blocking queries
- Check your RLS policies in the SQL migration file
- Verify your user has the correct role set in the `users` table

## Next Steps

- Seed your database with initial data (branches, departments, etc.)
- Customize RLS policies based on your needs
- Set up email templates for user invitations
- Configure storage buckets if you need file uploads

