/**
 * Quick verification script after running SQL
 * Usage: node scripts/verify-employees.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verify() {
  console.log('🔍 Verifying employees...\n');
  
  const { data: profiles, error } = await supabaseAdmin
    .from('users')
    .select('id, email, name, role, is_active')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`✅ Found ${profiles.length} active employees\n`);
  
  const byRole = {};
  profiles.forEach(p => {
    byRole[p.role] = (byRole[p.role] || 0) + 1;
  });

  console.log('📊 By Role:');
  Object.entries(byRole).forEach(([role, count]) => {
    console.log(`   ${role}: ${count}`);
  });

  console.log('\n👥 Sample employees:');
  profiles.slice(0, 10).forEach(p => {
    console.log(`   - ${p.name} (${p.role}) - ${p.email}`);
  });

  if (profiles.length >= 40) {
    console.log('\n✅ Success! All employees are loaded. You should see them in the admin panel now!');
  } else {
    console.log(`\n⚠️  Only ${profiles.length} employees found. Expected ~46.`);
    console.log('   Make sure you ran the SQL script: supabase-seed-all-employees.sql');
  }
}

verify();

