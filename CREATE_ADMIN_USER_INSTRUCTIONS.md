# Create Admin User Instructions

## User Details
- **Email:** kaacquah2004@gmail.com
- **Password:** Acquah@17
- **Role:** admin

## Method 1: Using Supabase Dashboard (Recommended)

1. **Create Auth User:**
   - Go to Supabase Dashboard > **Authentication** > **Users**
   - Click **"Add User"**
   - Enter:
     - **Email:** `kaacquah2004@gmail.com`
     - **Password:** `Acquah@17`
     - **Auto Confirm:** ✅ (checked)
   - Click **"Create User"**

2. **Create User Profile:**
   - Go to **SQL Editor** in Supabase Dashboard
   - Copy and run the SQL script: `create-admin-kaacquah.sql`
   - This will create the user profile with admin role

## Method 2: Using Node.js Script

1. **Add Service Role Key to .env.local:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
   
   You can find your Service Role Key in:
   - Supabase Dashboard > **Settings** > **API** > **service_role key** (secret)

2. **Run the script:**
   ```bash
   node scripts/create-admin-user.js
   ```

   This script will:
   - Create the auth user automatically
   - Create the user profile
   - Handle password updates if user already exists

## Method 3: Manual SQL (If you have direct database access)

1. First create the auth user (see Method 1, Step 1)

2. Then run the SQL script `create-admin-kaacquah.sql` in SQL Editor

## Verification

After creating the user, you can verify by:
1. Logging in at `/auth/login` with:
   - Email: `kaacquah2004@gmail.com`
   - Password: `Acquah@17`

2. You should see the admin dashboard and have access to admin features

## Troubleshooting

- **"Auth user not found"**: Make sure you created the auth user in Supabase Dashboard first
- **"Foreign key constraint"**: The script will create branches and departments automatically if they don't exist
- **"User already exists"**: The script uses UPSERT, so it will update existing users

