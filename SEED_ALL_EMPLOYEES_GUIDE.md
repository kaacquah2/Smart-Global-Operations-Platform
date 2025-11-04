# Seed All Employees Guide

This guide will help you populate your database with comprehensive employee data including CEO, executives, department heads, managers, and employees.

## 📋 Overview

The seed data includes:
- **1 CEO**: James Mitchell
- **3 Executives**: Strategy, Operations, Finance
- **12 Department Heads**: HR, Finance, Marketing, Sales, Operations, IT, R&D, Legal, Procurement, Customer Service, Facilities, Audit
- **5 Managers**: Sales, HR, Finance, IT, Operations
- **20+ Employees**: Across all departments
- **5 Branch Employees**: London and Tokyo offices

**Total: ~45 employees** with realistic names, positions, phone numbers, and hierarchical relationships.

## 🚀 Quick Start (Recommended)

### Method 1: Automated (Easiest)

1. **Create Auth Users Automatically:**
   ```bash
   node scripts/create-all-employees-auth.js
   ```
   
   This creates all auth users with:
   - **Email**: As defined in the script
   - **Password**: `Password123!` (for all users - change in production!)
   - **Auto-confirmed**: Yes

2. **Create User Profiles:**
   - Go to Supabase Dashboard > SQL Editor
   - Run the SQL script: `supabase-seed-all-employees.sql`
   - This creates all user profiles with complete details

3. **Done!** Log in as admin and you should see all employees.

### Method 2: Manual (If you prefer)

1. **Create Auth Users in Supabase Dashboard:**
   - Go to Authentication > Users > Add User
   - Create users with emails from the list below
   - Set password: `Password123!`
   - Enable "Auto Confirm Email"

2. **Run SQL Script:**
   - Go to SQL Editor
   - Run: `supabase-seed-all-employees.sql`

## 📧 All Employee Emails

### CEO and Executives
- `ceo@sgoap.com` - James Mitchell (CEO)
- `executive.strategy@sgoap.com` - Sarah Chen (CSO)
- `executive.operations@sgoap.com` - Michael Rodriguez (COO)
- `executive.finance@sgoap.com` - David Thompson (CFO)

### Department Heads (HQ)
- `head.hr@sgoap.com` - Jennifer Martinez
- `head.finance@sgoap.com` - Robert Kim
- `head.marketing@sgoap.com` - Emily Watson
- `head.sales@sgoap.com` - Christopher Anderson
- `head.operations@sgoap.com` - Amanda Foster
- `head.it@sgoap.com` - Kevin Park
- `head.rd@sgoap.com` - Lisa Johnson
- `head.legal@sgoap.com` - Thomas Wilson
- `head.procurement@sgoap.com` - Patricia Brown
- `head.customer.service@sgoap.com` - Daniel Lee
- `head.facilities@sgoap.com` - Michelle Taylor
- `head.audit@sgoap.com` - Richard Moore

### Managers
- `manager.sales@sgoap.com` - Jessica White
- `manager.hr@sgoap.com` - Brian Clark
- `manager.finance@sgoap.com` - Nicole Garcia
- `manager.it@sgoap.com` - Ryan Adams
- `manager.operations@sgoap.com` - Stephanie Hill

### Employees (HQ)
- `employee.hr.1@sgoap.com` - Ashley Turner
- `employee.hr.2@sgoap.com` - Matthew Phillips
- `employee.finance.1@sgoap.com` - Ryan Martinez
- `employee.finance.2@sgoap.com` - Lauren Cooper
- `employee.marketing.1@sgoap.com` - Brandon Scott
- `employee.marketing.2@sgoap.com` - Samantha Green
- `employee.sales.1@sgoap.com` - Justin Hall
- `employee.sales.2@sgoap.com` - Megan Lewis
- `employee.sales.3@sgoap.com` - Tyler Walker
- `employee.operations.1@sgoap.com` - Cameron Young
- `employee.operations.2@sgoap.com` - Rachel King
- `employee.it.1@sgoap.com` - Jordan Wright
- `employee.it.2@sgoap.com` - Alexis Lopez
- `employee.legal.1@sgoap.com` - Jonathan Baker
- `employee.procurement.1@sgoap.com` - Victoria Harris
- `employee.customer.service.1@sgoap.com` - Nathan Collins
- `employee.customer.service.2@sgoap.com` - Olivia Stewart
- `employee.rd.1@sgoap.com` - Eric Murphy
- `employee.facilities.1@sgoap.com` - Kimberly Rivera
- `employee.audit.1@sgoap.com` - Derek Campbell

