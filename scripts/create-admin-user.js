/**
 * Script to create an admin user
 * Usage: node scripts/create-admin-user.js
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add these to your .env.local file:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your-project-url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

// Use service role key for admin operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const email = 'kaacquah2004@gmail.com';
  const password = 'Acquah@17';
  const name = 'Admin User';

  try {
    console.log('🔄 Creating admin user...');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    
    // Step 1: Create auth user
    console.log('\n📝 Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name,
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Auth user already exists, updating password...');
        // Get existing user
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);
        
        if (existingUser) {
          // Update password
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { password: password }
          );
          
          if (updateError) {
            console.error('❌ Error updating password:', updateError.message);
            throw updateError;
          }
          
          console.log('✅ Password updated successfully');
          
          // Step 2: Create/Update user profile
          return await createUserProfile(existingUser.id, email, name);
        } else {
          throw authError;
        }
      } else {
        throw authError;
      }
    }

    if (!authData.user) {
      throw new Error('Failed to create auth user: No user data returned');
    }

    console.log('✅ Auth user created successfully');
    console.log(`   User ID: ${authData.user.id}`);

    // Step 2: Create user profile in public.users table
    return await createUserProfile(authData.user.id, email, name);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

async function createUserProfile(userId, email, name) {
  console.log('\n📝 Step 2: Creating user profile...');
  
  // Check if IT department exists, if not use first available department or create default
  const { data: departments } = await supabaseAdmin
    .from('departments')
    .select('id, name, branch_id')
    .eq('name', 'Information Technology (IT)')
    .limit(1);

  let departmentId = null;
  let departmentName = 'Information Technology (IT)';
  
  if (departments && departments.length > 0) {
    departmentId = departments[0].id;
  } else {
    // Get any department as fallback
    const { data: anyDept } = await supabaseAdmin
      .from('departments')
      .select('id, name, branch_id')
      .limit(1);
    
    if (anyDept && anyDept.length > 0) {
      departmentId = anyDept[0].id;
      departmentName = anyDept[0].name;
    }
  }

  // Get branch information
  let branchName = 'New York HQ';
  let branchId = null;
  
  if (departmentId) {
    const { data: branch } = await supabaseAdmin
      .from('branches')
      .select('id, name')
      .eq('id', departments?.[0]?.branch_id || anyDept?.[0]?.branch_id)
      .single();
    
    if (branch) {
      branchName = branch.name;
      branchId = branch.id;
    }
  }

  // If no branch found, get any branch
  if (!branchId) {
    const { data: anyBranch } = await supabaseAdmin
      .from('branches')
      .select('id, name')
      .limit(1)
      .single();
    
    if (anyBranch) {
      branchName = anyBranch.name;
      branchId = anyBranch.id;
    }
  }

  // Generate avatar URL
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

  const userProfile = {
    id: userId,
    email: email,
    name: name,
    role: 'admin',
    department: departmentName,
    branch: branchName,
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
    // If it's a foreign key constraint, try without branch/department references
    if (profileError.code === '23503') {
      console.log('⚠️  Foreign key constraint, creating with minimal data...');
      const minimalProfile = {
        id: userId,
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
      console.log('✅ User profile created successfully (minimal)');
      console.log('\n📊 User Details:');
      console.log(`   ID: ${data.id}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Role: ${data.role}`);
      console.log(`   Department: ${data.department}`);
      console.log(`   Branch: ${data.branch}`);
      return data;
    } else {
      throw profileError;
    }
  }

  console.log('✅ User profile created successfully');
  console.log('\n📊 User Details:');
  console.log(`   ID: ${profileData.id}`);
  console.log(`   Email: ${profileData.email}`);
  console.log(`   Name: ${profileData.name}`);
  console.log(`   Role: ${profileData.role}`);
  console.log(`   Department: ${profileData.department}`);
  console.log(`   Branch: ${profileData.branch}`);
  
  console.log('\n✅ Admin user created successfully!');
  console.log('\n🔐 Login Credentials:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  
  return profileData;
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

