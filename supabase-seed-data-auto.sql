-- =====================================================
-- AUTOMATED SUPABASE SEED DATA
-- This version automatically finds auth user IDs by email
-- =====================================================
-- Run this AFTER:
-- 1. Running supabase-migration.sql
-- 2. Creating auth users in Supabase Dashboard (Authentication > Users)
--
-- This script will automatically match emails to auth user IDs
-- =====================================================

-- =====================================================
-- STEP 1: BRANCHES (No dependencies)
-- =====================================================
INSERT INTO public.branches (id, name, country, city, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'New York HQ', 'United States', 'New York, NY', 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'London Office', 'United Kingdom', 'London, UK', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Tokyo Operations', 'Japan', 'Tokyo, JP', 'active'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Sydney Branch', 'Australia', 'Sydney, AU', 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Toronto Center', 'Canada', 'Toronto, ON', 'active'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Singapore Hub', 'Singapore', 'Singapore, SG', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  city = EXCLUDED.city,
  status = EXCLUDED.status;

-- =====================================================
-- STEP 2: CREATE USERS (Automatically finds auth user IDs)
-- =====================================================
-- This function creates or updates user profiles by matching email
DO $$
DECLARE
  v_admin_id UUID;
  v_ceo_id UUID;
  v_executive_id UUID;
  v_manager_id UUID;
  v_head_id UUID;
  v_employee_id UUID;
  v_james_id UUID;
  v_yuki_id UUID;
  v_emma_id UUID;
  v_priya_id UUID;
BEGIN
  -- Find auth user IDs by email (they must exist in auth.users first!)
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@sgoap.com';
  SELECT id INTO v_ceo_id FROM auth.users WHERE email = 'ceo@sgoap.com';
  SELECT id INTO v_executive_id FROM auth.users WHERE email = 'executive@sgoap.com';
  SELECT id INTO v_manager_id FROM auth.users WHERE email = 'manager@sgoap.com';
  SELECT id INTO v_head_id FROM auth.users WHERE email = 'head@sgoap.com';
  SELECT id INTO v_employee_id FROM auth.users WHERE email = 'employee@sgoap.com';
  SELECT id INTO v_james_id FROM auth.users WHERE email = 'james.mitchell@sgoap.com';
  SELECT id INTO v_yuki_id FROM auth.users WHERE email = 'yuki.tanaka@sgoap.com';
  SELECT id INTO v_emma_id FROM auth.users WHERE email = 'emma.wilson@sgoap.com';
  SELECT id INTO v_priya_id FROM auth.users WHERE email = 'priya.sharma@sgoap.com';

  -- Admin User
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, is_active)
    VALUES (v_admin_id, 'admin@sgoap.com', 'Alex Administrator', 'admin', 'IT', 'New York HQ', 'System Administrator', '+1-555-0100', '2020-01-01', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar, is_active = EXCLUDED.is_active;
  END IF;

  -- CEO User
  IF v_ceo_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, is_active)
    VALUES (v_ceo_id, 'ceo@sgoap.com', 'James Richardson', 'ceo', 'Executive', 'New York HQ', 'Chief Executive Officer', '+1-555-0127', '2015-01-01', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar, is_active = EXCLUDED.is_active;
  END IF;

  -- Executive User
  IF v_executive_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, is_active)
    VALUES (v_executive_id, 'executive@sgoap.com', 'Patricia Williams', 'executive', 'Executive', 'New York HQ', 'Vice President of Operations', '+1-555-0126', '2017-02-15', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia', true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar, is_active = EXCLUDED.is_active;
  END IF;

  -- Manager User
  IF v_manager_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, manager_id, is_active)
    VALUES (v_manager_id, 'manager@sgoap.com', 'Michael Chen', 'manager', 'Operations', 'New York HQ', 'Operations Manager', '+1-555-0125', '2019-06-20', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', v_executive_id, true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar, manager_id = EXCLUDED.manager_id, is_active = EXCLUDED.is_active;
  END IF;

  -- Department Head User
  IF v_head_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, manager_id, is_active)
    VALUES (v_head_id, 'head@sgoap.com', 'Sarah Johnson', 'department_head', 'Sales', 'New York HQ', 'Sales Department Head', '+1-555-0124', '2020-01-10', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', v_manager_id, true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar, manager_id = EXCLUDED.manager_id, is_active = EXCLUDED.is_active;
  END IF;

  -- Employee User
  IF v_employee_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, manager_id, is_active)
    VALUES (v_employee_id, 'employee@sgoap.com', 'John Smith', 'employee', 'Sales', 'New York HQ', 'Sales Associate', '+1-555-0123', '2022-03-15', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', v_head_id, true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar, manager_id = EXCLUDED.manager_id, is_active = EXCLUDED.is_active;
  END IF;

  -- Additional Managers
  IF v_james_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, manager_id, is_active)
    VALUES (v_james_id, 'james.mitchell@sgoap.com', 'James Mitchell', 'manager', 'Operations', 'London Office', 'Branch Manager', '+44-20-5555-0123', '2018-05-10', 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesMitchell', v_executive_id, true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar, manager_id = EXCLUDED.manager_id, is_active = EXCLUDED.is_active;
  END IF;

  IF v_yuki_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, manager_id, is_active)
    VALUES (v_yuki_id, 'yuki.tanaka@sgoap.com', 'Yuki Tanaka', 'manager', 'Operations', 'Tokyo Operations', 'Operations Manager', '+81-3-5555-0123', '2019-03-20', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki', v_executive_id, true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar, manager_id = EXCLUDED.manager_id, is_active = EXCLUDED.is_active;
  END IF;

  IF v_emma_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, manager_id, is_active)
    VALUES (v_emma_id, 'emma.wilson@sgoap.com', 'Emma Wilson', 'manager', 'Sales', 'Sydney Branch', 'Sales Manager', '+61-2-5555-0123', '2020-07-15', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', v_executive_id, true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar, manager_id = EXCLUDED.manager_id, is_active = EXCLUDED.is_active;
  END IF;

  IF v_priya_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, manager_id, is_active)
    VALUES (v_priya_id, 'priya.sharma@sgoap.com', 'Priya Sharma', 'department_head', 'Sales', 'Singapore Hub', 'Regional Sales Head', '+65-5555-0123', '2021-01-20', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', v_emma_id, true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role,
      department = EXCLUDED.department, branch = EXCLUDED.branch,
      position = EXCLUDED.position, phone = EXCLUDED.phone,
      hire_date = EXCLUDED.hire_date, avatar = EXCLUDED.avatar, manager_id = EXCLUDED.manager_id, is_active = EXCLUDED.is_active;
  END IF;

  -- Update branch manager references
  IF v_head_id IS NOT NULL THEN
    UPDATE public.branches SET manager_id = v_head_id WHERE name = 'New York HQ';
  END IF;
  IF v_james_id IS NOT NULL THEN
    UPDATE public.branches SET manager_id = v_james_id WHERE name = 'London Office';
  END IF;
  IF v_yuki_id IS NOT NULL THEN
    UPDATE public.branches SET manager_id = v_yuki_id WHERE name = 'Tokyo Operations';
  END IF;
  IF v_emma_id IS NOT NULL THEN
    UPDATE public.branches SET manager_id = v_emma_id WHERE name = 'Sydney Branch';
  END IF;
  IF v_priya_id IS NOT NULL THEN
    UPDATE public.branches SET manager_id = v_priya_id WHERE name = 'Singapore Hub';
  END IF;

  RAISE NOTICE 'User profiles created/updated successfully. Found % users.', 
    (SELECT COUNT(*) FROM public.users);
END $$;

-- =====================================================
-- STEP 3: DEPARTMENTS
-- =====================================================
INSERT INTO public.departments (id, name, branch_id) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Executive', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440002', 'IT', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Sales', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440004', 'Operations', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440005', 'Marketing', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440006', 'Human Resources', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440007', 'Sales', '550e8400-e29b-41d4-a716-446655440002'),
  ('660e8400-e29b-41d4-a716-446655440008', 'Operations', '550e8400-e29b-41d4-a716-446655440002'),
  ('660e8400-e29b-41d4-a716-446655440009', 'Finance', '550e8400-e29b-41d4-a716-446655440002'),
  ('660e8400-e29b-41d4-a716-446655440010', 'Operations', '550e8400-e29b-41d4-a716-446655440003'),
  ('660e8400-e29b-41d4-a716-446655440011', 'Sales', '550e8400-e29b-41d4-a716-446655440003'),
  ('660e8400-e29b-41d4-a716-446655440012', 'IT', '550e8400-e29b-41d4-a716-446655440003'),
  ('660e8400-e29b-41d4-a716-446655440013', 'Sales', '550e8400-e29b-41d4-a716-446655440004'),
  ('660e8400-e29b-41d4-a716-446655440014', 'Operations', '550e8400-e29b-41d4-a716-446655440004'),
  ('660e8400-e29b-41d4-a716-446655440015', 'Operations', '550e8400-e29b-41d4-a716-446655440005'),
  ('660e8400-e29b-41d4-a716-446655440016', 'Sales', '550e8400-e29b-41d4-a716-446655440005'),
  ('660e8400-e29b-41d4-a716-446655440017', 'Sales', '550e8400-e29b-41d4-a716-446655440006'),
  ('660e8400-e29b-41d4-a716-446655440018', 'Operations', '550e8400-e29b-41d4-a716-446655440006')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  branch_id = EXCLUDED.branch_id;

-- Update department head_id for Sales in New York
DO $$
DECLARE
  v_head_id UUID;
BEGIN
  SELECT id INTO v_head_id FROM public.users WHERE email = 'head@sgoap.com';
  IF v_head_id IS NOT NULL THEN
    UPDATE public.departments SET head_id = v_head_id 
    WHERE name = 'Sales' AND branch_id = '550e8400-e29b-41d4-a716-446655440001';
  END IF;
END $$;

-- =====================================================
-- STEP 4: TASKS (Uses email lookup for user IDs)
-- =====================================================
DO $$
DECLARE
  v_ceo_id UUID;
  v_executive_id UUID;
  v_admin_id UUID;
  v_manager_id UUID;
  v_head_id UUID;
  v_james_id UUID;
  v_yuki_id UUID;
  v_emma_id UUID;
  v_priya_id UUID;
BEGIN
  -- Lookup user IDs
  SELECT id INTO v_ceo_id FROM public.users WHERE email = 'ceo@sgoap.com';
  SELECT id INTO v_executive_id FROM public.users WHERE email = 'executive@sgoap.com';
  SELECT id INTO v_admin_id FROM public.users WHERE email = 'admin@sgoap.com';
  SELECT id INTO v_manager_id FROM public.users WHERE email = 'manager@sgoap.com';
  SELECT id INTO v_head_id FROM public.users WHERE email = 'head@sgoap.com';
  SELECT id INTO v_james_id FROM public.users WHERE email = 'james.mitchell@sgoap.com';
  SELECT id INTO v_yuki_id FROM public.users WHERE email = 'yuki.tanaka@sgoap.com';
  SELECT id INTO v_emma_id FROM public.users WHERE email = 'emma.wilson@sgoap.com';
  SELECT id INTO v_priya_id FROM public.users WHERE email = 'priya.sharma@sgoap.com';

  -- Insert tasks (only if users exist)
  IF v_head_id IS NOT NULL AND v_ceo_id IS NOT NULL THEN
    INSERT INTO public.tasks (id, title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('ttt11111-1111-1111-1111-111111111111', 'Q2 Financial Audit', 'Complete comprehensive financial audit for all branches', 'completed', 'high', 'New York HQ', v_head_id, 'Sarah Johnson', '2024-06-30', 100, v_ceo_id),
      ('ttt77777-7777-7777-7777-777777777777', 'Training Program Development', 'Create comprehensive training program for new staff', 'in-progress', 'medium', 'New York HQ', v_head_id, 'Sarah Johnson', '2024-07-25', 55, v_manager_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_james_id IS NOT NULL AND v_executive_id IS NOT NULL THEN
    INSERT INTO public.tasks (id, title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('ttt22222-2222-2222-2222-222222222222', 'Staff Performance Reviews', 'Conduct mid-year performance evaluations', 'in-progress', 'high', 'London Office', v_james_id, 'James Mitchell', '2024-07-15', 68, v_executive_id),
      ('ttt88888-8888-8888-8888-888888888888', 'Disaster Recovery Plan', 'Develop and test disaster recovery procedures', 'completed', 'high', 'London Office', v_james_id, 'James Mitchell', '2024-06-15', 100, v_executive_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_yuki_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
    INSERT INTO public.tasks (id, title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('ttt33333-3333-3333-3333-333333333333', 'System Infrastructure Upgrade', 'Upgrade data center infrastructure and network capacity', 'in-progress', 'critical', 'Tokyo Operations', v_yuki_id, 'Yuki Tanaka', '2024-07-31', 45, v_admin_id),
      ('tttaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'New Employee Onboarding', 'Create and implement new employee onboarding process', 'pending', 'medium', 'Tokyo Operations', v_yuki_id, 'Yuki Tanaka', '2024-08-01', 20, v_manager_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_emma_id IS NOT NULL AND v_executive_id IS NOT NULL THEN
    INSERT INTO public.tasks (id, title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('ttt44444-4444-4444-4444-444444444444', 'Client Engagement Program', 'Launch new client engagement and retention program', 'pending', 'medium', 'Sydney Branch', v_emma_id, 'Emma Wilson', '2024-08-10', 12, v_executive_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_manager_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
    INSERT INTO public.tasks (id, title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('ttt55555-5555-5555-5555-555555555555', 'Regulatory Compliance Update', 'Update all policies to match new regulatory requirements', 'pending', 'critical', 'Toronto Center', v_manager_id, 'Michael Chen', '2024-08-05', 5, v_admin_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_priya_id IS NOT NULL AND v_executive_id IS NOT NULL THEN
    INSERT INTO public.tasks (id, title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('ttt66666-6666-6666-6666-666666666666', 'Marketing Campaign Launch', 'Execute Q3 integrated marketing campaign', 'pending', 'high', 'Singapore Hub', v_priya_id, 'Priya Sharma', '2024-07-20', 0, v_executive_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_ceo_id IS NOT NULL THEN
    INSERT INTO public.tasks (id, title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('ttt99999-9999-9999-9999-999999999999', 'Quarterly Business Review', 'Prepare and present Q2 business review to board', 'in-progress', 'high', 'New York HQ', v_ceo_id, 'James Richardson', '2024-07-10', 75, v_ceo_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 5: WORKFLOWS
-- =====================================================
DO $$
DECLARE
  v_admin_id UUID;
  v_executive_id UUID;
  v_manager_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM public.users WHERE email = 'admin@sgoap.com';
  SELECT id INTO v_executive_id FROM public.users WHERE email = 'executive@sgoap.com';
  SELECT id INTO v_manager_id FROM public.users WHERE email = 'manager@sgoap.com';

  IF v_admin_id IS NOT NULL AND v_executive_id IS NOT NULL AND v_manager_id IS NOT NULL THEN
    INSERT INTO public.workflows (id, name, description, trigger, actions, is_active, created_by) VALUES
      ('www11111-1111-1111-1111-111111111111', 'Critical Task Alert', 'Notify managers when task priority is marked Critical', 'When task priority is marked Critical', ARRAY['Send email notification', 'Create alert', 'Notify manager'], true, v_admin_id),
      ('www22222-2222-2222-2222-222222222222', 'Daily Task Reminder', 'Send daily reminders for overdue tasks', 'Every day at specific time', ARRAY['Send email notification', 'Update dashboard'], true, v_admin_id),
      ('www33333-3333-3333-3333-333333333333', 'Performance Drop Alert', 'Alert when branch performance drops below threshold', 'When performance drops below threshold', ARRAY['Send email notification', 'Create alert', 'Log to system'], true, v_executive_id),
      ('www44444-4444-4444-4444-444444444444', 'Task Completion Workflow', 'Automated actions when task is completed', 'When task is completed', ARRAY['Update dashboard', 'Generate report', 'Notify team'], true, v_manager_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 6: NOTIFICATIONS
-- =====================================================
DO $$
DECLARE
  v_head_id UUID;
  v_employee_id UUID;
  v_manager_id UUID;
  v_executive_id UUID;
  v_ceo_id UUID;
BEGIN
  SELECT id INTO v_head_id FROM public.users WHERE email = 'head@sgoap.com';
  SELECT id INTO v_employee_id FROM public.users WHERE email = 'employee@sgoap.com';
  SELECT id INTO v_manager_id FROM public.users WHERE email = 'manager@sgoap.com';
  SELECT id INTO v_executive_id FROM public.users WHERE email = 'executive@sgoap.com';
  SELECT id INTO v_ceo_id FROM public.users WHERE email = 'ceo@sgoap.com';

  IF v_head_id IS NOT NULL THEN
    INSERT INTO public.notifications (id, user_id, type, title, description, read, created_at) VALUES
      ('nnn11111-1111-1111-1111-111111111111', v_head_id, 'alert', 'Performance Alert', 'Tokyo branch performance dropped to 72%. Review recommended.', false, NOW() - INTERVAL '5 minutes'),
      ('nnn22222-2222-2222-2222-222222222222', v_head_id, 'update', 'Q1 Analysis Complete', 'David Brown has completed the Q1 performance analysis. Ready for review.', false, NOW() - INTERVAL '2 hours')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_employee_id IS NOT NULL THEN
    INSERT INTO public.notifications (id, user_id, type, title, description, read, created_at) VALUES
      ('nnn33333-3333-3333-3333-333333333333', v_employee_id, 'message', 'New Message from Sarah', 'Great progress on the Q1 analysis! Ready for review?', false, NOW() - INTERVAL '2 hours'),
      ('nnn44444-4444-4444-4444-444444444444', v_employee_id, 'achievement', 'Team Milestone Reached', 'Your team completed 100 tasks this month!', true, NOW() - INTERVAL '1 day'),
      ('nnn66666-6666-6666-6666-666666666666', v_employee_id, 'alert', 'Overdue Task', 'API documentation update is now 2 days overdue.', true, NOW() - INTERVAL '2 days')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_manager_id IS NOT NULL THEN
    INSERT INTO public.notifications (id, user_id, type, title, description, read, created_at) VALUES
      ('nnn55555-5555-5555-5555-555555555555', v_manager_id, 'update', 'Database Optimization', 'Bob Smith finished database optimization. Performance improved by 45%.', true, NOW() - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_executive_id IS NOT NULL THEN
    INSERT INTO public.notifications (id, user_id, type, title, description, read, created_at) VALUES
      ('nnn77777-7777-7777-7777-777777777777', v_executive_id, 'alert', 'Budget Review Needed', 'London Office budget requires executive review.', false, NOW() - INTERVAL '30 minutes')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_ceo_id IS NOT NULL THEN
    INSERT INTO public.notifications (id, user_id, type, title, description, read, created_at) VALUES
      ('nnn88888-8888-8888-8888-888888888888', v_ceo_id, 'update', 'Board Meeting Scheduled', 'Q2 board meeting scheduled for next Friday.', false, NOW() - INTERVAL '1 hour')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- STEP 7: CONVERSATIONS AND MESSAGES
-- =====================================================
DO $$
DECLARE
  v_employee_id UUID;
  v_head_id UUID;
  v_manager_id UUID;
  v_executive_id UUID;
  v_msg1_id UUID;
  v_msg2_id UUID;
  v_msg3_id UUID;
  v_msg4_id UUID;
BEGIN
  SELECT id INTO v_employee_id FROM public.users WHERE email = 'employee@sgoap.com';
  SELECT id INTO v_head_id FROM public.users WHERE email = 'head@sgoap.com';
  SELECT id INTO v_manager_id FROM public.users WHERE email = 'manager@sgoap.com';
  SELECT id INTO v_executive_id FROM public.users WHERE email = 'executive@sgoap.com';

  IF v_employee_id IS NOT NULL AND v_head_id IS NOT NULL AND v_manager_id IS NOT NULL AND v_executive_id IS NOT NULL THEN
    -- Create conversations
    INSERT INTO public.conversations (id, name, is_group, participants, last_message_at, updated_at) VALUES
      ('ccc11111-1111-1111-1111-111111111111', 'Sarah Johnson', false, ARRAY[v_employee_id, v_head_id]::UUID[], NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes'),
      ('ccc22222-2222-2222-2222-222222222222', 'Mike Chen', false, ARRAY[v_employee_id, v_manager_id]::UUID[], NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
      ('ccc33333-3333-3333-3333-333333333333', 'Patricia Williams', false, ARRAY[v_employee_id, v_executive_id]::UUID[], NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
      ('ccc44444-4444-4444-4444-444444444444', 'Team Updates', true, ARRAY[v_employee_id, v_head_id, v_manager_id]::UUID[], NOW() - INTERVAL '9 hours', NOW() - INTERVAL '9 hours')
    ON CONFLICT (id) DO NOTHING;

    -- Create messages
    INSERT INTO public.messages (id, conversation_id, sender_id, sender_name, content, read, created_at) VALUES
      ('mmm11111-1111-1111-1111-111111111111', 'ccc11111-1111-1111-1111-111111111111', v_head_id, 'Sarah Johnson', 'Hey, got time to discuss the Q1 report?', true, NOW() - INTERVAL '2 hours'),
      ('mmm22222-2222-2222-2222-222222222222', 'ccc11111-1111-1111-1111-111111111111', v_employee_id, 'John Smith', 'What would you like to know?', true, NOW() - INTERVAL '2 hours'),
      ('mmm33333-3333-3333-3333-333333333333', 'ccc11111-1111-1111-1111-111111111111', v_head_id, 'Sarah Johnson', 'Great work on the Q1 report!', false, NOW() - INTERVAL '10 minutes'),
      ('mmm44444-4444-4444-4444-444444444444', 'ccc22222-2222-2222-2222-222222222222', v_manager_id, 'Michael Chen', 'When can you review my submission?', true, NOW() - INTERVAL '8 hours'),
      ('mmm55555-5555-5555-5555-555555555555', 'ccc33333-3333-3333-3333-333333333333', v_executive_id, 'Patricia Williams', 'See you at the team meeting tomorrow', true, NOW() - INTERVAL '1 day'),
      ('mmm66666-6666-6666-6666-666666666666', 'ccc44444-4444-4444-4444-444444444444', v_manager_id, 'Michael Chen', 'New project kickoff next Monday', true, NOW() - INTERVAL '9 hours')
    ON CONFLICT (id) DO NOTHING;

    -- Update conversations with last message
    UPDATE public.conversations SET last_message_id = 'mmm33333-3333-3333-3333-333333333333' WHERE id = 'ccc11111-1111-1111-1111-111111111111';
    UPDATE public.conversations SET last_message_id = 'mmm44444-4444-4444-4444-444444444444' WHERE id = 'ccc22222-2222-2222-2222-222222222222';
    UPDATE public.conversations SET last_message_id = 'mmm55555-5555-5555-5555-555555555555' WHERE id = 'ccc33333-3333-3333-3333-333333333333';
    UPDATE public.conversations SET last_message_id = 'mmm66666-6666-6666-6666-666666666666' WHERE id = 'ccc44444-4444-4444-4444-444444444444';
  END IF;
END $$;

-- =====================================================
-- STEP 8: WORK SUBMISSIONS
-- =====================================================
DO $$
DECLARE
  v_employee_id UUID;
BEGIN
  SELECT id INTO v_employee_id FROM public.users WHERE email = 'employee@sgoap.com';

  IF v_employee_id IS NOT NULL THEN
    INSERT INTO public.work_submissions (id, employee_id, title, description, status, deadline, department, task_id, submitted_at) VALUES
      ('sss11111-1111-1111-1111-111111111111', v_employee_id, 'Q1 Sales Report', 'Comprehensive Q1 sales analysis and projections', 'approved', '2024-03-31', 'Sales', 'ttt11111-1111-1111-1111-111111111111', '2024-03-28 14:30:00'),
      ('sss22222-2222-2222-2222-222222222222', v_employee_id, 'Client Presentation Deck', 'Updated client presentation materials for Q2', 'under_review', '2024-07-15', 'Sales', 'ttt22222-2222-2222-2222-222222222222', '2024-07-12 10:15:00'),
      ('sss33333-3333-3333-3333-333333333333', v_employee_id, 'Market Analysis Document', 'Regional market analysis and competitor research', 'draft', '2024-08-01', 'Sales', NULL, NULL),
      ('sss44444-4444-4444-4444-444444444444', v_employee_id, 'Training Materials', 'New employee training documentation', 'submitted', '2024-07-20', 'Sales', NULL, '2024-07-18 16:45:00')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Seed data insertion complete!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Branches: %', (SELECT COUNT(*) FROM public.branches);
  RAISE NOTICE 'Users: %', (SELECT COUNT(*) FROM public.users);
  RAISE NOTICE 'Tasks: %', (SELECT COUNT(*) FROM public.tasks);
  RAISE NOTICE 'Workflows: %', (SELECT COUNT(*) FROM public.workflows);
  RAISE NOTICE 'Notifications: %', (SELECT COUNT(*) FROM public.notifications);
  RAISE NOTICE 'Conversations: %', (SELECT COUNT(*) FROM public.conversations);
  RAISE NOTICE 'Messages: %', (SELECT COUNT(*) FROM public.messages);
  RAISE NOTICE 'Work Submissions: %', (SELECT COUNT(*) FROM public.work_submissions);
  RAISE NOTICE '========================================';
END $$;

