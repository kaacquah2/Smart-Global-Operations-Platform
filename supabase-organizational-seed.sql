-- =====================================================
-- ORGANIZATIONAL FEATURES SEED DATA
-- Run this AFTER supabase-organizational-features.sql
-- =====================================================

-- =====================================================
-- LEAVE TYPES
-- =====================================================
INSERT INTO public.leave_types (id, name, description, max_days_per_year, carry_forward, requires_approval, color, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Annual Leave', 'Paid annual vacation days', 20, true, true, '#3b82f6', true),
  ('22222222-2222-2222-2222-222222222222', 'Sick Leave', 'Medical leave for illness', 10, false, false, '#ef4444', true),
  ('33333333-3333-3333-3333-333333333333', 'Personal Leave', 'Personal time off', 5, false, true, '#8b5cf6', true),
  ('44444444-4444-4444-4444-444444444444', 'Maternity Leave', 'Maternity/paternity leave', 90, false, true, '#ec4899', true),
  ('55555555-5555-5555-5555-555555555555', 'Bereavement Leave', 'Leave for family loss', 5, false, false, '#6b7280', true),
  ('66666666-6666-6666-6666-666666666666', 'Study Leave', 'Educational and training leave', 10, false, true, '#10b981', true),
  ('77777777-7777-7777-7777-777777777777', 'Unpaid Leave', 'Extended unpaid time off', 0, false, true, '#f59e0b', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLICY CATEGORIES
-- =====================================================
INSERT INTO public.policy_categories (id, name, description, icon, display_order, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'HR Policies', 'Human resources and employee policies', 'users', 1, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Code of Conduct', 'Company ethics and behavior standards', 'shield', 2, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'IT & Security', 'Technology and data security policies', 'lock', 3, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Health & Safety', 'Workplace health and safety guidelines', 'heart', 4, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Financial', 'Financial procedures and expense policies', 'dollar-sign', 5, true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Remote Work', 'Remote and hybrid work policies', 'home', 6, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SAMPLE POLICIES
-- =====================================================
DO $$
DECLARE
  v_admin_id UUID;
  v_ceo_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM public.users WHERE email = 'admin@sgoap.com';
  SELECT id INTO v_ceo_id FROM public.users WHERE email = 'ceo@sgoap.com';

  IF v_admin_id IS NOT NULL AND v_ceo_id IS NOT NULL THEN
    INSERT INTO public.policies (id, title, description, category_id, version, status, applies_to_roles, effective_date, created_by, approved_by) VALUES
      ('10000000-0000-0000-0000-000000000001', 'Employee Handbook', 'Comprehensive guide to company policies and procedures', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1.0', 'published', ARRAY['all']::TEXT[], CURRENT_DATE, v_admin_id, v_ceo_id),
      ('10000000-0000-0000-0000-000000000002', 'Remote Work Policy', 'Guidelines for remote and hybrid work arrangements', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2.1', 'published', ARRAY['all']::TEXT[], CURRENT_DATE, v_admin_id, v_ceo_id),
      ('10000000-0000-0000-0000-000000000003', 'Data Security Policy', 'IT security and data protection guidelines', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '1.5', 'published', ARRAY['all']::TEXT[], CURRENT_DATE, v_admin_id, v_ceo_id),
      ('10000000-0000-0000-0000-000000000004', 'Code of Conduct', 'Standards of professional behavior and ethics', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '1.0', 'published', ARRAY['all']::TEXT[], CURRENT_DATE, v_ceo_id, v_ceo_id),
      ('10000000-0000-0000-0000-000000000005', 'Expense Reimbursement', 'Procedures for business expense claims', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '1.2', 'published', ARRAY['employee', 'manager', 'executive']::TEXT[], CURRENT_DATE, v_admin_id, v_ceo_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- KNOWLEDGE BASE CATEGORIES
-- =====================================================
INSERT INTO public.kb_categories (id, name, description, icon, display_order, is_active) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Getting Started', 'Onboarding and setup guides', 'book-open', 1, true),
  ('20000000-0000-0000-0000-000000000002', 'How-To Guides', 'Step-by-step instructions', 'help-circle', 2, true),
  ('20000000-0000-0000-0000-000000000003', 'Troubleshooting', 'Common issues and solutions', 'tool', 3, true),
  ('20000000-0000-0000-0000-000000000004', 'Best Practices', 'Recommended workflows and tips', 'star', 4, true),
  ('20000000-0000-0000-0000-000000000005', 'FAQs', 'Frequently asked questions', 'message-circle', 5, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SAMPLE KNOWLEDGE BASE ARTICLES
-- =====================================================
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM public.users WHERE email = 'admin@sgoap.com';

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.kb_articles (id, title, content, category_id, tags, status, author_id, featured) VALUES
      ('30000000-0000-0000-0000-000000000001', 'Welcome to SGOAP', 'Welcome to the Smart Global Operations Platform. This guide will help you get started...', '20000000-0000-0000-0000-000000000001', ARRAY['onboarding', 'getting-started']::TEXT[], 'published', v_admin_id, true),
      ('30000000-0000-0000-0000-000000000002', 'How to Submit Work', 'Learn how to submit your work assignments for review...', '20000000-0000-0000-0000-000000000002', ARRAY['work', 'submission']::TEXT[], 'published', v_admin_id, false),
      ('30000000-0000-0000-0000-000000000003', 'Requesting Leave', 'Step-by-step guide to requesting time off...', '20000000-0000-0000-0000-000000000002', ARRAY['leave', 'time-off']::TEXT[], 'published', v_admin_id, true),
      ('30000000-0000-0000-0000-000000000004', 'Troubleshooting Login Issues', 'Having trouble logging in? Follow these steps...', '20000000-0000-0000-0000-000000000003', ARRAY['login', 'troubleshooting']::TEXT[], 'published', v_admin_id, false)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- ASSET CATEGORIES
-- =====================================================
INSERT INTO public.asset_categories (id, name, description, is_active) VALUES
  ('40000000-0000-0000-0000-000000000001', 'Laptops', 'Laptop computers and notebooks', true),
  ('40000000-0000-0000-0000-000000000002', 'Mobile Devices', 'Phones and tablets', true),
  ('40000000-0000-0000-0000-000000000003', 'Office Equipment', 'Desks, chairs, monitors', true),
  ('40000000-0000-0000-0000-000000000004', 'Software Licenses', 'Software and application licenses', true),
  ('40000000-0000-0000-0000-000000000005', 'Vehicles', 'Company vehicles', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INITIALIZE LEAVE BALANCES FOR EXISTING USERS
-- =====================================================
-- This will initialize leave balances for all existing users for current year
DO $$
DECLARE
  v_user RECORD;
  v_current_year INTEGER;
BEGIN
  v_current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

  FOR v_user IN SELECT id FROM public.users WHERE is_active = true
  LOOP
    PERFORM initialize_leave_balance(v_user.id, v_current_year);
  END LOOP;
END $$;

-- =====================================================
-- SAMPLE ANNOUNCEMENTS
-- =====================================================
DO $$
DECLARE
  v_admin_id UUID;
  v_ceo_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM public.users WHERE email = 'admin@sgoap.com';
  SELECT id INTO v_ceo_id FROM public.users WHERE email = 'ceo@sgoap.com';

  IF v_admin_id IS NOT NULL AND v_ceo_id IS NOT NULL THEN
    INSERT INTO public.announcements (id, title, content, type, priority, target_audience, is_pinned, created_by, start_date, end_date) VALUES
      ('50000000-0000-0000-0000-000000000001', 'Welcome to Q3 2024', 'We are excited to kick off Q3 with new initiatives and goals. Thank you for your continued dedication!', 'general', 'high', 'all', true, v_ceo_id, NOW(), NOW() + INTERVAL '7 days'),
      ('50000000-0000-0000-0000-000000000002', 'New Leave Management System', 'Our new leave management system is now live! You can now apply for leave directly from your dashboard.', 'important', 'normal', 'all', true, v_admin_id, NOW(), NOW() + INTERVAL '14 days'),
      ('50000000-0000-0000-0000-000000000003', 'Team Building Event', 'Join us for our quarterly team building event next Friday at the main office.', 'event', 'normal', 'all', false, v_admin_id, NOW(), NOW() + INTERVAL '3 days'),
      ('50000000-0000-0000-0000-000000000004', 'IT System Maintenance', 'Scheduled maintenance this weekend. System will be unavailable Saturday 2-4 AM.', 'important', 'normal', 'all', false, v_admin_id, NOW(), NOW() + INTERVAL '2 days')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- SAMPLE EVENTS
-- =====================================================
DO $$
DECLARE
  v_admin_id UUID;
  v_ceo_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM public.users WHERE email = 'admin@sgoap.com';
  SELECT id INTO v_ceo_id FROM public.users WHERE email = 'ceo@sgoap.com';

  IF v_admin_id IS NOT NULL AND v_ceo_id IS NOT NULL THEN
    INSERT INTO public.events (id, title, description, event_type, start_time, end_time, location, organizer_id, target_audience, is_all_day, requires_rsvp) VALUES
      ('60000000-0000-0000-0000-000000000001', 'Monthly All-Hands Meeting', 'Company-wide monthly meeting to discuss updates and initiatives', 'meeting', NOW() + INTERVAL '7 days' + INTERVAL '10 hours', NOW() + INTERVAL '7 days' + INTERVAL '11 hours', 'Main Conference Room / Zoom', v_ceo_id, 'all', false, true),
      ('60000000-0000-0000-0000-000000000002', 'Security Training', 'Mandatory cybersecurity training session', 'training', NOW() + INTERVAL '14 days' + INTERVAL '14 hours', NOW() + INTERVAL '14 days' + INTERVAL '16 hours', 'Training Room A', v_admin_id, 'all', false, true),
      ('60000000-0000-0000-0000-000000000003', 'Q3 Planning Workshop', 'Department heads planning workshop', 'workshop', NOW() + INTERVAL '21 days' + INTERVAL '9 hours', NOW() + INTERVAL '21 days' + INTERVAL '17 hours', 'Executive Conference Room', v_ceo_id, 'role', false, true),
      ('60000000-0000-0000-0000-000000000004', 'Company Holiday', 'Independence Day - Office Closed', 'holiday', DATE_TRUNC('day', NOW() + INTERVAL '30 days'), DATE_TRUNC('day', NOW() + INTERVAL '30 days'), 'All Locations', v_admin_id, 'all', true, false)
    ON CONFLICT (id) DO NOTHING;

    -- Update target_roles for Q3 Planning Workshop
    UPDATE public.events 
    SET target_roles = ARRAY['department_head', 'manager', 'executive', 'ceo']::TEXT[]
    WHERE id = '60000000-0000-0000-0000-000000000003';
  END IF;
END $$;