### Branch Employees (London)
- `head.london.sales@sgoap.com` - Emma Wilson
- `employee.london.sales@sgoap.com` - Oliver Smith
- `employee.london.operations@sgoap.com` - Sophie Brown

### Branch Employees (Tokyo)
- `employee.tokyo.sales@sgoap.com` - Hiroshi Tanaka
- `employee.tokyo.rd@sgoap.com` - Yuki Nakamura

## 🔐 Default Login Credentials

**For ALL users:**
- **Password**: `Password123!`
- **Email**: As listed above

⚠️ **IMPORTANT**: Change all passwords in production!

## 📊 Hierarchy Structure

```
CEO (James Mitchell)
├── CSO (Sarah Chen)
│   ├── HR Head (Jennifer Martinez)
│   │   └── HR Manager (Brian Clark)
│   │       ├── Employee (Ashley Turner)
│   │       └── Employee (Matthew Phillips)
│   ├── Marketing Head (Emily Watson)
│   │   ├── Employee (Brandon Scott)
│   │   └── Employee (Samantha Green)
│   ├── Sales Head (Christopher Anderson)
│   │   └── Sales Manager (Jessica White)
│   │       ├── Employee (Justin Hall)
│   │       ├── Employee (Megan Lewis)
│   │       └── Employee (Tyler Walker)
│   └── R&D Head (Lisa Johnson)
│       └── Employee (Eric Murphy)
├── COO (Michael Rodriguez)
│   ├── Operations Head (Amanda Foster)
│   │   └── Operations Manager (Stephanie Hill)
│   │       ├── Employee (Cameron Young)
│   │       └── Employee (Rachel King)
│   ├── IT Head (Kevin Park)
│   │   └── IT Manager (Ryan Adams)
│   │       ├── Employee (Jordan Wright)
│   │       └── Employee (Alexis Lopez)
│   ├── Procurement Head (Patricia Brown)
│   │   └── Employee (Victoria Harris)
│   ├── Customer Service Head (Daniel Lee)
│   │   ├── Employee (Nathan Collins)
│   │   └── Employee (Olivia Stewart)
│   └── Facilities Head (Michelle Taylor)
│       └── Employee (Kimberly Rivera)
└── CFO (David Thompson)
    ├── Finance Head (Robert Kim)
    │   └── Finance Manager (Nicole Garcia)
    │       ├── Employee (Ryan Martinez)
    │       └── Employee (Lauren Cooper)
    └── Audit Head (Richard Moore)
        └── Employee (Derek Campbell)
```

## ✅ Verification

After running the scripts:

1. **Check Auth Users:**
   - Go to Supabase Dashboard > Authentication > Users
   - You should see ~45 users

2. **Check User Profiles:**
   - Go to Supabase Dashboard > Table Editor > users
   - You should see all employees with complete details

3. **Login as Admin:**
   - Login at `/auth/login` with your admin credentials
   - Go to Admin > Employees
   - You should see all employees listed

## 🔧 Troubleshooting

### "Auth user not found" error in SQL script
- Make sure you ran the Node.js script first to create auth users
- Or create auth users manually in Supabase Dashboard

### "Foreign key constraint" error
- Make sure branches and departments exist
- The SQL script creates them automatically, but if it fails, run `supabase-departments-seed.sql` first

### Users not showing in admin panel
- Check RLS policies are correct (run `fix-rls-simple.sql` if needed)
- Verify users have `is_active = true`
- Check browser console for errors

### Can't login with created users
- Make sure auth users are confirmed (auto-confirm was enabled)
- Try resetting password in Supabase Dashboard
- Check that email matches exactly (case-sensitive)

## 📝 Notes

- All phone numbers follow format: `+1-212-555-XXXX` (HQ) or country-specific formats
- All avatars are generated using DiceBear API
- Hire dates range from 2015-2021 for realistic distribution
- All users are set to `is_active = true`

