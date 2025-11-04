-- =====================================================
-- COMPREHENSIVE DEPARTMENT STRUCTURE SEED DATA
-- Run this AFTER supabase-workflow-approval-system.sql
-- =====================================================

-- =====================================================
-- HEADQUARTERS DEPARTMENTS (12 Full Departments)
-- =====================================================
DO $$
DECLARE
  v_hq_branch_id UUID;
BEGIN
  -- Get Headquarters branch ID
  SELECT id INTO v_hq_branch_id FROM public.branches WHERE name = 'New York HQ' LIMIT 1;

  IF v_hq_branch_id IS NOT NULL THEN
    -- Insert all 12 departments for Headquarters
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
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Strategy & Corporate Development', v_hq_branch_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- BRANCH DEPARTMENTS (Simplified structure for branches)
-- =====================================================
DO $$
DECLARE
  v_branch RECORD;
BEGIN
  FOR v_branch IN SELECT id, name FROM public.branches WHERE name != 'New York HQ'
  LOOP
    -- Each branch gets core operational departments
    INSERT INTO public.departments (id, name, branch_id) VALUES
      (gen_random_uuid(), 'Sales & Business Development', v_branch.id),
      (gen_random_uuid(), 'Operations & Logistics', v_branch.id),
      (gen_random_uuid(), 'Customer Service & Support', v_branch.id),
      (gen_random_uuid(), 'Finance & Accounting', v_branch.id),
      (gen_random_uuid(), 'Human Resources (HR)', v_branch.id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- UPDATE EXISTING USER DEPARTMENTS
-- =====================================================
-- Map existing users to proper department IDs
DO $$
DECLARE
  v_hr_dept_id UUID;
  v_finance_dept_id UUID;
  v_sales_dept_id UUID;
  v_ops_dept_id UUID;
  v_it_dept_id UUID;
  v_exec_dept_id UUID;
BEGIN
  SELECT id INTO v_hr_dept_id FROM public.departments WHERE name = 'Human Resources (HR)' LIMIT 1;
  SELECT id INTO v_finance_dept_id FROM public.departments WHERE name = 'Finance & Accounting' LIMIT 1;
  SELECT id INTO v_sales_dept_id FROM public.departments WHERE name = 'Sales & Business Development' LIMIT 1;
  SELECT id INTO v_ops_dept_id FROM public.departments WHERE name = 'Operations & Logistics' LIMIT 1;
  SELECT id INTO v_it_dept_id FROM public.departments WHERE name = 'Information Technology (IT)' LIMIT 1;
  SELECT id INTO v_exec_dept_id FROM public.departments WHERE name = 'Strategy & Corporate Development' LIMIT 1;

  -- Update users to reference proper department structure
  -- Note: This keeps the text department name for compatibility but adds department_id reference
  -- You may want to update the schema to use department_id instead of text department
END $$;

