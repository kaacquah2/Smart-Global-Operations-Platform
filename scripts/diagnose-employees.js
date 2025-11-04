/**
 * Diagnostic script to check employee data
 * Usage: node scripts/diagnose-employees.js
 * 
 * Checks:
 * 1. How many auth users exist
 * 2. How many user profiles exist
 * 3. Lists missing users
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const expectedEmails = [
  'ceo@sgoap.com',
  'executive.strategy@sgoap.com',
  'executive.operations@sgoap.com',
  'executive.finance@sgoap.com',
  'head.hr@sgoap.com',
  'head.finance@sgoap.com',
  'head.marketing@sgoap.com',
  'head.sales@sgoap.com',
  'head.operations@sgoap.com',
  'head.it@sgoap.com',
  'head.rd@sgoap.com',
  'head.legal@sgoap.com',
  'head.procurement@sgoap.com',
  'head.customer.service@sgoap.com',
  'head.facilities@sgoap.com',
  'head.audit@sgoap.com',
  'manager.sales@sgoap.com',
  'manager.hr@sgoap.com',
  'manager.finance@sgoap.com',
  'manager.it@sgoap.com',
  'manager.operations@sgoap.com',
  'employee.hr.1@sgoap.com',
  'employee.hr.2@sgoap.com',
  'employee.finance.1@sgoap.com',
  'employee.finance.2@sgoap.com',
  'employee.marketing.1@sgoap.com',
  'employee.marketing.2@sgoap.com',
  'employee.sales.1@sgoap.com',
  'employee.sales.2@sgoap.com',
  'employee.sales.3@sgoap.com',
  'employee.operations.1@sgoap.com',
  'employee.operations.2@sgoap.com',
  'employee.it.1@sgoap.com',
  'employee.it.2@sgoap.com',
  'employee.legal.1@sgoap.com',
  'employee.procurement.1@sgoap.com',
  'employee.customer.service.1@sgoap.com',
  'employee.customer.service.2@sgoap.com',
  'employee.rd.1@sgoap.com',
  'employee.facilities.1@sgoap.com',
  'employee.audit.1@sgoap.com',
  'head.london.sales@sgoap.com',
  'employee.london.sales@sgoap.com',
  'employee.london.operations@sgoap.com',
  'employee.tokyo.sales@sgoap.com',
  'employee.tokyo.rd@sgoap.com',
];

async function diagnose() {
  console.log('🔍 Diagnosing employee data...\n');

  // Check auth users
  console.log('📋 Step 1: Checking auth users...');
  const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error('❌ Error fetching auth users:', authError.message);
    return;
  }

  console.log(`   Found ${authUsers.users.length} auth users in total`);
  
  const authEmails = authUsers.users.map(u => u.email?.toLowerCase()).filter(Boolean);
  const expectedAuthEmails = expectedEmails.map(e => e.toLowerCase());
  const missingAuth = expectedAuthEmails.filter(e => !authEmails.includes(e));
  const foundAuth = expectedAuthEmails.filter(e => authEmails.includes(e));

  console.log(`   ✅ Found ${foundAuth.length} expected auth users`);
  console.log(`   ❌ Missing ${missingAuth.length} expected auth users`);
  
  if (missingAuth.length > 0) {
    console.log('\n   Missing auth users:');
    missingAuth.slice(0, 10).forEach(email => console.log(`      - ${email}`));
    if (missingAuth.length > 10) {
      console.log(`      ... and ${missingAuth.length - 10} more`);
    }
  }

  // Check user profiles
  console.log('\n📋 Step 2: Checking user profiles...');
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('users')
    .select('id, email, name, role, is_active')
    .order('name');

  if (profileError) {
    console.error('❌ Error fetching profiles:', profileError.message);
    return;
  }

  console.log(`   Found ${profiles.length} user profiles in total`);
  console.log(`   Active profiles: ${profiles.filter(p => p.is_active).length}`);
  
  const profileEmails = profiles.map(p => p.email?.toLowerCase()).filter(Boolean);
  const missingProfiles = expectedAuthEmails.filter(e => !profileEmails.includes(e));
  const foundProfiles = expectedAuthEmails.filter(e => profileEmails.includes(e));

  console.log(`   ✅ Found ${foundProfiles.length} expected profiles`);
  console.log(`   ❌ Missing ${missingProfiles.length} expected profiles`);

  if (missingProfiles.length > 0) {
    console.log('\n   Missing profiles (auth exists but profile missing):');
    missingProfiles.slice(0, 10).forEach(email => console.log(`      - ${email}`));
    if (missingProfiles.length > 10) {
      console.log(`      ... and ${missingProfiles.length - 10} more`);
    }
  }

  // Check for auth users without profiles
  console.log('\n📋 Step 3: Checking for orphaned auth users...');
  const authWithoutProfiles = authUsers.users.filter(
    au => au.email && !profileEmails.includes(au.email.toLowerCase())
  );
  console.log(`   Found ${authWithoutProfiles.length} auth users without profiles`);
  if (authWithoutProfiles.length > 0) {
    authWithoutProfiles.slice(0, 5).forEach(user => {
      console.log(`      - ${user.email} (${user.id})`);
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   Expected employees: ${expectedEmails.length}`);
  console.log(`   Auth users found: ${foundAuth.length}/${expectedEmails.length}`);
  console.log(`   Profiles found: ${foundProfiles.length}/${expectedEmails.length}`);
  console.log(`   Missing auth users: ${missingAuth.length}`);
  console.log(`   Missing profiles: ${missingProfiles.length}`);

  console.log('\n💡 Recommendations:');
  
  if (missingAuth.length > 0) {
    console.log('   1. Run: node scripts/create-all-employees-auth.js');
    console.log('      This will create all missing auth users');
  }
  
  if (missingProfiles.length > 0 && foundAuth.length > 0) {
    console.log('   2. Run the SQL script again: supabase-seed-all-employees.sql');
    console.log('      This will create profiles for existing auth users');
  }
  
  if (missingAuth.length === 0 && missingProfiles.length === 0) {
    console.log('   ✅ Everything looks good! All employees should be visible.');
    console.log('   If you still can\'t see them, check RLS policies:');
    console.log('   - Run: fix-rls-simple.sql');
  }

  console.log('\n✨ Diagnosis complete!');
}

diagnose()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

