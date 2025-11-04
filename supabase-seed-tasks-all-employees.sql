-- =====================================================
-- COMPREHENSIVE TASK SEED DATA FOR ALL EMPLOYEES
-- Creates realistic tasks for all employees with:
-- - Completed tasks (status: completed, progress: 100)
-- - In-progress tasks (status: in-progress, progress: 30-80)
-- - Pending tasks (status: pending, progress: 0)
-- Tasks are relevant to each employee's role and department
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
  v_head_london_sales_id UUID;
  v_emp_london_sales_id UUID;
  v_emp_london_ops_id UUID;
  v_emp_tokyo_sales_id UUID;
  v_emp_tokyo_rd_id UUID;
  
  -- Branch names
  v_hq_branch TEXT := 'New York HQ';
  v_london_branch TEXT := 'London Office';
  v_tokyo_branch TEXT := 'Tokyo Operations';
  
BEGIN
  -- Get user IDs by email
  SELECT id INTO v_ceo_id FROM auth.users WHERE email = 'ceo@sgoap.com' LIMIT 1;
  SELECT id INTO v_exec_strategy_id FROM auth.users WHERE email = 'executive.strategy@sgoap.com' LIMIT 1;
  SELECT id INTO v_exec_operations_id FROM auth.users WHERE email = 'executive.operations@sgoap.com' LIMIT 1;
  SELECT id INTO v_exec_finance_id FROM auth.users WHERE email = 'executive.finance@sgoap.com' LIMIT 1;
  
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
  
  SELECT id INTO v_manager_sales_id FROM auth.users WHERE email = 'manager.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_manager_hr_id FROM auth.users WHERE email = 'manager.hr@sgoap.com' LIMIT 1;
  SELECT id INTO v_manager_finance_id FROM auth.users WHERE email = 'manager.finance@sgoap.com' LIMIT 1;
  SELECT id INTO v_manager_it_id FROM auth.users WHERE email = 'manager.it@sgoap.com' LIMIT 1;
  SELECT id INTO v_manager_ops_id FROM auth.users WHERE email = 'manager.operations@sgoap.com' LIMIT 1;
  
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
  
  SELECT id INTO v_head_london_sales_id FROM auth.users WHERE email = 'head.london.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_london_sales_id FROM auth.users WHERE email = 'employee.london.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_london_ops_id FROM auth.users WHERE email = 'employee.london.operations@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_tokyo_sales_id FROM auth.users WHERE email = 'employee.tokyo.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_tokyo_rd_id FROM auth.users WHERE email = 'employee.tokyo.rd@sgoap.com' LIMIT 1;

  -- ===================================================
  -- CEO TASKS
  -- ===================================================
  IF v_ceo_id IS NOT NULL THEN
    -- Completed
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Q4 Strategic Review', 'Review and approve Q4 strategic initiatives and performance metrics', 'completed', 'high', v_hq_branch, v_ceo_id, 'James Mitchell', CURRENT_DATE - INTERVAL '5 days', 100, v_exec_strategy_id),
      ('Board Meeting Presentation', 'Prepare and present quarterly results to board of directors', 'completed', 'critical', v_hq_branch, v_ceo_id, 'James Mitchell', CURRENT_DATE - INTERVAL '10 days', 100, v_ceo_id);
    
    -- In Progress
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Annual Budget Approval', 'Review and approve annual budget for all departments', 'in-progress', 'critical', v_hq_branch, v_ceo_id, 'James Mitchell', CURRENT_DATE + INTERVAL '15 days', 65, v_exec_finance_id),
      ('Global Expansion Strategy', 'Finalize strategy for international market expansion', 'in-progress', 'high', v_hq_branch, v_ceo_id, 'James Mitchell', CURRENT_DATE + INTERVAL '30 days', 45, v_exec_strategy_id);
    
    -- Pending
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Investor Relations Meeting', 'Prepare for quarterly investor relations call', 'pending', 'high', v_hq_branch, v_ceo_id, 'James Mitchell', CURRENT_DATE + INTERVAL '20 days', 0, v_exec_finance_id),
      ('Executive Team Retreat Planning', 'Plan and organize annual executive team building retreat', 'pending', 'medium', v_hq_branch, v_ceo_id, 'James Mitchell', CURRENT_DATE + INTERVAL '45 days', 0, v_exec_strategy_id);
  END IF;

  -- ===================================================
  -- EXECUTIVES TASKS
  -- ===================================================
  
  -- Strategy Executive
  IF v_exec_strategy_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Market Research Analysis', 'Complete comprehensive market research for new product launch', 'completed', 'high', v_hq_branch, v_exec_strategy_id, 'Sarah Chen', CURRENT_DATE - INTERVAL '7 days', 100, v_ceo_id),
      ('Strategic Planning Workshop', 'Facilitate strategic planning session with department heads', 'in-progress', 'high', v_hq_branch, v_exec_strategy_id, 'Sarah Chen', CURRENT_DATE + INTERVAL '10 days', 70, v_ceo_id),
      ('Competitive Analysis Report', 'Research and analyze competitor strategies and positioning', 'pending', 'medium', v_hq_branch, v_exec_strategy_id, 'Sarah Chen', CURRENT_DATE + INTERVAL '25 days', 0, v_ceo_id);
  END IF;

  -- Operations Executive
  IF v_exec_operations_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Supply Chain Optimization', 'Review and optimize global supply chain processes', 'completed', 'high', v_hq_branch, v_exec_operations_id, 'Michael Rodriguez', CURRENT_DATE - INTERVAL '3 days', 100, v_ceo_id),
      ('Operations Efficiency Audit', 'Conduct comprehensive operations efficiency review', 'in-progress', 'high', v_hq_branch, v_exec_operations_id, 'Michael Rodriguez', CURRENT_DATE + INTERVAL '18 days', 55, v_ceo_id),
      ('Facilities Expansion Plan', 'Develop plan for new office facilities in key markets', 'pending', 'medium', v_hq_branch, v_exec_operations_id, 'Michael Rodriguez', CURRENT_DATE + INTERVAL '35 days', 0, v_ceo_id);
  END IF;

  -- Finance Executive
  IF v_exec_finance_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Financial Year-End Close', 'Complete financial year-end closing procedures', 'completed', 'critical', v_hq_branch, v_exec_finance_id, 'David Thompson', CURRENT_DATE - INTERVAL '12 days', 100, v_ceo_id),
      ('Budget Allocation Review', 'Review and allocate budgets across all departments', 'in-progress', 'critical', v_hq_branch, v_exec_finance_id, 'David Thompson', CURRENT_DATE + INTERVAL '12 days', 80, v_ceo_id),
      ('Investment Portfolio Analysis', 'Analyze current investment portfolio and recommend changes', 'pending', 'high', v_hq_branch, v_exec_finance_id, 'David Thompson', CURRENT_DATE + INTERVAL '28 days', 0, v_ceo_id);
  END IF;

  -- ===================================================
  -- HR DEPARTMENT TASKS
  -- ===================================================
  
  -- HR Head
  IF v_head_hr_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Employee Handbook Update', 'Update employee handbook with latest policies', 'completed', 'medium', v_hq_branch, v_head_hr_id, 'Jennifer Martinez', CURRENT_DATE - INTERVAL '8 days', 100, v_exec_strategy_id),
      ('Recruitment Strategy 2024', 'Develop comprehensive recruitment strategy for next year', 'in-progress', 'high', v_hq_branch, v_head_hr_id, 'Jennifer Martinez', CURRENT_DATE + INTERVAL '14 days', 60, v_exec_strategy_id),
      ('Performance Review Cycle', 'Plan and organize annual performance review cycle', 'pending', 'high', v_hq_branch, v_head_hr_id, 'Jennifer Martinez', CURRENT_DATE + INTERVAL '30 days', 0, v_exec_strategy_id);
  END IF;

  -- HR Manager
  IF v_manager_hr_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Benefits Enrollment Campaign', 'Launch open enrollment for employee benefits', 'completed', 'high', v_hq_branch, v_manager_hr_id, 'Brian Clark', CURRENT_DATE - INTERVAL '5 days', 100, v_head_hr_id),
      ('Training Program Development', 'Develop new employee onboarding training program', 'in-progress', 'medium', v_hq_branch, v_manager_hr_id, 'Brian Clark', CURRENT_DATE + INTERVAL '12 days', 40, v_head_hr_id),
      ('HR Metrics Dashboard', 'Create comprehensive HR metrics and analytics dashboard', 'pending', 'medium', v_hq_branch, v_manager_hr_id, 'Brian Clark', CURRENT_DATE + INTERVAL '22 days', 0, v_head_hr_id);
  END IF;

  -- HR Employees
  IF v_emp_hr_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Candidate Screening - Sales', 'Screen and evaluate candidates for sales positions', 'completed', 'medium', v_hq_branch, v_emp_hr_1_id, 'Ashley Turner', CURRENT_DATE - INTERVAL '2 days', 100, v_manager_hr_id),
      ('Interview Scheduling', 'Schedule interviews for IT department positions', 'in-progress', 'medium', v_hq_branch, v_emp_hr_1_id, 'Ashley Turner', CURRENT_DATE + INTERVAL '5 days', 75, v_manager_hr_id),
      ('Employee Engagement Survey', 'Distribute and collect employee engagement survey responses', 'pending', 'low', v_hq_branch, v_emp_hr_1_id, 'Ashley Turner', CURRENT_DATE + INTERVAL '18 days', 0, v_manager_hr_id);
  END IF;

  IF v_emp_hr_2_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Benefits Documentation Update', 'Update all benefits documentation and forms', 'completed', 'low', v_hq_branch, v_emp_hr_2_id, 'Matthew Phillips', CURRENT_DATE - INTERVAL '4 days', 100, v_manager_hr_id),
      ('New Hire Orientation', 'Conduct orientation sessions for new hires this week', 'in-progress', 'medium', v_hq_branch, v_emp_hr_2_id, 'Matthew Phillips', CURRENT_DATE + INTERVAL '3 days', 50, v_manager_hr_id),
      ('Background Check Processing', 'Process background checks for pending new hires', 'pending', 'medium', v_hq_branch, v_emp_hr_2_id, 'Matthew Phillips', CURRENT_DATE + INTERVAL '8 days', 0, v_manager_hr_id);
  END IF;

  -- ===================================================
  -- FINANCE DEPARTMENT TASKS
  -- ===================================================
  
  -- Finance Head
  IF v_head_finance_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Monthly Financial Report', 'Compile and review monthly financial statements', 'completed', 'high', v_hq_branch, v_head_finance_id, 'Robert Kim', CURRENT_DATE - INTERVAL '6 days', 100, v_exec_finance_id),
      ('Budget Variance Analysis', 'Analyze budget variances and provide recommendations', 'in-progress', 'high', v_hq_branch, v_head_finance_id, 'Robert Kim', CURRENT_DATE + INTERVAL '7 days', 65, v_exec_finance_id),
      ('Tax Compliance Review', 'Review tax compliance for all entities', 'pending', 'high', v_hq_branch, v_head_finance_id, 'Robert Kim', CURRENT_DATE + INTERVAL '20 days', 0, v_exec_finance_id);
  END IF;

  -- Finance Manager
  IF v_manager_finance_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Accounts Payable Reconciliation', 'Reconcile all accounts payable for current month', 'completed', 'medium', v_hq_branch, v_manager_finance_id, 'Nicole Garcia', CURRENT_DATE - INTERVAL '3 days', 100, v_head_finance_id),
      ('Cash Flow Forecast Update', 'Update quarterly cash flow forecast', 'in-progress', 'high', v_hq_branch, v_manager_finance_id, 'Nicole Garcia', CURRENT_DATE + INTERVAL '9 days', 55, v_head_finance_id),
      ('Invoice Processing Optimization', 'Review and optimize invoice processing workflow', 'pending', 'medium', v_hq_branch, v_manager_finance_id, 'Nicole Garcia', CURRENT_DATE + INTERVAL '16 days', 0, v_head_finance_id);
  END IF;

  -- Finance Employees
  IF v_emp_finance_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Expense Report Review', 'Review and approve employee expense reports', 'completed', 'medium', v_hq_branch, v_emp_finance_1_id, 'Ryan Martinez', CURRENT_DATE - INTERVAL '1 day', 100, v_manager_finance_id),
      ('Financial Data Entry', 'Complete data entry for accounts receivable', 'in-progress', 'low', v_hq_branch, v_emp_finance_1_id, 'Ryan Martinez', CURRENT_DATE + INTERVAL '4 days', 80, v_manager_finance_id),
      ('Bank Reconciliation', 'Perform bank reconciliation for all accounts', 'pending', 'medium', v_hq_branch, v_emp_finance_1_id, 'Ryan Martinez', CURRENT_DATE + INTERVAL '10 days', 0, v_manager_finance_id);
  END IF;

  IF v_emp_finance_2_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Vendor Payment Processing', 'Process vendor payments for current cycle', 'completed', 'medium', v_hq_branch, v_emp_finance_2_id, 'Lauren Cooper', CURRENT_DATE - INTERVAL '2 days', 100, v_manager_finance_id),
      ('Financial Report Generation', 'Generate monthly departmental financial reports', 'in-progress', 'high', v_hq_branch, v_emp_finance_2_id, 'Lauren Cooper', CURRENT_DATE + INTERVAL '6 days', 60, v_manager_finance_id),
      ('Budget Template Creation', 'Create budget templates for next fiscal year', 'pending', 'medium', v_hq_branch, v_emp_finance_2_id, 'Lauren Cooper', CURRENT_DATE + INTERVAL '15 days', 0, v_manager_finance_id);
  END IF;

  -- ===================================================
  -- MARKETING DEPARTMENT TASKS
  -- ===================================================
  
  -- Marketing Head
  IF v_head_marketing_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Q4 Marketing Campaign Launch', 'Launch new product marketing campaign', 'completed', 'high', v_hq_branch, v_head_marketing_id, 'Emily Watson', CURRENT_DATE - INTERVAL '7 days', 100, v_exec_strategy_id),
      ('Brand Strategy Review', 'Review and update brand positioning strategy', 'in-progress', 'high', v_hq_branch, v_head_marketing_id, 'Emily Watson', CURRENT_DATE + INTERVAL '11 days', 50, v_exec_strategy_id),
      ('Marketing Budget Allocation', 'Allocate marketing budget across channels', 'pending', 'high', v_hq_branch, v_head_marketing_id, 'Emily Watson', CURRENT_DATE + INTERVAL '21 days', 0, v_exec_strategy_id);
  END IF;

  -- Marketing Employees
  IF v_emp_marketing_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Social Media Content Calendar', 'Create content calendar for social media channels', 'completed', 'medium', v_hq_branch, v_emp_marketing_1_id, 'Brandon Scott', CURRENT_DATE - INTERVAL '5 days', 100, v_head_marketing_id),
      ('Blog Post Writing', 'Write blog posts for company website', 'in-progress', 'medium', v_hq_branch, v_emp_marketing_1_id, 'Brandon Scott', CURRENT_DATE + INTERVAL '8 days', 65, v_head_marketing_id),
      ('SEO Optimization', 'Optimize website content for search engines', 'pending', 'medium', v_hq_branch, v_emp_marketing_1_id, 'Brandon Scott', CURRENT_DATE + INTERVAL '17 days', 0, v_head_marketing_id);
  END IF;

  IF v_emp_marketing_2_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Email Campaign Design', 'Design email marketing campaign templates', 'completed', 'medium', v_hq_branch, v_emp_marketing_2_id, 'Samantha Green', CURRENT_DATE - INTERVAL '4 days', 100, v_head_marketing_id),
      ('Press Release Writing', 'Draft press releases for product launches', 'in-progress', 'medium', v_hq_branch, v_emp_marketing_2_id, 'Samantha Green', CURRENT_DATE + INTERVAL '7 days', 45, v_head_marketing_id),
      ('Competitor Analysis', 'Research and analyze competitor marketing strategies', 'pending', 'low', v_hq_branch, v_emp_marketing_2_id, 'Samantha Green', CURRENT_DATE + INTERVAL '19 days', 0, v_head_marketing_id);
  END IF;

  -- ===================================================
  -- SALES DEPARTMENT TASKS
  -- ===================================================
  
  -- Sales Head
  IF v_head_sales_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Sales Team Performance Review', 'Review Q4 sales team performance metrics', 'completed', 'high', v_hq_branch, v_head_sales_id, 'Christopher Anderson', CURRENT_DATE - INTERVAL '9 days', 100, v_exec_strategy_id),
      ('Sales Strategy Planning', 'Develop sales strategy for next quarter', 'in-progress', 'high', v_hq_branch, v_head_sales_id, 'Christopher Anderson', CURRENT_DATE + INTERVAL '13 days', 70, v_exec_strategy_id),
      ('Sales Training Program', 'Develop comprehensive sales training program', 'pending', 'medium', v_hq_branch, v_head_sales_id, 'Christopher Anderson', CURRENT_DATE + INTERVAL '26 days', 0, v_exec_strategy_id);
  END IF;

  -- Sales Manager
  IF v_manager_sales_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Client Proposal Submission', 'Submit proposals to key enterprise clients', 'completed', 'high', v_hq_branch, v_manager_sales_id, 'Jessica White', CURRENT_DATE - INTERVAL '6 days', 100, v_head_sales_id),
      ('Sales Pipeline Review', 'Review and analyze sales pipeline status', 'in-progress', 'high', v_hq_branch, v_manager_sales_id, 'Jessica White', CURRENT_DATE + INTERVAL '5 days', 80, v_head_sales_id),
      ('Sales Process Documentation', 'Document and standardize sales processes', 'pending', 'medium', v_hq_branch, v_manager_sales_id, 'Jessica White', CURRENT_DATE + INTERVAL '14 days', 0, v_head_sales_id);
  END IF;

  -- Sales Employees
  IF v_emp_sales_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Client Meeting - TechCorp', 'Conduct sales presentation for TechCorp account', 'completed', 'high', v_hq_branch, v_emp_sales_1_id, 'Justin Hall', CURRENT_DATE - INTERVAL '3 days', 100, v_manager_sales_id),
      ('Follow-up Calls', 'Follow up with prospects from trade show', 'in-progress', 'medium', v_hq_branch, v_emp_sales_1_id, 'Justin Hall', CURRENT_DATE + INTERVAL '4 days', 50, v_manager_sales_id),
      ('Sales Report Preparation', 'Prepare monthly sales activity report', 'pending', 'medium', v_hq_branch, v_emp_sales_1_id, 'Justin Hall', CURRENT_DATE + INTERVAL '9 days', 0, v_manager_sales_id);
  END IF;

  IF v_emp_sales_2_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Contract Negotiation - Global Inc', 'Negotiate terms for Global Inc partnership', 'completed', 'high', v_hq_branch, v_emp_sales_2_id, 'Megan Lewis', CURRENT_DATE - INTERVAL '2 days', 100, v_manager_sales_id),
      ('Demo Preparation', 'Prepare product demos for upcoming client meetings', 'in-progress', 'medium', v_hq_branch, v_emp_sales_2_id, 'Megan Lewis', CURRENT_DATE + INTERVAL '3 days', 70, v_manager_sales_id),
      ('CRM Data Entry', 'Update CRM with latest client interactions', 'pending', 'low', v_hq_branch, v_emp_sales_2_id, 'Megan Lewis', CURRENT_DATE + INTERVAL '7 days', 0, v_manager_sales_id);
  END IF;

  IF v_emp_sales_3_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Trade Show Participation', 'Represent company at industry trade show', 'completed', 'medium', v_hq_branch, v_emp_sales_3_id, 'Tyler Walker', CURRENT_DATE - INTERVAL '11 days', 100, v_manager_sales_id),
      ('Lead Qualification', 'Qualify leads from marketing campaigns', 'in-progress', 'medium', v_hq_branch, v_emp_sales_3_id, 'Tyler Walker', CURRENT_DATE + INTERVAL '6 days', 40, v_manager_sales_id),
      ('Client Onboarding', 'Onboard new clients and provide initial training', 'pending', 'high', v_hq_branch, v_emp_sales_3_id, 'Tyler Walker', CURRENT_DATE + INTERVAL '11 days', 0, v_manager_sales_id);
  END IF;

  -- ===================================================
  -- OPERATIONS DEPARTMENT TASKS
  -- ===================================================
  
  -- Operations Head
  IF v_head_ops_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Logistics Efficiency Report', 'Complete analysis of logistics and supply chain efficiency', 'completed', 'high', v_hq_branch, v_head_ops_id, 'Amanda Foster', CURRENT_DATE - INTERVAL '8 days', 100, v_exec_operations_id),
      ('Process Improvement Initiative', 'Implement process improvements across operations', 'in-progress', 'high', v_hq_branch, v_head_ops_id, 'Amanda Foster', CURRENT_DATE + INTERVAL '15 days', 55, v_exec_operations_id),
      ('Vendor Relationship Review', 'Review and evaluate vendor relationships and contracts', 'pending', 'medium', v_hq_branch, v_head_ops_id, 'Amanda Foster', CURRENT_DATE + INTERVAL '27 days', 0, v_exec_operations_id);
  END IF;

  -- Operations Manager
  IF v_manager_ops_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Warehouse Inventory Audit', 'Complete quarterly warehouse inventory audit', 'completed', 'medium', v_hq_branch, v_manager_ops_id, 'Stephanie Hill', CURRENT_DATE - INTERVAL '4 days', 100, v_head_ops_id),
      ('Distribution Network Optimization', 'Analyze and optimize distribution network', 'in-progress', 'high', v_hq_branch, v_manager_ops_id, 'Stephanie Hill', CURRENT_DATE + INTERVAL '10 days', 65, v_head_ops_id),
      ('Quality Control Procedures', 'Review and update quality control procedures', 'pending', 'medium', v_hq_branch, v_manager_ops_id, 'Stephanie Hill', CURRENT_DATE + INTERVAL '19 days', 0, v_head_ops_id);
  END IF;

  -- Operations Employees
  IF v_emp_ops_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Shipping Schedule Coordination', 'Coordinate shipping schedules with logistics partners', 'completed', 'medium', v_hq_branch, v_emp_ops_1_id, 'Cameron Young', CURRENT_DATE - INTERVAL '2 days', 100, v_manager_ops_id),
      ('Order Processing', 'Process incoming orders and update tracking systems', 'in-progress', 'high', v_hq_branch, v_emp_ops_1_id, 'Cameron Young', CURRENT_DATE + INTERVAL '2 days', 85, v_manager_ops_id),
      ('Inventory Replenishment', 'Coordinate inventory replenishment for warehouse', 'pending', 'medium', v_hq_branch, v_emp_ops_1_id, 'Cameron Young', CURRENT_DATE + INTERVAL '8 days', 0, v_manager_ops_id);
  END IF;

  IF v_emp_ops_2_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Delivery Route Optimization', 'Optimize delivery routes for efficiency', 'completed', 'medium', v_hq_branch, v_emp_ops_2_id, 'Rachel King', CURRENT_DATE - INTERVAL '5 days', 100, v_manager_ops_id),
      ('Fleet Maintenance Scheduling', 'Schedule maintenance for company fleet', 'in-progress', 'medium', v_hq_branch, v_emp_ops_2_id, 'Rachel King', CURRENT_DATE + INTERVAL '5 days', 60, v_manager_ops_id),
      ('Safety Protocol Review', 'Review and update safety protocols for operations', 'pending', 'high', v_hq_branch, v_emp_ops_2_id, 'Rachel King', CURRENT_DATE + INTERVAL '12 days', 0, v_manager_ops_id);
  END IF;

  -- ===================================================
  -- IT DEPARTMENT TASKS
  -- ===================================================
  
  -- IT Head
  IF v_head_it_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Security Audit Completion', 'Complete annual cybersecurity audit', 'completed', 'critical', v_hq_branch, v_head_it_id, 'Kevin Park', CURRENT_DATE - INTERVAL '10 days', 100, v_exec_operations_id),
      ('Infrastructure Upgrade Planning', 'Plan infrastructure upgrade for next quarter', 'in-progress', 'high', v_hq_branch, v_head_it_id, 'Kevin Park', CURRENT_DATE + INTERVAL '16 days', 50, v_exec_operations_id),
      ('IT Budget Approval', 'Finalize and get approval for IT budget', 'pending', 'high', v_hq_branch, v_head_it_id, 'Kevin Park', CURRENT_DATE + INTERVAL '24 days', 0, v_exec_operations_id);
  END IF;

  -- IT Manager
  IF v_manager_it_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('System Backup Verification', 'Verify all system backups are functioning correctly', 'completed', 'high', v_hq_branch, v_manager_it_id, 'Ryan Adams', CURRENT_DATE - INTERVAL '7 days', 100, v_head_it_id),
      ('Help Desk Ticket Review', 'Review and prioritize help desk tickets', 'in-progress', 'medium', v_hq_branch, v_manager_it_id, 'Ryan Adams', CURRENT_DATE + INTERVAL '3 days', 75, v_head_it_id),
      ('Software License Audit', 'Conduct audit of all software licenses', 'pending', 'medium', v_hq_branch, v_manager_it_id, 'Ryan Adams', CURRENT_DATE + INTERVAL '13 days', 0, v_head_it_id);
  END IF;

  -- IT Employees
  IF v_emp_it_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Website Performance Optimization', 'Optimize website performance and load times', 'completed', 'medium', v_hq_branch, v_emp_it_1_id, 'Jordan Wright', CURRENT_DATE - INTERVAL '6 days', 100, v_manager_it_id),
      ('API Development', 'Develop new API endpoints for mobile app', 'in-progress', 'high', v_hq_branch, v_emp_it_1_id, 'Jordan Wright', CURRENT_DATE + INTERVAL '7 days', 70, v_manager_it_id),
      ('Database Optimization', 'Optimize database queries and indexes', 'pending', 'medium', v_hq_branch, v_emp_it_1_id, 'Jordan Wright', CURRENT_DATE + INTERVAL '14 days', 0, v_manager_it_id);
  END IF;

  IF v_emp_it_2_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Server Maintenance', 'Complete scheduled server maintenance tasks', 'completed', 'high', v_hq_branch, v_emp_it_2_id, 'Alexis Lopez', CURRENT_DATE - INTERVAL '3 days', 100, v_manager_it_id),
      ('Security Patch Deployment', 'Deploy latest security patches to all systems', 'in-progress', 'critical', v_hq_branch, v_emp_it_2_id, 'Alexis Lopez', CURRENT_DATE + INTERVAL '4 days', 80, v_manager_it_id),
      ('Network Configuration', 'Configure new network infrastructure', 'pending', 'high', v_hq_branch, v_emp_it_2_id, 'Alexis Lopez', CURRENT_DATE + INTERVAL '11 days', 0, v_manager_it_id);
  END IF;

  -- ===================================================
  -- OTHER DEPARTMENT TASKS
  -- ===================================================
  
  -- Legal Department
  IF v_head_legal_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Contract Review - Vendor A', 'Review and finalize vendor contract', 'completed', 'high', v_hq_branch, v_head_legal_id, 'Thomas Wilson', CURRENT_DATE - INTERVAL '5 days', 100, v_exec_strategy_id),
      ('Compliance Audit', 'Conduct compliance audit for regulatory requirements', 'in-progress', 'critical', v_hq_branch, v_head_legal_id, 'Thomas Wilson', CURRENT_DATE + INTERVAL '17 days', 60, v_exec_strategy_id),
      ('Legal Documentation Update', 'Update legal documentation and templates', 'pending', 'medium', v_hq_branch, v_head_legal_id, 'Thomas Wilson', CURRENT_DATE + INTERVAL '29 days', 0, v_exec_strategy_id);
  END IF;

  IF v_emp_legal_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Trademark Application', 'File trademark application for new product line', 'completed', 'medium', v_hq_branch, v_emp_legal_1_id, 'Jonathan Baker', CURRENT_DATE - INTERVAL '9 days', 100, v_head_legal_id),
      ('Contract Negotiation Support', 'Provide legal support for ongoing contract negotiations', 'in-progress', 'high', v_hq_branch, v_emp_legal_1_id, 'Jonathan Baker', CURRENT_DATE + INTERVAL '8 days', 50, v_head_legal_id),
      ('Legal Research', 'Research legal implications of new business initiatives', 'pending', 'medium', v_hq_branch, v_emp_legal_1_id, 'Jonathan Baker', CURRENT_DATE + INTERVAL '16 days', 0, v_head_legal_id);
  END IF;

  -- Procurement Department
  IF v_head_procurement_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Vendor Evaluation', 'Evaluate new vendors for key supplies', 'completed', 'medium', v_hq_branch, v_head_procurement_id, 'Patricia Brown', CURRENT_DATE - INTERVAL '6 days', 100, v_exec_operations_id),
      ('Purchase Order Processing', 'Process and approve purchase orders', 'in-progress', 'high', v_hq_branch, v_head_procurement_id, 'Patricia Brown', CURRENT_DATE + INTERVAL '6 days', 70, v_exec_operations_id),
      ('Supplier Relationship Management', 'Review and strengthen supplier relationships', 'pending', 'medium', v_hq_branch, v_head_procurement_id, 'Patricia Brown', CURRENT_DATE + INTERVAL '18 days', 0, v_exec_operations_id);
  END IF;

  IF v_emp_procurement_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('RFQ Preparation', 'Prepare request for quotes for new equipment', 'completed', 'medium', v_hq_branch, v_emp_procurement_1_id, 'Victoria Harris', CURRENT_DATE - INTERVAL '4 days', 100, v_head_procurement_id),
      ('Inventory Order Placement', 'Place orders for inventory replenishment', 'in-progress', 'high', v_hq_branch, v_emp_procurement_1_id, 'Victoria Harris', CURRENT_DATE + INTERVAL '4 days', 65, v_head_procurement_id),
      ('Vendor Performance Analysis', 'Analyze vendor performance metrics', 'pending', 'low', v_hq_branch, v_emp_procurement_1_id, 'Victoria Harris', CURRENT_DATE + INTERVAL '15 days', 0, v_head_procurement_id);
  END IF;

  -- Customer Service Department
  IF v_head_customer_service_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Customer Satisfaction Survey', 'Analyze customer satisfaction survey results', 'completed', 'medium', v_hq_branch, v_head_customer_service_id, 'Daniel Lee', CURRENT_DATE - INTERVAL '7 days', 100, v_exec_operations_id),
      ('Service Quality Improvement', 'Implement improvements based on customer feedback', 'in-progress', 'high', v_hq_branch, v_head_customer_service_id, 'Daniel Lee', CURRENT_DATE + INTERVAL '9 days', 55, v_exec_operations_id),
      ('Training Program Development', 'Develop customer service training program', 'pending', 'medium', v_hq_branch, v_head_customer_service_id, 'Daniel Lee', CURRENT_DATE + INTERVAL '20 days', 0, v_exec_operations_id);
  END IF;

  IF v_emp_customer_service_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Ticket Resolution - Priority Cases', 'Resolve high-priority customer service tickets', 'completed', 'high', v_hq_branch, v_emp_customer_service_1_id, 'Nathan Collins', CURRENT_DATE - INTERVAL '2 days', 100, v_head_customer_service_id),
      ('Customer Follow-up Calls', 'Follow up with customers regarding resolved issues', 'in-progress', 'medium', v_hq_branch, v_emp_customer_service_1_id, 'Nathan Collins', CURRENT_DATE + INTERVAL '5 days', 60, v_head_customer_service_id),
      ('Knowledge Base Update', 'Update customer service knowledge base', 'pending', 'low', v_hq_branch, v_emp_customer_service_1_id, 'Nathan Collins', CURRENT_DATE + INTERVAL '12 days', 0, v_head_customer_service_id);
  END IF;

  IF v_emp_customer_service_2_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Live Chat Support Coverage', 'Provide live chat support during peak hours', 'completed', 'medium', v_hq_branch, v_emp_customer_service_2_id, 'Olivia Stewart', CURRENT_DATE - INTERVAL '1 day', 100, v_head_customer_service_id),
      ('Customer Feedback Analysis', 'Analyze and categorize customer feedback', 'in-progress', 'medium', v_hq_branch, v_emp_customer_service_2_id, 'Olivia Stewart', CURRENT_DATE + INTERVAL '6 days', 45, v_head_customer_service_id),
      ('FAQ Documentation', 'Create and update frequently asked questions', 'pending', 'low', v_hq_branch, v_emp_customer_service_2_id, 'Olivia Stewart', CURRENT_DATE + INTERVAL '13 days', 0, v_head_customer_service_id);
  END IF;

  -- R&D Department
  IF v_head_rd_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Product Prototype Testing', 'Complete testing of new product prototype', 'completed', 'high', v_hq_branch, v_head_rd_id, 'Lisa Johnson', CURRENT_DATE - INTERVAL '8 days', 100, v_exec_strategy_id),
      ('Research Project Planning', 'Plan next phase of research projects', 'in-progress', 'high', v_hq_branch, v_head_rd_id, 'Lisa Johnson', CURRENT_DATE + INTERVAL '12 days', 50, v_exec_strategy_id),
      ('Innovation Workshop', 'Organize innovation workshop for research team', 'pending', 'medium', v_hq_branch, v_head_rd_id, 'Lisa Johnson', CURRENT_DATE + INTERVAL '23 days', 0, v_exec_strategy_id);
  END IF;

  IF v_emp_rd_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Lab Testing Completion', 'Complete laboratory testing for current project', 'completed', 'medium', v_hq_branch, v_emp_rd_1_id, 'Eric Murphy', CURRENT_DATE - INTERVAL '5 days', 100, v_head_rd_id),
      ('Research Data Analysis', 'Analyze research data and prepare findings', 'in-progress', 'high', v_hq_branch, v_emp_rd_1_id, 'Eric Murphy', CURRENT_DATE + INTERVAL '8 days', 70, v_head_rd_id),
      ('Technical Documentation', 'Document research methodologies and findings', 'pending', 'medium', v_hq_branch, v_emp_rd_1_id, 'Eric Murphy', CURRENT_DATE + INTERVAL '15 days', 0, v_head_rd_id);
  END IF;

  -- Facilities Department
  IF v_head_facilities_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Office Maintenance Inspection', 'Complete quarterly office maintenance inspection', 'completed', 'medium', v_hq_branch, v_head_facilities_id, 'Michelle Taylor', CURRENT_DATE - INTERVAL '6 days', 100, v_exec_operations_id),
      ('Facilities Upgrade Planning', 'Plan facilities upgrades for next quarter', 'in-progress', 'medium', v_hq_branch, v_head_facilities_id, 'Michelle Taylor', CURRENT_DATE + INTERVAL '11 days', 40, v_exec_operations_id),
      ('Vendor Contract Renewal', 'Review and renew facilities management contracts', 'pending', 'medium', v_hq_branch, v_head_facilities_id, 'Michelle Taylor', CURRENT_DATE + INTERVAL '22 days', 0, v_exec_operations_id);
  END IF;

  IF v_emp_facilities_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('HVAC System Maintenance', 'Complete scheduled HVAC system maintenance', 'completed', 'medium', v_hq_branch, v_emp_facilities_1_id, 'Kimberly Rivera', CURRENT_DATE - INTERVAL '3 days', 100, v_head_facilities_id),
      ('Office Space Planning', 'Plan office space allocation for new hires', 'in-progress', 'medium', v_hq_branch, v_emp_facilities_1_id, 'Kimberly Rivera', CURRENT_DATE + INTERVAL '7 days', 55, v_head_facilities_id),
      ('Maintenance Schedule Update', 'Update maintenance schedules for all facilities', 'pending', 'low', v_hq_branch, v_emp_facilities_1_id, 'Kimberly Rivera', CURRENT_DATE + INTERVAL '14 days', 0, v_head_facilities_id);
  END IF;

  -- Audit Department
  IF v_head_audit_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Internal Audit Report', 'Complete internal audit report for Q4', 'completed', 'high', v_hq_branch, v_head_audit_id, 'Richard Moore', CURRENT_DATE - INTERVAL '11 days', 100, v_exec_finance_id),
      ('Risk Assessment Review', 'Review and update risk assessment procedures', 'in-progress', 'high', v_hq_branch, v_head_audit_id, 'Richard Moore', CURRENT_DATE + INTERVAL '10 days', 65, v_exec_finance_id),
      ('Audit Schedule Planning', 'Plan audit schedule for next fiscal year', 'pending', 'medium', v_hq_branch, v_head_audit_id, 'Richard Moore', CURRENT_DATE + INTERVAL '25 days', 0, v_exec_finance_id);
  END IF;

  IF v_emp_audit_1_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Financial Records Audit', 'Audit financial records for compliance', 'completed', 'high', v_hq_branch, v_emp_audit_1_id, 'Derek Campbell', CURRENT_DATE - INTERVAL '4 days', 100, v_head_audit_id),
      ('Process Compliance Review', 'Review processes for compliance with regulations', 'in-progress', 'medium', v_hq_branch, v_emp_audit_1_id, 'Derek Campbell', CURRENT_DATE + INTERVAL '9 days', 50, v_head_audit_id),
      ('Audit Documentation', 'Document audit findings and recommendations', 'pending', 'medium', v_hq_branch, v_emp_audit_1_id, 'Derek Campbell', CURRENT_DATE + INTERVAL '16 days', 0, v_head_audit_id);
  END IF;

  -- ===================================================
  -- BRANCH EMPLOYEES TASKS
  -- ===================================================
  
  -- London Sales Head
  IF v_head_london_sales_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('European Market Analysis', 'Complete analysis of European market opportunities', 'completed', 'high', v_london_branch, v_head_london_sales_id, 'Emma Wilson', CURRENT_DATE - INTERVAL '7 days', 100, v_exec_strategy_id),
      ('UK Client Acquisition', 'Develop strategy for UK client acquisition', 'in-progress', 'high', v_london_branch, v_head_london_sales_id, 'Emma Wilson', CURRENT_DATE + INTERVAL '14 days', 60, v_exec_strategy_id),
      ('Regional Sales Team Training', 'Plan training for regional sales team', 'pending', 'medium', v_london_branch, v_head_london_sales_id, 'Emma Wilson', CURRENT_DATE + INTERVAL '28 days', 0, v_exec_strategy_id);
  END IF;

  IF v_emp_london_sales_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Client Meeting - British Corp', 'Conduct sales meeting with British Corporation', 'completed', 'high', v_london_branch, v_emp_london_sales_id, 'Oliver Smith', CURRENT_DATE - INTERVAL '5 days', 100, v_head_london_sales_id),
      ('Proposal Submission', 'Submit proposals to European clients', 'in-progress', 'high', v_london_branch, v_emp_london_sales_id, 'Oliver Smith', CURRENT_DATE + INTERVAL '6 days', 75, v_head_london_sales_id),
      ('Market Research', 'Research local market trends and opportunities', 'pending', 'medium', v_london_branch, v_emp_london_sales_id, 'Oliver Smith', CURRENT_DATE + INTERVAL '17 days', 0, v_head_london_sales_id);
  END IF;

  IF v_emp_london_ops_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Warehouse Operations Review', 'Review warehouse operations in London facility', 'completed', 'medium', v_london_branch, v_emp_london_ops_id, 'Sophie Brown', CURRENT_DATE - INTERVAL '4 days', 100, v_head_ops_id),
      ('Logistics Coordination', 'Coordinate logistics for European distribution', 'in-progress', 'high', v_london_branch, v_emp_london_ops_id, 'Sophie Brown', CURRENT_DATE + INTERVAL '8 days', 55, v_head_ops_id),
      ('Inventory Management', 'Implement improved inventory management system', 'pending', 'medium', v_london_branch, v_emp_london_ops_id, 'Sophie Brown', CURRENT_DATE + INTERVAL '18 days', 0, v_head_ops_id);
  END IF;

  -- Tokyo Employees
  IF v_emp_tokyo_sales_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Japan Market Entry Strategy', 'Develop strategy for Japanese market entry', 'completed', 'high', v_tokyo_branch, v_emp_tokyo_sales_id, 'Hiroshi Tanaka', CURRENT_DATE - INTERVAL '9 days', 100, v_head_sales_id),
      ('Local Partnership Development', 'Develop partnerships with local businesses', 'in-progress', 'high', v_tokyo_branch, v_emp_tokyo_sales_id, 'Hiroshi Tanaka', CURRENT_DATE + INTERVAL '13 days', 45, v_head_sales_id),
      ('Cultural Market Research', 'Research cultural aspects of Japanese market', 'pending', 'medium', v_tokyo_branch, v_emp_tokyo_sales_id, 'Hiroshi Tanaka', CURRENT_DATE + INTERVAL '26 days', 0, v_head_sales_id);
  END IF;

  IF v_emp_tokyo_rd_id IS NOT NULL THEN
    INSERT INTO public.tasks (title, description, status, priority, branch, assignee_id, assignee_name, due_date, progress, created_by) VALUES
      ('Product Localization Research', 'Research product localization for Japanese market', 'completed', 'medium', v_tokyo_branch, v_emp_tokyo_rd_id, 'Yuki Nakamura', CURRENT_DATE - INTERVAL '6 days', 100, v_head_rd_id),
      ('Technical Collaboration', 'Collaborate with Japanese technical partners', 'in-progress', 'high', v_tokyo_branch, v_emp_tokyo_rd_id, 'Yuki Nakamura', CURRENT_DATE + INTERVAL '11 days', 50, v_head_rd_id),
      ('Innovation Lab Setup', 'Set up innovation lab in Tokyo office', 'pending', 'medium', v_tokyo_branch, v_emp_tokyo_rd_id, 'Yuki Nakamura', CURRENT_DATE + INTERVAL '24 days', 0, v_head_rd_id);
  END IF;

  RAISE NOTICE '✅ Task seed data completed successfully!';
  RAISE NOTICE '   Total tasks created with varied statuses and progress levels';
  
END $$;

