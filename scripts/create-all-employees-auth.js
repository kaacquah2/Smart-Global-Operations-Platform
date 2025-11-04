/**
 * Script to create all employee auth users
 * Usage: node scripts/create-all-employees-auth.js
 * 
 * This creates auth users for all employees in the seed script.
 * Then run the SQL script: supabase-seed-all-employees.sql
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_PASSWORD = 'Password123!'; // Change this in production!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add these to your .env.local file:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your-project-url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// All employees from the seed script
const employees = [
  // CEO and Executives
  { email: 'ceo@sgoap.com', name: 'James Mitchell', role: 'ceo' },
  { email: 'executive.strategy@sgoap.com', name: 'Sarah Chen', role: 'executive' },
  { email: 'executive.operations@sgoap.com', name: 'Michael Rodriguez', role: 'executive' },
  { email: 'executive.finance@sgoap.com', name: 'David Thompson', role: 'executive' },
  
  // Department Heads (HQ)
  { email: 'head.hr@sgoap.com', name: 'Jennifer Martinez', role: 'department_head' },
  { email: 'head.finance@sgoap.com', name: 'Robert Kim', role: 'department_head' },
  { email: 'head.marketing@sgoap.com', name: 'Emily Watson', role: 'department_head' },
  { email: 'head.sales@sgoap.com', name: 'Christopher Anderson', role: 'department_head' },
  { email: 'head.operations@sgoap.com', name: 'Amanda Foster', role: 'department_head' },
  { email: 'head.it@sgoap.com', name: 'Kevin Park', role: 'department_head' },
  { email: 'head.rd@sgoap.com', name: 'Lisa Johnson', role: 'department_head' },
  { email: 'head.legal@sgoap.com', name: 'Thomas Wilson', role: 'department_head' },
  { email: 'head.procurement@sgoap.com', name: 'Patricia Brown', role: 'department_head' },
  { email: 'head.customer.service@sgoap.com', name: 'Daniel Lee', role: 'department_head' },
  { email: 'head.facilities@sgoap.com', name: 'Michelle Taylor', role: 'department_head' },
  { email: 'head.audit@sgoap.com', name: 'Richard Moore', role: 'department_head' },
  
  // Managers
  { email: 'manager.sales@sgoap.com', name: 'Jessica White', role: 'manager' },
  { email: 'manager.hr@sgoap.com', name: 'Brian Clark', role: 'manager' },
  { email: 'manager.finance@sgoap.com', name: 'Nicole Garcia', role: 'manager' },
  { email: 'manager.it@sgoap.com', name: 'Ryan Adams', role: 'manager' },
  { email: 'manager.operations@sgoap.com', name: 'Stephanie Hill', role: 'manager' },
  
  // Employees (HQ)
  { email: 'employee.hr.1@sgoap.com', name: 'Ashley Turner', role: 'employee' },
  { email: 'employee.hr.2@sgoap.com', name: 'Matthew Phillips', role: 'employee' },
  { email: 'employee.finance.1@sgoap.com', name: 'Ryan Martinez', role: 'employee' },
  { email: 'employee.finance.2@sgoap.com', name: 'Lauren Cooper', role: 'employee' },
  { email: 'employee.marketing.1@sgoap.com', name: 'Brandon Scott', role: 'employee' },
  { email: 'employee.marketing.2@sgoap.com', name: 'Samantha Green', role: 'employee' },
  { email: 'employee.sales.1@sgoap.com', name: 'Justin Hall', role: 'employee' },
  { email: 'employee.sales.2@sgoap.com', name: 'Megan Lewis', role: 'employee' },
  { email: 'employee.sales.3@sgoap.com', name: 'Tyler Walker', role: 'employee' },
  { email: 'employee.operations.1@sgoap.com', name: 'Cameron Young', role: 'employee' },
  { email: 'employee.operations.2@sgoap.com', name: 'Rachel King', role: 'employee' },
  { email: 'employee.it.1@sgoap.com', name: 'Jordan Wright', role: 'employee' },
  { email: 'employee.it.2@sgoap.com', name: 'Alexis Lopez', role: 'employee' },
  { email: 'employee.legal.1@sgoap.com', name: 'Jonathan Baker', role: 'employee' },
  { email: 'employee.procurement.1@sgoap.com', name: 'Victoria Harris', role: 'employee' },
  { email: 'employee.customer.service.1@sgoap.com', name: 'Nathan Collins', role: 'employee' },
  { email: 'employee.customer.service.2@sgoap.com', name: 'Olivia Stewart', role: 'employee' },
  { email: 'employee.rd.1@sgoap.com', name: 'Eric Murphy', role: 'employee' },
  { email: 'employee.facilities.1@sgoap.com', name: 'Kimberly Rivera', role: 'employee' },
  { email: 'employee.audit.1@sgoap.com', name: 'Derek Campbell', role: 'employee' },
  
  // Branch Employees (London)
  { email: 'head.london.sales@sgoap.com', name: 'Emma Wilson', role: 'department_head' },
  { email: 'employee.london.sales@sgoap.com', name: 'Oliver Smith', role: 'employee' },
  { email: 'employee.london.operations@sgoap.com', name: 'Sophie Brown', role: 'employee' },
  
  // Branch Employees (Tokyo)
  { email: 'employee.tokyo.sales@sgoap.com', name: 'Hiroshi Tanaka', role: 'employee' },
  { email: 'employee.tokyo.rd@sgoap.com', name: 'Yuki Nakamura', role: 'employee' },
];

async function createAuthUser(email, name, role) {
  try {
    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    if (existingUser) {
      console.log(`⏭️  User already exists: ${email}`);
      // Update password just in case
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: DEFAULT_PASSWORD
      });
      return existingUser.id;
    }

    // Create new user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: DEFAULT_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: name,
        role: role
      }
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('No user data returned');
    }

    console.log(`✅ Created: ${email}`);
    return data.user.id;
  } catch (error) {
    console.error(`❌ Error creating ${email}:`, error.message);
    return null;
  }
}

async function createAllUsers() {
  console.log('🚀 Starting bulk user creation...\n');
  console.log(`📧 Creating ${employees.length} auth users...\n`);
  console.log(`🔐 Default password for all users: ${DEFAULT_PASSWORD}\n`);
  console.log('='.repeat(60) + '\n');

  const results = {
    created: 0,
    skipped: 0,
    failed: 0
  };

  for (const employee of employees) {
    const userId = await createAuthUser(employee.email, employee.name, employee.role);
    
    if (userId) {
      results.created++;
    } else {
      results.failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Results:');
  console.log(`   ✅ Created: ${results.created}`);
  console.log(`   ⏭️  Skipped (already exist): ${results.skipped}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  
  console.log('\n📝 Next Steps:');
  console.log('   1. Run the SQL script: supabase-seed-all-employees.sql');
  console.log('   2. This will create user profiles for all the auth users');
  console.log(`   3. All users can login with password: ${DEFAULT_PASSWORD}`);
  console.log('\n✨ Done!');
}

// Run the script
createAllUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

