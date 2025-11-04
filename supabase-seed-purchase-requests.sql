-- =====================================================
-- PURCHASE REQUESTS SEED DATA
-- Creates realistic purchase requests for various employees
-- with different statuses in the approval workflow
-- =====================================================

DO $$
DECLARE
  -- Department IDs
  v_it_dept_id UUID;
  v_finance_dept_id UUID;
  v_sales_dept_id UUID;
  v_hr_dept_id UUID;
  v_marketing_dept_id UUID;
  v_ops_dept_id UUID;
  v_legal_dept_id UUID;
  v_procurement_dept_id UUID;
  
  -- User IDs
  v_emp_it_1_id UUID;
  v_emp_it_2_id UUID;
  v_emp_finance_1_id UUID;
  v_emp_finance_2_id UUID;
  v_emp_sales_1_id UUID;
  v_emp_sales_2_id UUID;
  v_emp_marketing_1_id UUID;
  v_emp_hr_1_id UUID;
  v_emp_ops_1_id UUID;
  v_manager_it_id UUID;
  v_manager_sales_id UUID;
  v_head_finance_id UUID;
  v_head_marketing_id UUID;
  v_head_legal_id UUID;
  v_head_procurement_id UUID;
  v_head_ops_id UUID;
  
BEGIN
  -- Get Department IDs
  SELECT id INTO v_it_dept_id FROM public.departments WHERE name = 'Information Technology (IT)' LIMIT 1;
  SELECT id INTO v_finance_dept_id FROM public.departments WHERE name = 'Finance & Accounting' LIMIT 1;
  SELECT id INTO v_sales_dept_id FROM public.departments WHERE name = 'Sales & Business Development' LIMIT 1;
  SELECT id INTO v_hr_dept_id FROM public.departments WHERE name = 'Human Resources (HR)' LIMIT 1;
  SELECT id INTO v_marketing_dept_id FROM public.departments WHERE name = 'Marketing & Communications' LIMIT 1;
  SELECT id INTO v_ops_dept_id FROM public.departments WHERE name = 'Operations & Logistics' LIMIT 1;
  SELECT id INTO v_legal_dept_id FROM public.departments WHERE name = 'Legal & Compliance' LIMIT 1;
  SELECT id INTO v_procurement_dept_id FROM public.departments WHERE name = 'Procurement & Supply-Chain' LIMIT 1;

  -- Get User IDs
  SELECT id INTO v_emp_it_1_id FROM auth.users WHERE email = 'employee.it.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_it_2_id FROM auth.users WHERE email = 'employee.it.2@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_finance_1_id FROM auth.users WHERE email = 'employee.finance.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_finance_2_id FROM auth.users WHERE email = 'employee.finance.2@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_sales_1_id FROM auth.users WHERE email = 'employee.sales.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_sales_2_id FROM auth.users WHERE email = 'employee.sales.2@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_marketing_1_id FROM auth.users WHERE email = 'employee.marketing.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_hr_1_id FROM auth.users WHERE email = 'employee.hr.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_emp_ops_1_id FROM auth.users WHERE email = 'employee.operations.1@sgoap.com' LIMIT 1;
  SELECT id INTO v_manager_it_id FROM auth.users WHERE email = 'manager.it@sgoap.com' LIMIT 1;
  SELECT id INTO v_manager_sales_id FROM auth.users WHERE email = 'manager.sales@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_finance_id FROM auth.users WHERE email = 'head.finance@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_marketing_id FROM auth.users WHERE email = 'head.marketing@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_legal_id FROM auth.users WHERE email = 'head.legal@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_procurement_id FROM auth.users WHERE email = 'head.procurement@sgoap.com' LIMIT 1;
  SELECT id INTO v_head_ops_id FROM auth.users WHERE email = 'head.operations@sgoap.com' LIMIT 1;

  -- ===================================================
  -- IT DEPARTMENT PURCHASE REQUESTS
  -- ===================================================
  
  IF v_emp_it_1_id IS NOT NULL AND v_it_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Draft requests
      (
        gen_random_uuid(),
        v_emp_it_1_id,
        v_it_dept_id,
        'New Development Laptops for Team',
        'Purchase 5 new high-performance laptops for the development team to improve productivity and support modern development tools.',
        'equipment',
        'TechCorp Solutions',
        'sales@techcorp.com',
        12500.00,
        'USD',
        'Current laptops are 4+ years old and cannot handle modern development workloads. This will improve team productivity by 40%.',
        'high',
        'draft',
        CURRENT_DATE - INTERVAL '10 days'
      ),
      -- Submitted requests
      (
        gen_random_uuid(),
        v_emp_it_1_id,
        v_it_dept_id,
        'Cloud Infrastructure Subscription',
        'Annual subscription for cloud infrastructure services (AWS/Azure) to host company applications.',
        'services',
        'Amazon Web Services',
        'aws-sales@amazon.com',
        35000.00,
        'USD',
        'Current infrastructure is reaching capacity. This subscription will provide scalability and reliability for next year.',
        'normal',
        'submitted',
        CURRENT_DATE - INTERVAL '8 days'
      ),
      -- Finance review
      (
        gen_random_uuid(),
        v_emp_it_1_id,
        v_it_dept_id,
        'Security Software License Renewal',
        'Annual renewal of enterprise security software licenses for endpoint protection and threat detection.',
        'software',
        'Cybersecurity Inc',
        'licenses@cybersec.com',
        18500.00,
        'USD',
        'Critical security software license expires in 30 days. Renewal is essential to maintain compliance and protection.',
        'urgent',
        'finance_review',
        CURRENT_DATE - INTERVAL '5 days'
      );
  END IF;

  IF v_emp_it_2_id IS NOT NULL AND v_it_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Procurement review
      (
        gen_random_uuid(),
        v_emp_it_2_id,
        v_it_dept_id,
        'Network Equipment Upgrade',
        'Upgrade network switches and routers to support increased bandwidth requirements and improve network reliability.',
        'equipment',
        'NetworkTech Solutions',
        'sales@networktech.com',
        22000.00,
        'USD',
        'Current network infrastructure cannot handle increased traffic. Upgrade will prevent bottlenecks and improve user experience.',
        'high',
        'procurement_review',
        CURRENT_DATE - INTERVAL '12 days'
      ),
      -- Approved
      (
        gen_random_uuid(),
        v_emp_it_2_id,
        v_it_dept_id,
        'Backup Storage Solution',
        'Purchase additional backup storage for data redundancy and disaster recovery.',
        'equipment',
        'Storage Systems Ltd',
        'info@storagesys.com',
        8500.00,
        'USD',
        'Current backup storage is at 85% capacity. Additional storage is needed to maintain backup retention policies.',
        'normal',
        'approved',
        CURRENT_DATE - INTERVAL '20 days'
      );
  END IF;

  IF v_manager_it_id IS NOT NULL AND v_it_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Legal review
      (
        gen_random_uuid(),
        v_manager_it_id,
        v_it_dept_id,
        'Enterprise Software License - CRM System',
        'Purchase enterprise license for new CRM system to improve sales tracking and customer management.',
        'software',
        'CRM Solutions Pro',
        'enterprise@crmsolutions.com',
        45000.00,
        'USD',
        'Current CRM system is outdated. New system will integrate with existing tools and provide better analytics.',
        'high',
        'legal_review',
        CURRENT_DATE - INTERVAL '15 days'
      );
  END IF;

  -- ===================================================
  -- SALES DEPARTMENT PURCHASE REQUESTS
  -- ===================================================
  
  IF v_emp_sales_1_id IS NOT NULL AND v_sales_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Draft
      (
        gen_random_uuid(),
        v_emp_sales_1_id,
        v_sales_dept_id,
        'Trade Show Booth Materials',
        'Purchase booth materials, banners, and promotional items for upcoming industry trade show.',
        'supplies',
        'Event Marketing Co',
        'sales@eventmarketing.com',
        3200.00,
        'USD',
        'Upcoming trade show in 3 weeks. Need materials to represent company effectively and generate leads.',
        'urgent',
        'draft',
        CURRENT_DATE - INTERVAL '3 days'
      ),
      -- Submitted
      (
        gen_random_uuid(),
        v_emp_sales_1_id,
        v_sales_dept_id,
        'Client Entertainment Budget',
        'Allocation for client entertainment and relationship building activities for Q1.',
        'services',
        'Various Venues',
        NULL,
        5000.00,
        'USD',
        'Essential for maintaining and building client relationships. Expected ROI of 300% through increased sales.',
        'normal',
        'submitted',
        CURRENT_DATE - INTERVAL '6 days'
      ),
      -- Finance review
      (
        gen_random_uuid(),
        v_emp_sales_1_id,
        v_sales_dept_id,
        'Sales Training Program',
        'Enroll sales team in advanced sales training program to improve closing rates.',
        'services',
        'Sales Mastery Institute',
        'training@salesmastery.com',
        12000.00,
        'USD',
        'Training will improve sales team performance by 25% based on industry benchmarks. ROI expected within 6 months.',
        'high',
        'finance_review',
        CURRENT_DATE - INTERVAL '9 days'
      );
  END IF;

  IF v_emp_sales_2_id IS NOT NULL AND v_sales_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Approved
      (
        gen_random_uuid(),
        v_emp_sales_2_id,
        v_sales_dept_id,
        'Sales Enablement Tools',
        'Purchase sales enablement software licenses for entire sales team.',
        'software',
        'SalesTools Pro',
        'licenses@sales tools.com',
        18000.00,
        'USD',
        'Will improve sales efficiency by 30% and provide better tracking of sales pipeline.',
        'normal',
        'approved',
        CURRENT_DATE - INTERVAL '25 days'
      );
  END IF;

  -- ===================================================
  -- MARKETING DEPARTMENT PURCHASE REQUESTS
  -- ===================================================
  
  IF v_emp_marketing_1_id IS NOT NULL AND v_marketing_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Draft
      (
        gen_random_uuid(),
        v_emp_marketing_1_id,
        v_marketing_dept_id,
        'Video Production Equipment',
        'Purchase professional video production equipment for creating marketing content and social media videos.',
        'equipment',
        'Video Equipment Store',
        'sales@videoequip.com',
        8500.00,
        'USD',
        'Will enable in-house video production, reducing outsourcing costs by 60% and improving content quality.',
        'normal',
        'draft',
        CURRENT_DATE - INTERVAL '2 days'
      ),
      -- Finance review
      (
        gen_random_uuid(),
        v_emp_marketing_1_id,
        v_marketing_dept_id,
        'Digital Marketing Campaign Budget',
        'Allocation for Q1 digital marketing campaigns including social media, Google Ads, and content marketing.',
        'services',
        'Digital Marketing Agency',
        'hello@digitalmarketing.com',
        25000.00,
        'USD',
        'Essential for Q1 marketing goals. Expected to generate 500+ qualified leads and increase brand awareness by 40%.',
        'high',
        'finance_review',
        CURRENT_DATE - INTERVAL '7 days'
      );
  END IF;

  IF v_head_marketing_id IS NOT NULL AND v_marketing_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Audit review (high value)
      (
        gen_random_uuid(),
        v_head_marketing_id,
        v_marketing_dept_id,
        'Brand Redesign and Rebranding',
        'Comprehensive brand redesign including logo, website, and marketing materials.',
        'services',
        'Brand Design Studio',
        'projects@branddesign.com',
        75000.00,
        'USD',
        'Current brand is outdated and doesn''t reflect company growth. Rebranding will improve market positioning.',
        'high',
        'audit_review',
        CURRENT_DATE - INTERVAL '18 days'
      );
  END IF;

  -- ===================================================
  -- FINANCE DEPARTMENT PURCHASE REQUESTS
  -- ===================================================
  
  IF v_emp_finance_1_id IS NOT NULL AND v_finance_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Submitted
      (
        gen_random_uuid(),
        v_emp_finance_1_id,
        v_finance_dept_id,
        'Accounting Software Upgrade',
        'Upgrade to latest version of accounting software for better financial reporting and compliance.',
        'software',
        'Finance Software Corp',
        'sales@financesoftware.com',
        15000.00,
        'USD',
        'Current version is 3 years old and missing critical compliance features. Upgrade is required for year-end reporting.',
        'urgent',
        'submitted',
        CURRENT_DATE - INTERVAL '4 days'
      ),
      -- Approved
      (
        gen_random_uuid(),
        v_emp_finance_1_id,
        v_finance_dept_id,
        'Financial Analysis Tools',
        'Purchase financial analysis software licenses for financial modeling and forecasting.',
        'software',
        'Finance Analytics Inc',
        'licenses@financeanalytics.com',
        12000.00,
        'USD',
        'Will improve financial analysis capabilities and enable better budgeting and forecasting.',
        'normal',
        'approved',
        CURRENT_DATE - INTERVAL '22 days'
      );
  END IF;

  IF v_emp_finance_2_id IS NOT NULL AND v_finance_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Procurement review
      (
        gen_random_uuid(),
        v_emp_finance_2_id,
        v_finance_dept_id,
        'Office Supplies - Q1',
        'Quarterly office supplies including paper, pens, folders, and other office essentials.',
        'supplies',
        'Office Supply Co',
        'orders@officesupply.com',
        2800.00,
        'USD',
        'Standard quarterly office supplies order to maintain office operations.',
        'normal',
        'procurement_review',
        CURRENT_DATE - INTERVAL '11 days'
      );
  END IF;

  -- ===================================================
  -- HR DEPARTMENT PURCHASE REQUESTS
  -- ===================================================
  
  IF v_emp_hr_1_id IS NOT NULL AND v_hr_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Submitted
      (
        gen_random_uuid(),
        v_emp_hr_1_id,
        v_hr_dept_id,
        'HR Management System',
        'Purchase HR management system for employee records, payroll, and benefits management.',
        'software',
        'HR Solutions Platform',
        'enterprise@hrsolutions.com',
        28000.00,
        'USD',
        'Current system is manual and inefficient. New system will automate processes and reduce administrative time by 50%.',
        'high',
        'submitted',
        CURRENT_DATE - INTERVAL '6 days'
      ),
      -- Approved
      (
        gen_random_uuid(),
        v_emp_hr_1_id,
        v_hr_dept_id,
        'Employee Training Materials',
        'Purchase training materials and resources for employee onboarding and development programs.',
        'supplies',
        'Training Resources Inc',
        'orders@trainingresources.com',
        4500.00,
        'USD',
        'Essential materials for new employee onboarding and ongoing training programs.',
        'normal',
        'approved',
        CURRENT_DATE - INTERVAL '30 days'
      );
  END IF;

  -- ===================================================
  -- OPERATIONS DEPARTMENT PURCHASE REQUESTS
  -- ===================================================
  
  IF v_emp_ops_1_id IS NOT NULL AND v_ops_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Finance review
      (
        gen_random_uuid(),
        v_emp_ops_1_id,
        v_ops_dept_id,
        'Warehouse Equipment',
        'Purchase new forklifts and warehouse equipment to improve logistics operations.',
        'equipment',
        'Industrial Equipment Co',
        'sales@industrialequip.com',
        55000.00,
        'USD',
        'Current equipment is aging and maintenance costs are rising. New equipment will improve efficiency and reduce downtime.',
        'high',
        'finance_review',
        CURRENT_DATE - INTERVAL '13 days'
      ),
      -- Legal review
      (
        gen_random_uuid(),
        v_emp_ops_1_id,
        v_ops_dept_id,
        'Logistics Software Platform',
        'Purchase logistics management software for supply chain optimization and inventory tracking.',
        'software',
        'Logistics Pro Systems',
        'sales@logisticspro.com',
        32000.00,
        'USD',
        'Will improve supply chain visibility, reduce inventory costs by 15%, and optimize delivery routes.',
        'normal',
        'legal_review',
        CURRENT_DATE - INTERVAL '16 days'
      );
  END IF;

  IF v_head_ops_id IS NOT NULL AND v_ops_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Approved (high value)
      (
        gen_random_uuid(),
        v_head_ops_id,
        v_ops_dept_id,
        'Fleet Vehicle Purchase',
        'Purchase 3 new delivery vehicles for expanding operations.',
        'equipment',
        'Automotive Dealership',
        'fleet@autodealer.com',
        95000.00,
        'USD',
        'Current fleet is at capacity. New vehicles will support business growth and reduce delivery times.',
        'high',
        'approved',
        CURRENT_DATE - INTERVAL '35 days'
      );
  END IF;

  -- ===================================================
  -- LEGAL DEPARTMENT PURCHASE REQUESTS
  -- ===================================================
  
  IF v_head_legal_id IS NOT NULL AND v_legal_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Submitted
      (
        gen_random_uuid(),
        v_head_legal_id,
        v_legal_dept_id,
        'Legal Research Database Subscription',
        'Annual subscription to legal research database for case law and legal precedents.',
        'services',
        'Legal Research Database',
        'subscriptions@legalresearch.com',
        18000.00,
        'USD',
        'Essential tool for legal research and case preparation. Current subscription expires next month.',
        'urgent',
        'submitted',
        CURRENT_DATE - INTERVAL '5 days'
      ),
      -- Approved
      (
        gen_random_uuid(),
        v_head_legal_id,
        v_legal_dept_id,
        'Contract Management Software',
        'Purchase contract management software for organizing and tracking legal contracts.',
        'software',
        'Contract Management Pro',
        'sales@contractmgmt.com',
        15000.00,
        'USD',
        'Will improve contract organization, tracking, and renewal management.',
        'normal',
        'approved',
        CURRENT_DATE - INTERVAL '28 days'
      );
  END IF;

  -- ===================================================
  -- PROCUREMENT DEPARTMENT PURCHASE REQUESTS
  -- ===================================================
  
  IF v_head_procurement_id IS NOT NULL AND v_procurement_dept_id IS NOT NULL THEN
    INSERT INTO public.purchase_requests (
      id, requestor_id, department_id, title, description, category, 
      vendor_name, vendor_contact, estimated_cost, currency, justification, 
      urgency, status, created_at
    ) VALUES
      -- Finance review
      (
        gen_random_uuid(),
        v_head_procurement_id,
        v_procurement_dept_id,
        'Vendor Management System',
        'Purchase vendor management system to streamline procurement processes and vendor relationships.',
        'software',
        'Vendor Management Solutions',
        'sales@vendormgmt.com',
        25000.00,
        'USD',
        'Will improve vendor tracking, contract management, and procurement efficiency by 35%.',
        'high',
        'finance_review',
        CURRENT_DATE - INTERVAL '10 days'
      );
  END IF;

  RAISE NOTICE '✅ Purchase request seed data completed successfully!';
  RAISE NOTICE '   Total purchase requests created with various statuses';
  
END $$;

