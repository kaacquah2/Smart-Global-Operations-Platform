-- =====================================================
-- COMPREHENSIVE EMPLOYEE SEED DATA SCRIPT
-- Creates realistic employees, department heads, managers, executives, and CEO
-- =====================================================
-- 
-- IMPORTANT: Before running this script, you must create auth users first!
-- 
-- Method 1 (Recommended):
--   Use Supabase Dashboard > Authentication > Users > Add User
--   Create users with the emails listed below
--   Set temporary password: "Password123!" for all (change in production)
--   Enable "Auto Confirm Email" for testing
--
-- Method 2 (Programmatic):
--   Run: node scripts/create-all-employees-auth.js
--   This creates all auth users automatically
--
-- Then run this SQL script to create user profiles
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
  v_tokyo_branch_id UUID;
BEGIN
  SELECT id INTO v_hq_branch_id FROM public.branches WHERE name = 'New York HQ' LIMIT 1;
  SELECT id INTO v_london_branch_id FROM public.branches WHERE name = 'London Office' LIMIT 1;
  SELECT id INTO v_tokyo_branch_id FROM public.branches WHERE name = 'Tokyo Operations' LIMIT 1;

  -- HQ Departments
  IF v_hq_branch_id IS NOT NULL THEN
    INSERT INTO public.departments (id, name, branch_id) VALUES
      ('11111111-1111-1111-1111-111111111111', 'Human Resources (HR)', v_hq_branch_id),
      ('22222222-2222-2222-2222-222222222222', 'Finance & Accounting', v_hq_branch_id),
      ('33333333-3333-3333-3333-333333333333', 'Marketing & Communications', v_hq_branch_id),
      ('44444444-4444-4444-4444-444444444444', 'Sales & Business Development', v_hq_branch_id),
      ('55555555-5555-5555-5555-555555555555', 'Operations & Logistics', v_hq_branch_id),
      ('66666666-6666-6666-6666-666666666666', 'Information Technology (IT)', v_hq_branch_id),
      ('77777777-7777-7777-7777-777777777777', 'Research & Development (R&D)', v_hq_branch_id),
      ('88888888-8888-8888-8888-888888888888', 'Legal & Compliance', v_hq_branch_id),
      ('99999999-9999-9999-9999-999999999999', 'Procurement & Supply-Chain', v_hq_branch_id),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Customer Service & Support', v_hq_branch_id),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Facilities & Infrastructure', v_hq_branch_id),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Strategy & Corporate Development', v_hq_branch_id),
      ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Audit', v_hq_branch_id)
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

  IF v_tokyo_branch_id IS NOT NULL THEN
    INSERT INTO public.departments (id, name, branch_id) VALUES
      (gen_random_uuid(), 'Sales & Business Development', v_tokyo_branch_id),
      (gen_random_uuid(), 'Operations & Logistics', v_tokyo_branch_id),
      (gen_random_uuid(), 'Customer Service & Support', v_tokyo_branch_id),
      (gen_random_uuid(), 'Research & Development (R&D)', v_tokyo_branch_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 3: Create User Profiles
-- This script finds auth users by email and creates profiles
-- =====================================================
DO $$
DECLARE
  -- CEO and Executives
  v_ceo_id UUID;
  v_exec_strategy_id UUID;
  v_exec_operations_id UUID;
  v_exec_finance_id UUID;
  
  -- Department Heads (HQ)
  v_head_hr_id UUID;
  v_head_finance_id UUID;
  v_head_marketing_id UUID;
  v_head_sales_id UUID;
  v_head_ops_id UUID;
  v_head_it_id UUID;
  v_head_rd_id UUID;
  v_head_legal_id UUID;
  v_head_procurement_id UUID;
  v_head_customer_service_id UUID;
  v_head_facilities_id UUID;
  v_head_audit_id UUID;
  
  -- Managers
  v_manager_sales_id UUID;
  v_manager_hr_id UUID;
  v_manager_finance_id UUID;
  v_manager_it_id UUID;
  v_manager_ops_id UUID;
  
  -- Employees
  v_emp_hr_1_id UUID;
  v_emp_hr_2_id UUID;
  v_emp_finance_1_id UUID;
  v_emp_finance_2_id UUID;
  v_emp_marketing_1_id UUID;
  v_emp_marketing_2_id UUID;
  v_emp_sales_1_id UUID;
  v_emp_sales_2_id UUID;
  v_emp_sales_3_id UUID;
  v_emp_ops_1_id UUID;
  v_emp_ops_2_id UUID;
  v_emp_it_1_id UUID;
  v_emp_it_2_id UUID;
  v_emp_legal_1_id UUID;
  v_emp_procurement_1_id UUID;
  v_emp_customer_service_1_id UUID;
  v_emp_customer_service_2_id UUID;
  v_emp_rd_1_id UUID;
  v_emp_facilities_1_id UUID;
  v_emp_audit_1_id UUID;
  
  -- Branch Employees
  v_emp_london_sales_id UUID;
  v_emp_london_ops_id UUID;
  v_head_london_sales_id UUID;
  v_emp_tokyo_sales_id UUID;
  v_emp_tokyo_rd_id UUID;
  
  -- Branch references
  v_hq_branch_id UUID;
  v_london_branch_id UUID;
  v_tokyo_branch_id UUID;
BEGIN
  -- Get branch IDs
  SELECT id INTO v_hq_branch_id FROM public.branches WHERE name = 'New York HQ' LIMIT 1;
  SELECT id INTO v_london_branch_id FROM public.branches WHERE name = 'London Office' LIMIT 1;
  SELECT id INTO v_tokyo_branch_id FROM public.branches WHERE name = 'Tokyo Operations' LIMIT 1;

  -- ===================================================
  -- FIND AUTH USER IDs BY EMAIL
  -- ===================================================
  
  -- CEO and Executives
  SELECT id INTO v_ceo_id FROM auth.users WHERE email = 'ceo@sgoap.com' LIMIT 1;
  SELECT id INTO v_exec_strategy_id FROM auth.users WHERE email = 'executive.strategy@sgoap.com' LIMIT 1;
  SELECT id INTO v_exec_operations_id FROM auth.users WHERE email = 'executive.operations@sgoap.com' LIMIT 1;
  SELECT id INTO v_exec_finance_id FROM auth.users WHERE email = 'executive.finance@sgoap.com' LIMIT 1;
  
  -- Department Heads (HQ)
  SELECT id INTO v_head_hr_id FROM auth.users WHERE email = 'head.hr@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_finance_id FROM auth.users WHERE email = 'head.finance@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_marketing_id FROM auth.users WHERE email = 'head.marketing@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_sales_id FROM auth.users WHERE email = 'head.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_ops_id FROM auth.users WHERE email = 'head.operations@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_it_id FROM auth.users WHERE email = 'head.it@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_rd_id FROM auth.users WHERE email = 'head.rd@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_legal_id FROM auth.users WHERE email = 'head.legal@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_procurement_id FROM auth.users WHERE email = 'head.procurement@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_customer_service_id FROM auth.users WHERE email = 'head.customer.service@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_facilities_id FROM auth.users WHERE email = 'head.facilities@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_audit_id FROM auth.users WHERE email = 'head.audit@sgoap.com' LIMIT 1;
  
  -- Managers
  SELECT id INTO v_manager_sales_id FROM auth.users WHERE email = 'manager.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_manager_hr_id FROM auth.users WHERE email = 'manager.hr@sgoap.com' LIMIT 1;
  SELECT id INTO v_manager_finance_id FROM auth.users WHERE email = 'manager.finance@sgoap.com' LIMIT 1;
  SELECT id INTO v_manager_it_id FROM auth.users WHERE email = 'manager.it@sgoap.com' LIMIT 1;
  SELECT id INTO v_manager_ops_id FROM auth.users WHERE email = 'manager.operations@sgoap.com' LIMIT 1;
  
  -- Employees
  SELECT id INTO v_emp_hr_1_id FROM auth.users WHERE email = 'employee.hr.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_hr_2_id FROM auth.users WHERE email = 'employee.hr.2@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_finance_1_id FROM auth.users WHERE email = 'employee.finance.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_finance_2_id FROM auth.users WHERE email = 'employee.finance.2@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_marketing_1_id FROM auth.users WHERE email = 'employee.marketing.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_marketing_2_id FROM auth.users WHERE email = 'employee.marketing.2@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_sales_1_id FROM auth.users WHERE email = 'employee.sales.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_sales_2_id FROM auth.users WHERE email = 'employee.sales.2@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_sales_3_id FROM auth.users WHERE email = 'employee.sales.3@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_ops_1_id FROM auth.users WHERE email = 'employee.operations.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_ops_2_id FROM auth.users WHERE email = 'employee.operations.2@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_it_1_id FROM auth.users WHERE email = 'employee.it.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_it_2_id FROM auth.users WHERE email = 'employee.it.2@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_legal_1_id FROM auth.users WHERE email = 'employee.legal.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_procurement_1_id FROM auth.users WHERE email = 'employee.procurement.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_customer_service_1_id FROM auth.users WHERE email = 'employee.customer.service.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_customer_service_2_id FROM auth.users WHERE email = 'employee.customer.service.2@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_rd_1_id FROM auth.users WHERE email = 'employee.rd.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_facilities_1_id FROM auth.users WHERE email = 'employee.facilities.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_audit_1_id FROM auth.users WHERE email = 'employee.audit.1@sgoap.com' LIMIT 1;
  
  -- Branch Employees
  SELECT id INTO v_emp_london_sales_id FROM auth.users WHERE email = 'employee.london.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_london_ops_id FROM auth.users WHERE email = 'employee.london.operations@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_london_sales_id FROM auth.users WHERE email = 'head.london.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_tokyo_sales_id FROM auth.users WHERE email = 'employee.tokyo.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_tokyo_rd_id FROM auth.users WHERE email = 'employee.tokyo.rd@sgoap.com' LIMIT 1;

  -- ===================================================
  -- 1. CEO (Top of hierarchy)
  -- ===================================================
  IF v_ceo_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_ceo_id,
      'ceo@sgoap.com',
      'James Mitchell',
      'ceo',
      'Strategy & Corporate Development',
      'New York HQ',
      'Chief Executive Officer',
      '+1-212-555-0100',
      '2015-01-15',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesMitchell',
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
      is_active = EXCLUDED.is_active;
  END IF;

  -- ===================================================
  -- 2. EXECUTIVES (Report to CEO)
  -- ===================================================
  IF v_exec_strategy_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_exec_strategy_id,
      'executive.strategy@sgoap.com',
      'Sarah Chen',
      'executive',
      'Strategy & Corporate Development',
      'New York HQ',
      'Chief Strategy Officer',
      '+1-212-555-0101',
      '2017-03-20',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen',
      true,
      v_ceo_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_exec_operations_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_exec_operations_id,
      'executive.operations@sgoap.com',
      'Michael Rodriguez',
      'executive',
      'Operations & Logistics',
      'New York HQ',
      'Chief Operations Officer',
      '+1-212-555-0102',
      '2016-06-10',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=MichaelRodriguez',
      true,
      v_ceo_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_exec_finance_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_exec_finance_id,
      'executive.finance@sgoap.com',
      'David Thompson',
      'executive',
      'Finance & Accounting',
      'New York HQ',
      'Chief Financial Officer',
      '+1-212-555-0103',
      '2016-08-05',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=DavidThompson',
      true,
      v_ceo_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- ===================================================
  -- 3. DEPARTMENT HEADS (Report to Executives)
  -- ===================================================
  
  -- HR Head
  IF v_head_hr_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_hr_id,
      'head.hr@sgoap.com',
      'Jennifer Martinez',
      'department_head',
      'Human Resources (HR)',
      'New York HQ',
      'Director of Human Resources',
      '+1-212-555-0201',
      '2018-02-14',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=JenniferMartinez',
      true,
      v_exec_strategy_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Finance Head
  IF v_head_finance_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_finance_id,
      'head.finance@sgoap.com',
      'Robert Kim',
      'department_head',
      'Finance & Accounting',
      'New York HQ',
      'Director of Finance',
      '+1-212-555-0202',
      '2017-11-08',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=RobertKim',
      true,
      v_exec_finance_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Marketing Head
  IF v_head_marketing_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_marketing_id,
      'head.marketing@sgoap.com',
      'Emily Watson',
      'department_head',
      'Marketing & Communications',
      'New York HQ',
      'Director of Marketing',
      '+1-212-555-0203',
      '2018-05-22',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=EmilyWatson',
      true,
      v_exec_strategy_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Sales Head
  IF v_head_sales_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_sales_id,
      'head.sales@sgoap.com',
      'Christopher Anderson',
      'department_head',
      'Sales & Business Development',
      'New York HQ',
      'Director of Sales',
      '+1-212-555-0204',
      '2017-09-12',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=ChristopherAnderson',
      true,
      v_exec_strategy_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Operations Head
  IF v_head_ops_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_ops_id,
      'head.operations@sgoap.com',
      'Amanda Foster',
      'department_head',
      'Operations & Logistics',
      'New York HQ',
      'Director of Operations',
      '+1-212-555-0205',
      '2018-01-30',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=AmandaFoster',
      true,
      v_exec_operations_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- IT Head
  IF v_head_it_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_it_id,
      'head.it@sgoap.com',
      'Kevin Park',
      'department_head',
      'Information Technology (IT)',
      'New York HQ',
      'Director of Information Technology',
      '+1-212-555-0206',
      '2017-04-18',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=KevinPark',
      true,
      v_exec_operations_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- R&D Head
  IF v_head_rd_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_rd_id,
      'head.rd@sgoap.com',
      'Lisa Johnson',
      'department_head',
      'Research & Development (R&D)',
      'New York HQ',
      'Director of Research & Development',
      '+1-212-555-0207',
      '2016-12-03',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=LisaJohnson',
      true,
      v_exec_strategy_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Legal Head
  IF v_head_legal_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_legal_id,
      'head.legal@sgoap.com',
      'Thomas Wilson',
      'department_head',
      'Legal & Compliance',
      'New York HQ',
      'Director of Legal & Compliance',
      '+1-212-555-0208',
      '2017-07-25',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=ThomasWilson',
      true,
      v_exec_strategy_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Procurement Head
  IF v_head_procurement_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_procurement_id,
      'head.procurement@sgoap.com',
      'Patricia Brown',
      'department_head',
      'Procurement & Supply-Chain',
      'New York HQ',
      'Director of Procurement',
      '+1-212-555-0209',
      '2018-09-11',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=PatriciaBrown',
      true,
      v_exec_operations_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Customer Service Head
  IF v_head_customer_service_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_customer_service_id,
      'head.customer.service@sgoap.com',
      'Daniel Lee',
      'department_head',
      'Customer Service & Support',
      'New York HQ',
      'Director of Customer Service',
      '+1-212-555-0210',
      '2018-03-07',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=DanielLee',
      true,
      v_exec_operations_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Facilities Head
  IF v_head_facilities_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_facilities_id,
      'head.facilities@sgoap.com',
      'Michelle Taylor',
      'department_head',
      'Facilities & Infrastructure',
      'New York HQ',
      'Director of Facilities',
      '+1-212-555-0211',
      '2017-10-19',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=MichelleTaylor',
      true,
      v_exec_operations_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Audit Head
  IF v_head_audit_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_audit_id,
      'head.audit@sgoap.com',
      'Richard Moore',
      'department_head',
      'Audit',
      'New York HQ',
      'Director of Audit',
      '+1-212-555-0212',
      '2017-06-14',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=RichardMoore',
      true,
      v_exec_finance_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- ===================================================
  -- 4. MANAGERS (Report to Department Heads)
  -- ===================================================
  
  IF v_manager_sales_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_manager_sales_id,
      'manager.sales@sgoap.com',
      'Jessica White',
      'manager',
      'Sales & Business Development',
      'New York HQ',
      'Sales Manager',
      '+1-212-555-0301',
      '2019-01-15',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=JessicaWhite',
      true,
      v_head_sales_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_manager_hr_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_manager_hr_id,
      'manager.hr@sgoap.com',
      'Brian Clark',
      'manager',
      'Human Resources (HR)',
      'New York HQ',
      'HR Manager',
      '+1-212-555-0302',
      '2019-03-22',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=BrianClark',
      true,
      v_head_hr_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_manager_finance_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_manager_finance_id,
      'manager.finance@sgoap.com',
      'Nicole Garcia',
      'manager',
      'Finance & Accounting',
      'New York HQ',
      'Finance Manager',
      '+1-212-555-0303',
      '2019-05-10',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=NicoleGarcia',
      true,
      v_head_finance_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_manager_it_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_manager_it_id,
      'manager.it@sgoap.com',
      'Ryan Adams',
      'manager',
      'Information Technology (IT)',
      'New York HQ',
      'IT Manager',
      '+1-212-555-0304',
      '2018-11-05',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=RyanAdams',
      true,
      v_head_it_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_manager_ops_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_manager_ops_id,
      'manager.operations@sgoap.com',
      'Stephanie Hill',
      'manager',
      'Operations & Logistics',
      'New York HQ',
      'Operations Manager',
      '+1-212-555-0305',
      '2019-02-18',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=StephanieHill',
      true,
      v_head_ops_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- ===================================================
  -- 5. EMPLOYEES (Report to Managers or Department Heads)
  -- ===================================================
  
  -- HR Employees
  IF v_emp_hr_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_hr_1_id,
      'employee.hr.1@sgoap.com',
      'Ashley Turner',
      'employee',
      'Human Resources (HR)',
      'New York HQ',
      'HR Specialist',
      '+1-212-555-0401',
      '2020-07-01',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=AshleyTurner',
      true,
      v_manager_hr_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_emp_hr_2_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_hr_2_id,
      'employee.hr.2@sgoap.com',
      'Matthew Phillips',
      'employee',
      'Human Resources (HR)',
      'New York HQ',
      'HR Coordinator',
      '+1-212-555-0402',
      '2021-03-15',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=MatthewPhillips',
      true,
      v_manager_hr_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Finance Employees
  IF v_emp_finance_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_finance_1_id,
      'employee.finance.1@sgoap.com',
      'Ryan Martinez',
      'employee',
      'Finance & Accounting',
      'New York HQ',
      'Financial Analyst',
      '+1-212-555-0403',
      '2020-09-10',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=RyanMartinez',
      true,
      v_manager_finance_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_emp_finance_2_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_finance_2_id,
      'employee.finance.2@sgoap.com',
      'Lauren Cooper',
      'employee',
      'Finance & Accounting',
      'New York HQ',
      'Accountant',
      '+1-212-555-0404',
      '2021-01-20',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=LaurenCooper',
      true,
      v_manager_finance_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Marketing Employees
  IF v_emp_marketing_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_marketing_1_id,
      'employee.marketing.1@sgoap.com',
      'Brandon Scott',
      'employee',
      'Marketing & Communications',
      'New York HQ',
      'Marketing Specialist',
      '+1-212-555-0405',
      '2020-05-12',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=BrandonScott',
      true,
      v_head_marketing_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_emp_marketing_2_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_marketing_2_id,
      'employee.marketing.2@sgoap.com',
      'Samantha Green',
      'employee',
      'Marketing & Communications',
      'New York HQ',
      'Content Writer',
      '+1-212-555-0406',
      '2021-06-08',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=SamanthaGreen',
      true,
      v_head_marketing_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Sales Employees
  IF v_emp_sales_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_sales_1_id,
      'employee.sales.1@sgoap.com',
      'Justin Hall',
      'employee',
      'Sales & Business Development',
      'New York HQ',
      'Sales Representative',
      '+1-212-555-0407',
      '2020-08-22',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=JustinHall',
      true,
      v_manager_sales_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_emp_sales_2_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_sales_2_id,
      'employee.sales.2@sgoap.com',
      'Megan Lewis',
      'employee',
      'Sales & Business Development',
      'New York HQ',
      'Sales Representative',
      '+1-212-555-0408',
      '2020-11-03',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=MeganLewis',
      true,
      v_manager_sales_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_emp_sales_3_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_sales_3_id,
      'employee.sales.3@sgoap.com',
      'Tyler Walker',
      'employee',
      'Sales & Business Development',
      'New York HQ',
      'Business Development Specialist',
      '+1-212-555-0409',
      '2021-04-19',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=TylerWalker',
      true,
      v_manager_sales_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Operations Employees
  IF v_emp_ops_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_ops_1_id,
      'employee.operations.1@sgoap.com',
      'Cameron Young',
      'employee',
      'Operations & Logistics',
      'New York HQ',
      'Operations Coordinator',
      '+1-212-555-0410',
      '2020-12-07',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=CameronYoung',
      true,
      v_manager_ops_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_emp_ops_2_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_ops_2_id,
      'employee.operations.2@sgoap.com',
      'Rachel King',
      'employee',
      'Operations & Logistics',
      'New York HQ',
      'Logistics Specialist',
      '+1-212-555-0411',
      '2021-02-14',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=RachelKing',
      true,
      v_manager_ops_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- IT Employees
  IF v_emp_it_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_it_1_id,
      'employee.it.1@sgoap.com',
      'Jordan Wright',
      'employee',
      'Information Technology (IT)',
      'New York HQ',
      'Software Developer',
      '+1-212-555-0412',
      '2020-04-30',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=JordanWright',
      true,
      v_manager_it_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_emp_it_2_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_it_2_id,
      'employee.it.2@sgoap.com',
      'Alexis Lopez',
      'employee',
      'Information Technology (IT)',
      'New York HQ',
      'Systems Administrator',
      '+1-212-555-0413',
      '2021-07-25',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexisLopez',
      true,
      v_manager_it_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Legal Employee
  IF v_emp_legal_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_legal_1_id,
      'employee.legal.1@sgoap.com',
      'Jonathan Baker',
      'employee',
      'Legal & Compliance',
      'New York HQ',
      'Legal Counsel',
      '+1-212-555-0414',
      '2020-10-11',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=JonathanBaker',
      true,
      v_head_legal_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Procurement Employee
  IF v_emp_procurement_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_procurement_1_id,
      'employee.procurement.1@sgoap.com',
      'Victoria Harris',
      'employee',
      'Procurement & Supply-Chain',
      'New York HQ',
      'Procurement Specialist',
      '+1-212-555-0415',
      '2021-05-28',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=VictoriaHarris',
      true,
      v_head_procurement_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Customer Service Employees
  IF v_emp_customer_service_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_customer_service_1_id,
      'employee.customer.service.1@sgoap.com',
      'Nathan Collins',
      'employee',
      'Customer Service & Support',
      'New York HQ',
      'Customer Support Representative',
      '+1-212-555-0416',
      '2020-06-16',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=NathanCollins',
      true,
      v_head_customer_service_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_emp_customer_service_2_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_customer_service_2_id,
      'employee.customer.service.2@sgoap.com',
      'Olivia Stewart',
      'employee',
      'Customer Service & Support',
      'New York HQ',
      'Customer Support Representative',
      '+1-212-555-0417',
      '2021-08-09',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=OliviaStewart',
      true,
      v_head_customer_service_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- R&D Employee
  IF v_emp_rd_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_rd_1_id,
      'employee.rd.1@sgoap.com',
      'Eric Murphy',
      'employee',
      'Research & Development (R&D)',
      'New York HQ',
      'Research Scientist',
      '+1-212-555-0418',
      '2020-03-25',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=EricMurphy',
      true,
      v_head_rd_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Facilities Employee
  IF v_emp_facilities_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_facilities_1_id,
      'employee.facilities.1@sgoap.com',
      'Kimberly Rivera',
      'employee',
      'Facilities & Infrastructure',
      'New York HQ',
      'Facilities Coordinator',
      '+1-212-555-0419',
      '2021-09-12',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=KimberlyRivera',
      true,
      v_head_facilities_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- Audit Employee
  IF v_emp_audit_1_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_audit_1_id,
      'employee.audit.1@sgoap.com',
      'Derek Campbell',
      'employee',
      'Audit',
      'New York HQ',
      'Internal Auditor',
      '+1-212-555-0420',
      '2020-11-18',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=DerekCampbell',
      true,
      v_head_audit_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- ===================================================
  -- 6. BRANCH EMPLOYEES (London Office)
  -- ===================================================
  
  IF v_head_london_sales_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_head_london_sales_id,
      'head.london.sales@sgoap.com',
      'Emma Wilson',
      'department_head',
      'Sales & Business Development',
      'London Office',
      'Director of Sales (London)',
      '+44-20-5555-0101',
      '2018-08-20',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=EmmaWilson',
      true,
      v_exec_strategy_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_emp_london_sales_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_london_sales_id,
      'employee.london.sales@sgoap.com',
      'Oliver Smith',
      'employee',
      'Sales & Business Development',
      'London Office',
      'Sales Representative',
      '+44-20-5555-0102',
      '2020-09-05',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=OliverSmith',
      true,
      v_head_london_sales_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_emp_london_ops_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_london_ops_id,
      'employee.london.operations@sgoap.com',
      'Sophie Brown',
      'employee',
      'Operations & Logistics',
      'London Office',
      'Operations Coordinator',
      '+44-20-5555-0103',
      '2021-01-10',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=SophieBrown',
      true,
      v_head_ops_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  -- ===================================================
  -- 7. BRANCH EMPLOYEES (Tokyo Operations)
  -- ===================================================
  
  IF v_emp_tokyo_sales_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_tokyo_sales_id,
      'employee.tokyo.sales@sgoap.com',
      'Hiroshi Tanaka',
      'employee',
      'Sales & Business Development',
      'Tokyo Operations',
      'Sales Representative',
      '+81-3-5555-0101',
      '2020-07-22',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=HiroshiTanaka',
      true,
      v_head_sales_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  IF v_emp_tokyo_rd_id IS NOT NULL THEN
    INSERT INTO public.users (
      id, email, name, role, department, branch, position, 
      phone, hire_date, avatar, is_active, manager_id
    ) VALUES (
      v_emp_tokyo_rd_id,
      'employee.tokyo.rd@sgoap.com',
      'Yuki Nakamura',
      'employee',
      'Research & Development (R&D)',
      'Tokyo Operations',
      'Research Scientist',
      '+81-3-5555-0102',
      '2021-03-08',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=YukiNakamura',
      true,
      v_head_rd_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      manager_id = EXCLUDED.manager_id;
  END IF;

  RAISE NOTICE 'Employee seed data completed successfully!';
  RAISE NOTICE 'Total users created/updated: Check public.users table';
  
END $$;

