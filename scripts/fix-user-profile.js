/**
 * Script to fix missing user profile for kaacquah2004@gmail.com
 * This will create the user profile in public.users table
 * Usage: node scripts/fix-user-profile.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON_KEY as fallback)');
  process.exit(1);
}

// Use service role key for admin operations, or anon key as fallback
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixUserProfile() {
  const email = 'kaacquah2004@gmail.com';
  const name = 'Admin User';

  try {
    console.log('🔍 Looking for auth user...');
    console.log(`   Email: ${email}`);
    
    // Get auth user ID
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      console.log('\n⚠️  Trying alternative method...');
      
      // Alternative: Use SQL query if we have database access
      const { data: sqlData, error: sqlError } = await supabaseAdmin
        .from('users')
        .select('*')
        .limit(0); // Just to test connection
      
      if (sqlError) {
        throw new Error(`Cannot access database. Please run the SQL script manually in Supabase Dashboard.`);
      }
      
      console.log('\n📝 Please run this SQL in Supabase SQL Editor:');
      console.log('===========================================');
      console.log(`
DO $$
DECLARE
  v_user_id UUID;
  v_hq_branch_id UUID;
  v_it_dept_id UUID;
BEGIN
  -- Find the auth user by email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'kaacquah2004@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth user not found!';
  END IF;

  -- Find or create New York HQ branch
  SELECT id INTO v_hq_branch_id 
  FROM public.branches 
  WHERE name = 'New York HQ' 
  LIMIT 1;

  IF v_hq_branch_id IS NULL THEN
    INSERT INTO public.branches (id, name, country, city, status)
    VALUES (gen_random_uuid(), 'New York HQ', 'United States', 'New York, NY', 'active')
    RETURNING id INTO v_hq_branch_id;
  END IF;

  -- Find or create IT department
  SELECT id INTO v_it_dept_id 
  FROM public.departments 
  WHERE name = 'Information Technology (IT)' 
    AND branch_id = v_hq_branch_id
  LIMIT 1;

  IF v_it_dept_id IS NULL THEN
    INSERT INTO public.departments (id, name, branch_id)
    VALUES (gen_random_uuid(), 'Information Technology (IT)', v_hq_branch_id)
    RETURNING id INTO v_it_dept_id;
  END IF;

  -- Create or update user profile
  INSERT INTO public.users (
    id, email, name, role, department, branch, position, 
    phone, hire_date, avatar, is_active, manager_id
  ) VALUES (
    v_user_id,
    'kaacquah2004@gmail.com',
    'Admin User',
    'admin',
    'Information Technology (IT)',
    'New York HQ',
    'System Administrator',
    NULL,
    CURRENT_DATE,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=kaacquah2004',
    true,
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    branch = EXCLUDED.branch,
    position = EXCLUDED.position,
    phone = EXCLUDED.phone,
    hire_date = EXCLUDED.hire_date,
    avatar = EXCLUDED.avatar,
    is_active = EXCLUDED.is_active,
    manager_id = EXCLUDED.manager_id;

  RAISE NOTICE '✅ User profile created! User ID: %', v_user_id;
END $$;
      `);
      console.log('===========================================');
      process.exit(0);
    }

    const authUser = authUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!authUser) {
      console.error(`❌ Auth user not found with email: ${email}`);
      console.log('\n📝 Please run the SQL script in Supabase Dashboard SQL Editor');
      process.exit(1);
    }

    console.log('✅ Found auth user');
    console.log(`   User ID: ${authUser.id}`);
    console.log('\n📝 Creating user profile...');

    // Find or create branch
    let hqBranchId = null;
    const { data: branches } = await supabaseAdmin
      .from('branches')
      .select('id, name')
      .eq('name', 'New York HQ')
      .limit(1);

    if (branches && branches.length > 0) {
      hqBranchId = branches[0].id;
    } else {
      // Create branch
      const { data: newBranch, error: branchError } = await supabaseAdmin
        .from('branches')
        .insert({
          name: 'New York HQ',
          country: 'United States',
          city: 'New York, NY',
          status: 'active'
        })
        .select()
        .single();
      
      if (branchError) throw branchError;
      hqBranchId = newBranch.id;
      console.log('✅ Created New York HQ branch');
    }

    // Find or create IT department
    let itDeptId = null;
    if (hqBranchId) {
      const { data: departments } = await supabaseAdmin
        .from('departments')
        .select('id, name')
        .eq('name', 'Information Technology (IT)')
        .eq('branch_id', hqBranchId)
        .limit(1);

      if (departments && departments.length > 0) {
        itDeptId = departments[0].id;
      } else {
        // Create department
        const { data: newDept, error: deptError } = await supabaseAdmin
          .from('departments')
          .insert({
            name: 'Information Technology (IT)',
            branch_id: hqBranchId
          })
          .select()
          .single();
        
        if (deptError) throw deptError;
        itDeptId = newDept.id;
        console.log('✅ Created IT department');
      }
    }

    // Create user profile
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    
    const userProfile = {
      id: authUser.id,
      email: email,
      name: name,
      role: 'admin',
      department: 'Information Technology (IT)',
      branch: 'New York HQ',
      position: 'System Administrator',
      phone: null,
      hire_date: new Date().toISOString().split('T')[0],
      avatar: avatar,
      is_active: true,
      manager_id: null
    };

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .upsert(userProfile, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (profileError) {
      // If foreign key constraint, try minimal profile
      if (profileError.code === '23503') {
        console.log('⚠️  Foreign key constraint, creating minimal profile...');
        const minimalProfile = {
          id: authUser.id,
          email: email,
          name: name,
          role: 'admin',
          department: 'Information Technology (IT)',
          branch: 'New York HQ',
          position: 'System Administrator',
          is_active: true,
          avatar: avatar
        };

        const { data, error } = await supabaseAdmin
          .from('users')
          .upsert(minimalProfile, {
            onConflict: 'id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (error) throw error;
        console.log('✅ User profile created (minimal)');
        console.log('\n📊 User Details:');
        console.log(`   ID: ${data.id}`);
        console.log(`   Email: ${data.email}`);
        console.log(`   Name: ${data.name}`);
        console.log(`   Role: ${data.role}`);
        console.log('\n✅ Profile created! You can now log in.');
        return data;
      } else {
        throw profileError;
      }
    }

    console.log('✅ User profile created successfully!');
    console.log('\n📊 User Details:');
    console.log(`   ID: ${profileData.id}`);
    console.log(`   Email: ${profileData.email}`);
    console.log(`   Name: ${profileData.name}`);
    console.log(`   Role: ${profileData.role}`);
    console.log(`   Department: ${profileData.department}`);
    console.log(`   Branch: ${profileData.branch}`);
    console.log('\n✅ Done! You can now log in with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: Acquah@17`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n📝 Alternative: Run the SQL script manually in Supabase Dashboard:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy and run: create-admin-kaacquah.sql');
    process.exit(1);
  }
}

// Run the script
fixUserProfile()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });

