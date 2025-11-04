-- =====================================================
-- COMPREHENSIVE USER LOGIN CREDENTIALS SETUP
-- Creates users for all roles: Employees, Department Heads, Admins
-- For both Headquarters and Branch offices
-- =====================================================
-- 
-- IMPORTANT: Before running this script, you must create auth users first!
-- 
-- Method 1 (Recommended for Development):
--   Use Supabase Dashboard > Authentication > Users > Add User
--   Create users with the emails listed below
--   Set temporary passwords (users will change on first login)
--
-- Method 2 (Programmatic):
--   Use Supabase Management API or Admin SDK to create auth users
--   Then run this script to create profiles
--
-- Method 3 (SQL - Requires superuser access):
--   Uncomment the auth user creation section at the bottom
--   NOTE: This requires direct database access
-- =====================================================

-- =====================================================
-- STEP 1: Ensure branches exist
-- =====================================================
INSERT INTO public.branches (id, name, country, city, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'New York HQ', 'United States', 'New York, NY', 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'London Office', 'United Kingdom', 'London, UK', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Tokyo Operations', 'Japan', 'Tokyo, JP', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  city = EXCLUDED.city,
  status = EXCLUDED.status;

-- =====================================================
-- STEP 2: Ensure departments exist
-- =====================================================
DO $$
DECLARE
  v_hq_branch_id UUID;
  v_london_branch_id UUID;
BEGIN
  SELECT id INTO v_hq_branch_id FROM public.branches WHERE name = 'New York HQ' LIMIT 1;
  SELECT id INTO v_london_branch_id FROM public.branches WHERE name = 'London Office' LIMIT 1;

  -- HQ Departments
  IF v_hq_branch_id IS NOT NULL THEN
    INSERT INTO public.departments (id, name, branch_id) VALUES
      ('11111111-1111-1111-1111-111111111111', 'Human Resources (HR)', v_hq_branch_id),
      ('22222222-2222-2222-2222-222222222222', 'Finance & Accounting', v_hq_branch_id),
      ('33333333-3333-3333-3333-333333333333', 'Marketing & Communications', v_hq_branch_id),
      ('44444444-4444-4444-4444-444444444444', 'Sales & Business Development', v_hq_branch_id),
      ('55555555-5555-5555-5555-555555555555', 'Operations & Logistics', v_hq_branch_id),
      ('66666666-6666-6666-6666-666666666666', 'Information Technology (IT)', v_hq_branch_id),
      ('88888888-8888-8888-8888-888888888888', 'Legal & Compliance', v_hq_branch_id),
      ('99999999-9999-9999-9999-999999999999', 'Procurement & Supply-Chain', v_hq_branch_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Branch Departments
  IF v_london_branch_id IS NOT NULL THEN
    INSERT INTO public.departments (id, name, branch_id) VALUES
      (gen_random_uuid(), 'Sales & Business Development', v_london_branch_id),
      (gen_random_uuid(), 'Operations & Logistics', v_london_branch_id),
      (gen_random_uuid(), 'Customer Service & Support', v_london_branch_id),
      (gen_random_uuid(), 'Finance & Accounting', v_london_branch_id),
      (gen_random_uuid(), 'Human Resources (HR)', v_london_branch_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 3: Create User Profiles (references auth.users)
-- This function automatically finds auth user IDs by email
-- =====================================================
DO $$
DECLARE
  -- Auth user IDs (will be populated from auth.users)
  v_admin_id UUID;
  v_hq_emp_hr_id UUID;
  v_hq_emp_finance_id UUID;
  v_hq_emp_marketing_id UUID;
  v_hq_head_hr_id UUID;
  v_hq_head_finance_id UUID;
  v_hq_head_legal_id UUID;
  v_branch_emp_sales_id UUID;
  v_branch_emp_ops_id UUID;
  v_branch_head_sales_id UUID;
  v_branch_head_finance_id UUID;
  
  -- Department IDs
  v_hq_hr_dept UUID;
  v_hq_finance_dept UUID;
  v_hq_marketing_dept UUID;
  v_hq_legal_dept UUID;
  v_branch_sales_dept UUID;
  v_branch_ops_dept UUID;
  v_branch_finance_dept UUID;
BEGIN
  -- ===================================================
  -- FIND AUTH USER IDs BY EMAIL
  -- ===================================================
  -- These users MUST exist in auth.users first!
  -- Create them via Supabase Dashboard or Management API
  
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@sgoap.com' LIMIT 1;
  SELECT id INTO v_hq_emp_hr_id FROM auth.users WHERE email = 'employee.hq.hr@sgoap.com' LIMIT 1;
  SELECT id INTO v_hq_emp_finance_id FROM auth.users WHERE email = 'employee.hq.finance@sgoap.com' LIMIT 1;
  SELECT id INTO v_hq_emp_marketing_id FROM auth.users WHERE email = 'employee.hq.marketing@sgoap.com' LIMIT 1;
  SELECT id INTO v_hq_head_hr_id FROM auth.users WHERE email = 'head.hq.hr@sgoap.com' LIMIT 1;
  SELECT id INTO v_hq_head_finance_id FROM auth.users WHERE email = 'head.hq.finance@sgoap.com' LIMIT 1;
  SELECT id INTO v_hq_head_legal_id FROM auth.users WHERE email = 'head.hq.legal@sgoap.com' LIMIT 1;
  SELECT id INTO v_branch_emp_sales_id FROM auth.users WHERE email = 'employee.branch.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_branch_emp_ops_id FROM auth.users WHERE email = 'employee.branch.ops@sgoap.com' LIMIT 1;
  SELECT id INTO v_branch_head_sales_id FROM auth.users WHERE email = 'head.branch.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_branch_head_finance_id FROM auth.users WHERE email = 'head.branch.finance@sgoap.com' LIMIT 1;

  -- Get Department IDs
  SELECT id INTO v_hq_hr_dept FROM public.departments WHERE name = 'Human Resources (HR)' AND branch_id = (SELECT id FROM public.branches WHERE name = 'New York HQ' LIMIT 1) LIMIT 1;
  SELECT id INTO v_hq_finance_dept FROM public.departments WHERE name = 'Finance & Accounting' AND branch_id = (SELECT id FROM public.branches WHERE name = 'New York HQ' LIMIT 1) LIMIT 1;
  SELECT id INTO v_hq_marketing_dept FROM public.departments WHERE name = 'Marketing & Communications' AND branch_id = (SELECT id FROM public.branches WHERE name = 'New York HQ' LIMIT 1) LIMIT 1;
  SELECT id INTO v_hq_legal_dept FROM public.departments WHERE name = 'Legal & Compliance' AND branch_id = (SELECT id FROM public.branches WHERE name = 'New York HQ' LIMIT 1) LIMIT 1;
  SELECT id INTO v_branch_sales_dept FROM public.departments WHERE name = 'Sales & Business Development' AND branch_id = (SELECT id FROM public.branches WHERE name = 'London Office' LIMIT 1) LIMIT 1;
  SELECT id INTO v_branch_ops_dept FROM public.departments WHERE name = 'Operations & Logistics' AND branch_id = (SELECT id FROM public.branches WHERE name = 'London Office' LIMIT 1) LIMIT 1;
  SELECT id INTO v_branch_finance_dept FROM public.departments WHERE name = 'Finance & Accounting' AND branch_id = (SELECT id FROM public.branches WHERE name = 'London Office' LIMIT 1) LIMIT 1;

  -- ===================================================
  -- 1. ADMIN USER (Headquarters)
  -- ===================================================
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_admin_id,
      'admin@sgoap.com',
      'System Administrator',
      'admin',
      'Information Technology (IT)',
      'New York HQ',
      'System Administrator',
      '+1-555-0001',
      '2020-01-01',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
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
      is_active = EXCLUDED.is_active;
    
    RAISE NOTICE 'Created Admin user: admin@sgoap.com';
  ELSE
    RAISE WARNING 'Admin auth user not found! Create auth user with email: admin@sgoap.com';
  END IF;

  -- ===================================================
  -- 2. HEADQUARTERS EMPLOYEES
  -- ===================================================
  
  -- HQ Employee - HR Department
  IF v_hq_emp_hr_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position,
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_hq_emp_hr_id,
      'employee.hq.hr@sgoap.com',
      'Sarah Johnson',
      'employee',
      'Human Resources (HR)',
      'New York HQ',
      'HR Coordinator',
      '+1-555-1001',
      '2023-03-15',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahHR',
      true,
      v_hq_head_hr_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar,
      is_active = EXCLUDED.is_active, manager_id = EXCLUDED.manager_id;
    
    RAISE NOTICE 'Created HQ Employee (HR): employee.hq.hr@sgoap.com';
  ELSE
    RAISE WARNING 'HQ HR Employee auth user not found! Create auth user with email: employee.hq.hr@sgoap.com';
  END IF;

  -- HQ Employee - Finance Department
  IF v_hq_emp_finance_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position,
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_hq_emp_finance_id,
      'employee.hq.finance@sgoap.com',
      'David Martinez',
      'employee',
      'Finance & Accounting',
      'New York HQ',
      'Junior Accountant',
      '+1-555-1002',
      '2023-05-20',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidFinance',
      true,
      v_hq_head_finance_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar,
      is_active = EXCLUDED.is_active, manager_id = EXCLUDED.manager_id;
    
    RAISE NOTICE 'Created HQ Employee (Finance): employee.hq.finance@sgoap.com';
  ELSE
    RAISE WARNING 'HQ Finance Employee auth user not found! Create auth user with email: employee.hq.finance@sgoap.com';
  END IF;

  -- HQ Employee - Marketing Department
  IF v_hq_emp_marketing_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position,
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_hq_emp_marketing_id,
      'employee.hq.marketing@sgoap.com',
      'Emily Chen',
      'employee',
      'Marketing & Communications',
      'New York HQ',
      'Marketing Specialist',
      '+1-555-1003',
      '2023-07-10',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=EmilyMarketing',
      true,
      NULL -- Will be set when head is created
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar,
      is_active = EXCLUDED.is_active;
    
    RAISE NOTICE 'Created HQ Employee (Marketing): employee.hq.marketing@sgoap.com';
  ELSE
    RAISE WARNING 'HQ Marketing Employee auth user not found! Create auth user with email: employee.hq.marketing@sgoap.com';
  END IF;

  -- ===================================================
  -- 3. HEADQUARTERS DEPARTMENT HEADS
  -- ===================================================
  
  -- HQ Department Head - HR
  IF v_hq_head_hr_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position,
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_hq_head_hr_id,
      'head.hq.hr@sgoap.com',
      'Jennifer Thompson',
      'department_head',
      'Human Resources (HR)',
      'New York HQ',
      'HR Director',
      '+1-555-2001',
      '2018-02-01',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=JenniferHR',
      true,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar,
      is_active = EXCLUDED.is_active;

    -- Update department head_id
    UPDATE public.departments SET head_id = v_hq_head_hr_id 
    WHERE id = v_hq_hr_dept;

    -- Update HR employee's manager_id
    UPDATE public.users SET manager_id = v_hq_head_hr_id 
    WHERE id = v_hq_emp_hr_id AND v_hq_emp_hr_id IS NOT NULL;
    
    RAISE NOTICE 'Created HQ Department Head (HR): head.hq.hr@sgoap.com';
  ELSE
    RAISE WARNING 'HQ HR Head auth user not found! Create auth user with email: head.hq.hr@sgoap.com';
  END IF;

  -- HQ Department Head - Finance
  IF v_hq_head_finance_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position,
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_hq_head_finance_id,
      'head.hq.finance@sgoap.com',
      'Robert Anderson',
      'department_head',
      'Finance & Accounting',
      'New York HQ',
      'CFO',
      '+1-555-2002',
      '2017-06-15',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=RobertFinance',
      true,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar,
      is_active = EXCLUDED.is_active;

    -- Update department head_id
    UPDATE public.departments SET head_id = v_hq_head_finance_id 
    WHERE id = v_hq_finance_dept;

    -- Update Finance employee's manager_id
    UPDATE public.users SET manager_id = v_hq_head_finance_id 
    WHERE id = v_hq_emp_finance_id AND v_hq_emp_finance_id IS NOT NULL;
    
    RAISE NOTICE 'Created HQ Department Head (Finance): head.hq.finance@sgoap.com';
  ELSE
    RAISE WARNING 'HQ Finance Head auth user not found! Create auth user with email: head.hq.finance@sgoap.com';
  END IF;

  -- HQ Department Head - Legal
  IF v_hq_head_legal_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position,
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_hq_head_legal_id,
      'head.hq.legal@sgoap.com',
      'Amanda Williams',
      'department_head',
      'Legal & Compliance',
      'New York HQ',
      'General Counsel',
      '+1-555-2003',
      '2016-09-01',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=AmandaLegal',
      true,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar,
      is_active = EXCLUDED.is_active;

    -- Update department head_id
    UPDATE public.departments SET head_id = v_hq_head_legal_id 
    WHERE id = v_hq_legal_dept;
    
    RAISE NOTICE 'Created HQ Department Head (Legal): head.hq.legal@sgoap.com';
  ELSE
    RAISE WARNING 'HQ Legal Head auth user not found! Create auth user with email: head.hq.legal@sgoap.com';
  END IF;

  -- ===================================================
  -- 4. BRANCH EMPLOYEES
  -- ===================================================
  
  -- Branch Employee - Sales (London)
  IF v_branch_emp_sales_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position,
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_branch_emp_sales_id,
      'employee.branch.sales@sgoap.com',
      'James Mitchell',
      'employee',
      'Sales & Business Development',
      'London Office',
      'Sales Representative',
      '+44-20-5555-1001',
      '2023-04-12',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesSales',
      true,
      v_branch_head_sales_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar,
      is_active = EXCLUDED.is_active, manager_id = EXCLUDED.manager_id;
    
    RAISE NOTICE 'Created Branch Employee (Sales): employee.branch.sales@sgoap.com';
  ELSE
    RAISE WARNING 'Branch Sales Employee auth user not found! Create auth user with email: employee.branch.sales@sgoap.com';
  END IF;

  -- Branch Employee - Operations (London)
  IF v_branch_emp_ops_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position,
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_branch_emp_ops_id,
      'employee.branch.ops@sgoap.com',
      'Sophie Brown',
      'employee',
      'Operations & Logistics',
      'London Office',
      'Operations Coordinator',
      '+44-20-5555-1002',
      '2023-06-05',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=SophieOps',
      true,
      NULL -- Will be set when head is created
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar,
      is_active = EXCLUDED.is_active;
    
    RAISE NOTICE 'Created Branch Employee (Operations): employee.branch.ops@sgoap.com';
  ELSE
    RAISE WARNING 'Branch Operations Employee auth user not found! Create auth user with email: employee.branch.ops@sgoap.com';
  END IF;

  -- ===================================================
  -- 5. BRANCH DEPARTMENT HEADS
  -- ===================================================
  
  -- Branch Department Head - Sales (London)
  IF v_branch_head_sales_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position,
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_branch_head_sales_id,
      'head.branch.sales@sgoap.com',
      'Michael O''Connor',
      'department_head',
      'Sales & Business Development',
      'London Office',
      'Sales Manager',
      '+44-20-5555-2001',
      '2019-03-20',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=MichaelSales',
      true,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar,
      is_active = EXCLUDED.is_active;

    -- Update department head_id
    IF v_branch_sales_dept IS NOT NULL THEN
      UPDATE public.departments SET head_id = v_branch_head_sales_id 
      WHERE id = v_branch_sales_dept;
    END IF;

    -- Update Sales employee's manager_id
    UPDATE public.users SET manager_id = v_branch_head_sales_id 
    WHERE id = v_branch_emp_sales_id AND v_branch_emp_sales_id IS NOT NULL;
    
    RAISE NOTICE 'Created Branch Department Head (Sales): head.branch.sales@sgoap.com';
  ELSE
    RAISE WARNING 'Branch Sales Head auth user not found! Create auth user with email: head.branch.sales@sgoap.com';
  END IF;

  -- Branch Department Head - Finance (London)
  IF v_branch_head_finance_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position,
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_branch_head_finance_id,
      'head.branch.finance@sgoap.com',
      'Lisa Chang',
      'department_head',
      'Finance & Accounting',
      'London Office',
      'Finance Manager',
      '+44-20-5555-2002',
      '2018-11-10',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=LisaFinance',
      true,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar,
      is_active = EXCLUDED.is_active;

    -- Update department head_id
    IF v_branch_finance_dept IS NOT NULL THEN
      UPDATE public.departments SET head_id = v_branch_head_finance_id 
      WHERE id = v_branch_finance_dept;
    END IF;
    
    RAISE NOTICE 'Created Branch Department Head (Finance): head.branch.finance@sgoap.com';
  ELSE
    RAISE WARNING 'Branch Finance Head auth user not found! Create auth user with email: head.branch.finance@sgoap.com';
  END IF;

END $$;

-- =====================================================
-- SUMMARY: LOGIN CREDENTIALS
-- =====================================================
-- After creating auth users and running this script, login with:
--
-- ADMIN (Headquarters):
--   Email: admin@sgoap.com
--   Password: [Set in Supabase Dashboard]
--
-- HQ EMPLOYEES:
--   Email: employee.hq.hr@sgoap.com
--   Email: employee.hq.finance@sgoap.com
--   Email: employee.hq.marketing@sgoap.com
--
-- HQ DEPARTMENT HEADS:
--   Email: head.hq.hr@sgoap.com
--   Email: head.hq.finance@sgoap.com
--   Email: head.hq.legal@sgoap.com
--
-- BRANCH EMPLOYEES:
--   Email: employee.branch.sales@sgoap.com
--   Email: employee.branch.ops@sgoap.com
--
-- BRANCH DEPARTMENT HEADS:
--   Email: head.branch.sales@sgoap.com
--   Email: head.branch.finance@sgoap.com
--
-- =====================================================
-- OPTIONAL: Create Auth Users via SQL (Requires superuser)
-- =====================================================
-- Uncomment below if you have direct database access
-- NOTE: This is typically not recommended for production
-- =====================================================

/*
-- This requires the pgcrypto extension and direct database access
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create auth user (if you have superuser privileges)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Admin user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@sgoap.com',
    crypt('Admin123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;
  
  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE 'Created auth user: admin@sgoap.com with password: Admin123!';
  END IF;
  
  -- Repeat for other users...
END $$;
*/

