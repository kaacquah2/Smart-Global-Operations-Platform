-- =====================================================
-- SUPABASE SEED DATA FOR SGOAP (Smart Global Operations Platform)
-- =====================================================
-- This file contains initial seed data for the application
-- Run this AFTER running supabase-migration.sql
-- 
-- IMPORTANT: Before running this script, you need to:
-- 1. Create auth users in Supabase Dashboard (Authentication > Users)
-- 2. Replace the user IDs below with actual UUIDs from auth.users
-- 3. Or use the helper function at the bottom to create users programmatically
-- =====================================================

-- =====================================================
-- STEP 1: BRANCHES
-- =====================================================
-- Insert global branches/offices
INSERT INTO public.branches (id, name, country, city, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'New York HQ', 'United States', 'New York, NY', 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', 'London Office', 'United Kingdom', 'London, UK', 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Tokyo Operations', 'Japan', 'Tokyo, JP', 'active'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Sydney Branch', 'Australia', 'Sydney, AU', 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Toronto Center', 'Canada', 'Toronto, ON', 'active'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Singapore Hub', 'Singapore', 'Singapore, SG', 'active')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 2: DEPARTMENTS
-- =====================================================
-- Insert departments for each branch
INSERT INTO public.departments (id, name, branch_id) VALUES
  -- New York HQ Departments
  ('660e8400-e29b-41d4-a716-446655440001', 'Executive', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440002', 'IT', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Sales', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440004', 'Operations', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440005', 'Marketing', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440006', 'Human Resources', '550e8400-e29b-41d4-a716-446655440001'),
  
  -- London Office Departments
  ('660e8400-e29b-41d4-a716-446655440007', 'Sales', '550e8400-e29b-41d4-a716-446655440002'),
  ('660e8400-e29b-41d4-a716-446655440008', 'Operations', '550e8400-e29b-41d4-a716-446655440002'),
  ('660e8400-e29b-41d4-a716-446655440009', 'Finance', '550e8400-e29b-41d4-a716-446655440002'),
  
  -- Tokyo Operations Departments
  ('660e8400-e29b-41d4-a716-446655440010', 'Operations', '550e8400-e29b-41d4-a716-446655440003'),
  ('660e8400-e29b-41d4-a716-446655440011', 'Sales', '550e8400-e29b-41d4-a716-446655440003'),
  ('660e8400-e29b-41d4-a716-446655440012', 'IT', '550e8400-e29b-41d4-a716-446655440003'),
  
  -- Sydney Branch Departments
  ('660e8400-e29b-41d4-a716-446655440013', 'Sales', '550e8400-e29b-41d4-a716-446655440004'),
  ('660e8400-e29b-41d4-a716-446655440014', 'Operations', '550e8400-e29b-41d4-a716-446655440004'),
  
  -- Toronto Center Departments
  ('660e8400-e29b-41d4-a716-446655440015', 'Operations', '550e8400-e29b-41d4-a716-446655440005'),
  ('660e8400-e29b-41d4-a716-446655440016', 'Sales', '550e8400-e29b-41d4-a716-446655440005'),
  
  -- Singapore Hub Departments
  ('660e8400-e29b-41d4-a716-446655440017', 'Sales', '550e8400-e29b-41d4-a716-446655440006'),
  ('660e8400-e29b-41d4-a716-446655440018', 'Operations', '550e8400-e29b-41d4-a716-446655440006')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 3: USERS
-- =====================================================
-- IMPORTANT: Replace these UUIDs with actual auth.users IDs after creating users in Supabase Dashboard
-- Or see STEP 9 below for a helper function to create users programmatically

-- Admin User
-- Replace '11111111-1111-1111-1111-111111111111' with actual auth user ID
INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@sgoap.com', 'Alex Administrator', 'admin', 'IT', 'New York HQ', 'System Administrator', '+1-555-0100', '2020-01-01', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', true)
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

-- CEO User
-- Replace '22222222-2222-2222-2222-222222222222' with actual auth user ID
INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, is_active) VALUES
  ('22222222-2222-2222-2222-222222222222', 'ceo@sgoap.com', 'James Richardson', 'ceo', 'Executive', 'New York HQ', 'Chief Executive Officer', '+1-555-0127', '2015-01-01', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', true)
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

-- Executive User
-- Replace '33333333-3333-3333-3333-333333333333' with actual auth user ID
INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, is_active) VALUES
  ('33333333-3333-3333-3333-333333333333', 'executive@sgoap.com', 'Patricia Williams', 'executive', 'Executive', 'New York HQ', 'Vice President of Operations', '+1-555-0126', '2017-02-15', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia', true)
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

-- Manager User (New York)
-- Replace '44444444-4444-4444-4444-444444444444' with actual auth user ID
INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, manager_id, is_active) VALUES
  ('44444444-4444-4444-4444-444444444444', 'manager@sgoap.com', 'Michael Chen', 'manager', 'Operations', 'New York HQ', 'Operations Manager', '+1-555-0125', '2019-06-20', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', '33333333-3333-3333-3333-333333333333', true)
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
  manager_id = EXCLUDED.manager_id,
  is_active = EXCLUDED.is_active;

-- Department Head (Sales - New York)
-- Replace '55555555-5555-5555-5555-555555555555' with actual auth user ID
INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, manager_id, is_active) VALUES
  ('55555555-5555-5555-5555-555555555555', 'head@sgoap.com', 'Sarah Johnson', 'department_head', 'Sales', 'New York HQ', 'Sales Department Head', '+1-555-0124', '2020-01-10', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', '44444444-4444-4444-4444-444444444444', true)
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
  manager_id = EXCLUDED.manager_id,
  is_active = EXCLUDED.is_active;

-- Employee User (Sales - New York)
-- Replace '66666666-6666-6666-6666-666666666666' with actual auth user ID
INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, manager_id, is_active) VALUES
  ('66666666-6666-6666-6666-666666666666', 'employee@sgoap.com', 'John Smith', 'employee', 'Sales', 'New York HQ', 'Sales Associate', '+1-555-0123', '2022-03-15', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', '55555555-5555-5555-5555-555555555555', true)
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
  manager_id = EXCLUDED.manager_id,
  is_active = EXCLUDED.is_active;

-- Additional Employees for better demo data
-- Replace UUIDs with actual auth user IDs
INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, manager_id, is_active) VALUES
  ('77777777-7777-7777-7777-777777777777', 'james.mitchell@sgoap.com', 'James Mitchell', 'manager', 'Operations', 'London Office', 'Branch Manager', '+44-20-5555-0123', '2018-05-10', 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesMitchell', '33333333-3333-3333-3333-333333333333', true),
  ('88888888-8888-8888-8888-888888888888', 'yuki.tanaka@sgoap.com', 'Yuki Tanaka', 'manager', 'Operations', 'Tokyo Operations', 'Operations Manager', '+81-3-5555-0123', '2019-03-20', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki', '33333333-3333-3333-3333-333333333333', true),
  ('99999999-9999-9999-9999-999999999999', 'emma.wilson@sgoap.com', 'Emma Wilson', 'manager', 'Sales', 'Sydney Branch', 'Sales Manager', '+61-2-5555-0123', '2020-07-15', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', '33333333-3333-3333-3333-333333333333', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'priya.sharma@sgoap.com', 'Priya Sharma', 'department_head', 'Sales', 'Singapore Hub', 'Regional Sales Head', '+65-5555-0123', '2021-01-20', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', '99999999-9999-9999-9999-999999999999', true)
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
  manager_id = EXCLUDED.manager_id,
  is_active = EXCLUDED.is_active;

-- Update branch manager_id references
UPDATE public.branches SET manager_id = '55555555-5555-5555-5555-555555555555' WHERE name = 'New York HQ';
UPDATE public.branches SET manager_id = '77777777-7777-7777-7777-777777777777' WHERE name = 'London Office';
UPDATE public.branches SET manager_id = '88888888-8888-8888-8888-888888888888' WHERE name = 'Tokyo Operations';
UPDATE public.branches SET manager_id = '99999999-9999-9999-9999-999999999999' WHERE name = 'Sydney Branch';
UPDATE public.branches SET manager_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE name = 'Singapore Hub';

-- Update department head_id references
UPDATE public.departments SET head_id = '55555555-5555-5555-5555-555555555555' WHERE name = 'Sales' AND branch_id = '550e8400-e29b-41d4-a716-446655440001';

-- =====================================================
-- STEP 4: TASKS
-- =====================================================
-- Insert sample tasks across different branches and statuses
INSERT INTO public.tasks (id, title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
  ('ttt11111-1111-1111-1111-111111111111', 'Q2 Financial Audit', 'Complete comprehensive financial audit for all branches', 'completed', 'high', 'New York HQ', '55555555-5555-5555-5555-555555555555', 'Sarah Johnson', '2024-06-30', 100, '22222222-2222-2222-2222-222222222222'),
  ('ttt22222-2222-2222-2222-222222222222', 'Staff Performance Reviews', 'Conduct mid-year performance evaluations', 'in-progress', 'high', 'London Office', '77777777-7777-7777-7777-777777777777', 'James Mitchell', '2024-07-15', 68, '33333333-3333-3333-3333-333333333333'),
  ('ttt33333-3333-3333-3333-333333333333', 'System Infrastructure Upgrade', 'Upgrade data center infrastructure and network capacity', 'in-progress', 'critical', 'Tokyo Operations', '88888888-8888-8888-8888-888888888888', 'Yuki Tanaka', '2024-07-31', 45, '11111111-1111-1111-1111-111111111111'),
  ('ttt44444-4444-4444-4444-444444444444', 'Client Engagement Program', 'Launch new client engagement and retention program', 'pending', 'medium', 'Sydney Branch', '99999999-9999-9999-9999-999999999999', 'Emma Wilson', '2024-08-10', 12, '33333333-3333-3333-3333-333333333333'),
  ('ttt55555-5555-5555-5555-555555555555', 'Regulatory Compliance Update', 'Update all policies to match new regulatory requirements', 'pending', 'critical', 'Toronto Center', '44444444-4444-4444-4444-444444444444', 'Michael Chen', '2024-08-05', 5, '11111111-1111-1111-1111-111111111111'),
  ('ttt66666-6666-6666-6666-666666666666', 'Marketing Campaign Launch', 'Execute Q3 integrated marketing campaign', 'pending', 'high', 'Singapore Hub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Priya Sharma', '2024-07-20', 0, '33333333-3333-3333-3333-333333333333'),
  ('ttt77777-7777-7777-7777-777777777777', 'Training Program Development', 'Create comprehensive training program for new staff', 'in-progress', 'medium', 'New York HQ', '55555555-5555-5555-5555-555555555555', 'Sarah Johnson', '2024-07-25', 55, '44444444-4444-4444-4444-444444444444'),
  ('ttt88888-8888-8888-8888-888888888888', 'Disaster Recovery Plan', 'Develop and test disaster recovery procedures', 'completed', 'high', 'London Office', '77777777-7777-7777-7777-777777777777', 'James Mitchell', '2024-06-15', 100, '33333333-3333-3333-3333-333333333333'),
  ('ttt99999-9999-9999-9999-999999999999', 'Quarterly Business Review', 'Prepare and present Q2 business review to board', 'in-progress', 'high', 'New York HQ', '22222222-2222-2222-2222-222222222222', 'James Richardson', '2024-07-10', 75, '22222222-2222-2222-2222-222222222222'),
  ('tttaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'New Employee Onboarding', 'Create and implement new employee onboarding process', 'pending', 'medium', 'Tokyo Operations', '88888888-8888-8888-8888-888888888888', 'Yuki Tanaka', '2024-08-01', 20, '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 5: WORKFLOWS
-- =====================================================
-- Insert sample automation workflows
INSERT INTO public.workflows (id, name, description, trigger, actions, is_active, created_by) VALUES
  ('www11111-1111-1111-1111-111111111111', 'Critical Task Alert', 'Notify managers when task priority is marked Critical', 'When task priority is marked Critical', ARRAY['Send email notification', 'Create alert', 'Notify manager'], true, '11111111-1111-1111-1111-111111111111'),
  ('www22222-2222-2222-2222-222222222222', 'Daily Task Reminder', 'Send daily reminders for overdue tasks', 'Every day at specific time', ARRAY['Send email notification', 'Update dashboard'], true, '11111111-1111-1111-1111-111111111111'),
  ('www33333-3333-3333-3333-333333333333', 'Performance Drop Alert', 'Alert when branch performance drops below threshold', 'When performance drops below threshold', ARRAY['Send email notification', 'Create alert', 'Log to system'], true, '33333333-3333-3333-3333-333333333333'),
  ('www44444-4444-4444-4444-444444444444', 'Task Completion Workflow', 'Automated actions when task is completed', 'When task is completed', ARRAY['Update dashboard', 'Generate report', 'Notify team'], true, '44444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 6: NOTIFICATIONS
-- =====================================================
-- Insert sample notifications for different users
INSERT INTO public.notifications (id, user_id, type, title, description, read, created_at) VALUES
  ('nnn11111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'alert', 'Performance Alert', 'Tokyo branch performance dropped to 72%. Review recommended.', false, NOW() - INTERVAL '5 minutes'),
  ('nnn22222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'update', 'Q1 Analysis Complete', 'David Brown has completed the Q1 performance analysis. Ready for review.', false, NOW() - INTERVAL '2 hours'),
  ('nnn33333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'message', 'New Message from Sarah', 'Great progress on the Q1 analysis! Ready for review?', false, NOW() - INTERVAL '2 hours'),
  ('nnn44444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'achievement', 'Team Milestone Reached', 'Your team completed 100 tasks this month!', true, NOW() - INTERVAL '1 day'),
  ('nnn55555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'update', 'Database Optimization', 'Bob Smith finished database optimization. Performance improved by 45%.', true, NOW() - INTERVAL '1 day'),
  ('nnn66666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'alert', 'Overdue Task', 'API documentation update is now 2 days overdue.', true, NOW() - INTERVAL '2 days'),
  ('nnn77777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'alert', 'Budget Review Needed', 'London Office budget requires executive review.', false, NOW() - INTERVAL '30 minutes'),
  ('nnn88888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 'update', 'Board Meeting Scheduled', 'Q2 board meeting scheduled for next Friday.', false, NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 7: CONVERSATIONS AND MESSAGES
-- =====================================================
-- Create sample conversations
INSERT INTO public.conversations (id, name, is_group, participants, last_message_at, updated_at) VALUES
  ('ccc11111-1111-1111-1111-111111111111', 'Sarah Johnson', false, ARRAY['66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555']::UUID[], NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes'),
  ('ccc22222-2222-2222-2222-222222222222', 'Mike Chen', false, ARRAY['66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444']::UUID[], NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
  ('ccc33333-3333-3333-3333-333333333333', 'Patricia Williams', false, ARRAY['66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333']::UUID[], NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('ccc44444-4444-4444-4444-444444444444', 'Team Updates', true, ARRAY['66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444']::UUID[], NOW() - INTERVAL '9 hours', NOW() - INTERVAL '9 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert sample messages
INSERT INTO public.messages (id, conversation_id, sender_id, sender_name, content, read, created_at) VALUES
  ('mmm11111-1111-1111-1111-111111111111', 'ccc11111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Sarah Johnson', 'Hey, got time to discuss the Q1 report?', true, NOW() - INTERVAL '2 hours'),
  ('mmm22222-2222-2222-2222-222222222222', 'ccc11111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'John Smith', 'What would you like to know?', true, NOW() - INTERVAL '2 hours'),
  ('mmm33333-3333-3333-3333-333333333333', 'ccc11111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Sarah Johnson', 'Great work on the Q1 report!', false, NOW() - INTERVAL '10 minutes'),
  ('mmm44444-4444-4444-4444-444444444444', 'ccc22222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Michael Chen', 'When can you review my submission?', true, NOW() - INTERVAL '8 hours'),
  ('mmm55555-5555-5555-5555-555555555555', 'ccc33333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Patricia Williams', 'See you at the team meeting tomorrow', true, NOW() - INTERVAL '1 day'),
  ('mmm66666-6666-6666-6666-666666666666', 'ccc44444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Michael Chen', 'New project kickoff next Monday', true, NOW() - INTERVAL '9 hours')
ON CONFLICT (id) DO NOTHING;

-- Update conversations with last message info
UPDATE public.conversations SET last_message_id = 'mmm33333-3333-3333-3333-333333333333' WHERE id = 'ccc11111-1111-1111-1111-111111111111';
UPDATE public.conversations SET last_message_id = 'mmm44444-4444-4444-4444-444444444444' WHERE id = 'ccc22222-2222-2222-2222-222222222222';
UPDATE public.conversations SET last_message_id = 'mmm55555-5555-5555-5555-555555555555' WHERE id = 'ccc33333-3333-3333-3333-333333333333';
UPDATE public.conversations SET last_message_id = 'mmm66666-6666-6666-6666-666666666666' WHERE id = 'ccc44444-4444-4444-4444-444444444444';

-- =====================================================
-- STEP 8: WORK SUBMISSIONS
-- =====================================================
-- Insert sample work submissions
INSERT INTO public.work_submissions (id, employee_id, title, description, status, deadline, department, task_id, submitted_at) VALUES
  ('sss11111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Q1 Sales Report', 'Comprehensive Q1 sales analysis and projections', 'approved', '2024-03-31', 'Sales', 'ttt11111-1111-1111-1111-111111111111', '2024-03-28 14:30:00'),
  ('sss22222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Client Presentation Deck', 'Updated client presentation materials for Q2', 'under_review', '2024-07-15', 'Sales', 'ttt22222-2222-2222-2222-222222222222', '2024-07-12 10:15:00'),
  ('sss33333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Market Analysis Document', 'Regional market analysis and competitor research', 'draft', '2024-08-01', 'Sales', NULL, NULL),
  ('sss44444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'Training Materials', 'New employee training documentation', 'submitted', '2024-07-20', 'Sales', NULL, '2024-07-18 16:45:00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 9: HELPER FUNCTION TO CREATE AUTH USERS
-- =====================================================
-- This function helps create auth users and corresponding profile in one call
-- Usage: SELECT create_user_with_profile('email@example.com', 'password123', 'John Doe', 'employee', 'Sales', 'New York HQ', 'Sales Associate');

CREATE OR REPLACE FUNCTION create_user_with_profile(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role TEXT,
  p_department TEXT,
  p_branch TEXT,
  p_position TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_hire_date DATE DEFAULT CURRENT_DATE
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Create auth user
  -- Note: This requires the auth.users table to exist and proper permissions
  -- You may need to create users manually in Supabase Dashboard first
  -- Or use Supabase Admin API
  
  -- Generate a UUID for the user
  v_user_id := gen_random_uuid();
  
  -- Insert into public.users (the profile)
  -- You'll need to replace v_user_id with the actual auth.users.id after creating the auth user
  INSERT INTO public.users (id, email, name, role, department, branch, position, phone, hire_date, avatar, is_active)
  VALUES (
    v_user_id,
    LOWER(p_email),
    p_name,
    p_role,
    p_department,
    p_branch,
    p_position,
    p_phone,
    p_hire_date,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || REPLACE(p_name, ' ', ''),
    true
  );
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- NOTES AND NEXT STEPS
-- =====================================================
-- 
-- IMPORTANT: After running this seed file:
-- 
-- 1. Create auth users in Supabase Dashboard:
--    - Go to Authentication > Users
--    - Create users with the emails from STEP 3
--    - Use temporary passwords (users can change them)
--    - Copy the UUIDs from auth.users table
--    - Replace the placeholder UUIDs in STEP 3 with actual UUIDs
--    - Re-run STEP 3 with correct UUIDs
--
-- 2. Or use Supabase Admin API to create users programmatically:
--    - This allows creating auth users and profiles together
--    - Requires SERVICE_ROLE_KEY (keep this secret!)
--
-- 3. Verify data:
--    - Check that all branches are created
--    - Verify user profiles match auth users
--    - Test that tasks are visible
--    - Check notifications are showing
--
-- 4. Update passwords for initial users:
--    - Admin: admin@sgoap.com / admin123
--    - CEO: ceo@sgoap.com / password123
--    - Executive: executive@sgoap.com / password123
--    - Manager: manager@sgoap.com / password123
--    - Department Head: head@sgoap.com / password123
--    - Employee: employee@sgoap.com / password123
--
-- =====================================================

