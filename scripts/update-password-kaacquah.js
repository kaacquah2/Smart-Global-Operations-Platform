/**
 * Update password for kaacquah2004@gmail.com
 * This script updates the password for the admin user
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please ensure .env.local has:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updatePassword() {
  const email = 'kaacquah2004@gmail.com';
  const password = 'Acquah@17';

  try {
    console.log('🔄 Updating password for admin user...');
    console.log(`   Email: ${email}`);
    console.log(`   New Password: ${password}`);
    
    // First, find the user by email
    console.log('\n📝 Step 1: Finding user...');
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    
    const user = usersData?.users?.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ User not found!');
      console.log('\n💡 Creating user instead...');
      
      // Create the user if it doesn't exist
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: 'Admin User',
          role: 'admin'
        }
      });

      if (authError) {
        throw new Error(`Failed to create user: ${authError.message}`);
      }

      console.log('✅ User created successfully');
      console.log(`   User ID: ${authData.user.id}`);
      console.log(`   Email: ${authData.user.email}`);
      console.log(`   Password: ${password}`);
      
      return;
    }
    
    console.log(`✅ User found: ${user.id}`);
    console.log(`   Current email: ${user.email}`);
    
    // Update the password
    console.log('\n📝 Step 2: Updating password...');
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: password }
    );
    
    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }
    
    console.log('✅ Password updated successfully!');
    console.log('\n📋 User Details:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
    
    console.log('\n🎉 Password update complete!');
    console.log('You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
updatePassword()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

