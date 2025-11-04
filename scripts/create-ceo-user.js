/**
 * Script to create a CEO user
 * Usage: node scripts/create-ceo-user.js [email] [password] [name]
 * 
 * Examples:
 *   node scripts/create-ceo-user.js
 *   node scripts/create-ceo-user.js ceo@yourcompany.com MySecurePass123! "John CEO"
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

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

// Get parameters from command line or use defaults
const email = process.argv[2] || 'ceo@sgoap.com';
const password = process.argv[3] || 'CeoPass123!';
const name = process.argv[4] || 'CEO User';

async function createCEOUser() {
  try {
    console.log('🔄 Creating CEO user...');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Password: ${password}`);
    
    // Step 1: Create auth user
    console.log('\n📝 Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name,
        role: 'ceo'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Auth user already exists, updating password...');
        // Get existing user
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email.toLowerCase());
        
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
          return await createUserProfile(existingUser.id, email.toLowerCase(), name);
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
    return await createUserProfile(authData.user.id, email.toLowerCase(), name);

  } catch (error) {
    console.error('❌ Error creating CEO user:', error.message);
    process.exit(1);
  }
}

async function createUserProfile(userId, email, name) {
  console.log('\n📝 Step 2: Creating user profile...');
  
  // Get any branch (CEO doesn't need specific branch/department)
  const { data: branches } = await supabaseAdmin
    .from('branches')
    .select('id, name')
    .limit(1);

  let branchName = 'New York HQ';
  let branchId = null;
  
  if (branches && branches.length > 0) {
    branchName = branches[0].name;
    branchId = branches[0].id;
  }

  // Get any department (CEO has access to all)
  const { data: departments } = await supabaseAdmin
    .from('departments')
    .select('id, name')
    .limit(1);

  let departmentName = 'Executive Office';
  
  if (departments && departments.length > 0) {
    departmentName = departments[0].name;
  }

  // Generate avatar URL
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

  const userProfile = {
    id: userId,
    email: email,
    name: name,
    role: 'ceo',
    department: departmentName,
    branch: branchName,
    position: 'Chief Executive Officer',
    phone: null,
    hire_date: new Date().toISOString().split('T')[0],
    avatar: avatar,
    is_active: true,
    manager_id: null // CEO has no manager
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
    // If it's a foreign key constraint, try with minimal data
    if (profileError.code === '23503') {
      console.log('⚠️  Foreign key constraint, creating with minimal data...');
      const minimalProfile = {
        id: userId,
        email: email,
        name: name,
        role: 'ceo',
        department: 'Executive Office',
        branch: 'New York HQ',
        position: 'Chief Executive Officer',
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
  
  console.log('\n✅ CEO user created successfully!');
  console.log('\n🔐 Login Credentials:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role: CEO`);
  console.log('\n🌐 Login URL:');
  console.log(`   ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`);
  
  return profileData;
}

// Run the script
createCEOUser()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

