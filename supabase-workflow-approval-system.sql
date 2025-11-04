-- =====================================================
-- WORKFLOW AND APPROVAL SYSTEM
-- Run this AFTER supabase-organizational-features.sql
-- =====================================================

-- =====================================================
-- WORK REVIEW WORKFLOW
-- =====================================================

-- Work submissions already exist, but we need review workflow
-- This adds review tracking to existing work_submissions table
ALTER TABLE public.work_submissions ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES public.users(id);
ALTER TABLE public.work_submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.work_submissions ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE public.work_submissions ADD COLUMN IF NOT EXISTS review_rating INTEGER CHECK (review_rating >= 1 AND review_rating <= 5);

-- =====================================================
-- PURCHASE REQUEST WORKFLOW
-- =====================================================

-- Purchase requests table
CREATE TABLE IF NOT EXISTS public.purchase_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requestor_id UUID NOT NULL REFERENCES public.users(id),
  department_id UUID REFERENCES public.departments(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'equipment', 'software', 'supplies', 'services', 'other'
  vendor_name TEXT,
  vendor_contact TEXT,
  estimated_cost DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  justification TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'finance_review', 'procurement_review', 'legal_review', 'audit_review', 'executive_approval', 'approved', 'rejected', 'cancelled')),
  attachments TEXT[], -- URLs to files (quotes, specs, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase request workflow tracking (who reviewed, when, comments)
CREATE TABLE IF NOT EXISTS public.purchase_workflow_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_request_id UUID NOT NULL REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('submitted', 'finance_review', 'procurement_review', 'legal_review', 'audit_review', 'executive_approval', 'approved', 'rejected')),
  reviewer_id UUID NOT NULL REFERENCES public.users(id),
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'requested_changes', 'forwarded')),
  comments TEXT,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEGAL & COMPLIANCE REVIEWS
-- =====================================================

-- Legal review cases
CREATE TABLE IF NOT EXISTS public.legal_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID, -- Can reference purchase_requests or other requests
  request_type TEXT NOT NULL CHECK (request_type IN ('purchase', 'contract', 'policy', 'compliance', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'needs_revision')),
  assigned_to UUID REFERENCES public.users(id),
  reviewer_id UUID REFERENCES public.users(id),
  review_notes TEXT,
  compliance_checklist JSONB, -- Structured checklist data
  risk_assessment TEXT,
  reviewed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit cases
CREATE TABLE IF NOT EXISTS public.audit_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_type TEXT NOT NULL CHECK (case_type IN ('financial', 'compliance', 'operational', 'purchase', 'contract', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'closed')),
  assigned_to UUID REFERENCES public.users(id),
  related_request_id UUID, -- Can reference purchase_requests, etc.
  findings TEXT,
  recommendations TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- DEPARTMENT WORK DASHBOARDS
-- =====================================================

-- Department metrics tracking
CREATE TABLE IF NOT EXISTS public.department_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES public.departments(id),
  metric_date DATE NOT NULL,
  metric_type TEXT NOT NULL, -- 'revenue', 'cost', 'productivity', 'quality', 'compliance', etc.
  metric_value DECIMAL(15, 2),
  metric_unit TEXT,
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, metric_date, metric_type)
);

-- =====================================================
-- INTER-DEPARTMENT COMMUNICATION CHANNELS
-- =====================================================

-- Department communication threads (replaces simple messages for formal workflows)
CREATE TABLE IF NOT EXISTS public.department_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_type TEXT NOT NULL CHECK (thread_type IN ('purchase_request', 'work_review', 'compliance', 'general')),
  title TEXT NOT NULL,
  from_department_id UUID NOT NULL REFERENCES public.departments(id),
  to_department_id UUID REFERENCES public.departments(id), -- NULL if to multiple/all
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  related_request_id UUID, -- Links to purchase_requests, work_submissions, etc.
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Thread messages (formal inter-department communication)
CREATE TABLE IF NOT EXISTS public.thread_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.department_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  sender_department_id UUID REFERENCES public.departments(id),
  content TEXT NOT NULL,
  attachments TEXT[],
  is_action_required BOOLEAN DEFAULT false,
  action_deadline TIMESTAMPTZ,
  read_by UUID[], -- Track who has read
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_workflow_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Purchase Requests Policies
DROP POLICY IF EXISTS "Users can view their own purchase requests" ON public.purchase_requests;
CREATE POLICY "Users can view their own purchase requests" ON public.purchase_requests
  FOR SELECT USING (auth.uid() = requestor_id);

DROP POLICY IF EXISTS "Finance can view purchase requests" ON public.purchase_requests;
CREATE POLICY "Finance can view purchase requests" ON public.purchase_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.departments d ON u.department = d.name
      WHERE u.id = auth.uid() 
        AND d.name = 'Finance & Accounting'
        AND u.role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
    )
  );

DROP POLICY IF EXISTS "Procurement can view purchase requests" ON public.purchase_requests;
CREATE POLICY "Procurement can view purchase requests" ON public.purchase_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.departments d ON u.department = d.name
      WHERE u.id = auth.uid() 
        AND d.name = 'Procurement & Supply-Chain'
        AND u.role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
    )
  );

DROP POLICY IF EXISTS "Legal can view purchase requests" ON public.purchase_requests;
CREATE POLICY "Legal can view purchase requests" ON public.purchase_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.departments d ON u.department = d.name
      WHERE u.id = auth.uid() 
        AND d.name = 'Legal & Compliance'
        AND u.role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can create purchase requests" ON public.purchase_requests;
CREATE POLICY "Users can create purchase requests" ON public.purchase_requests
  FOR INSERT WITH CHECK (auth.uid() = requestor_id);

DROP POLICY IF EXISTS "Department heads can review in their stage" ON public.purchase_requests;
CREATE POLICY "Department heads can review in their stage" ON public.purchase_requests
  FOR UPDATE USING (
    -- Finance can update if status is finance_review
    (status = 'finance_review' AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND department = 'Finance & Accounting' AND role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
    ))
    OR
    -- Procurement can update if status is procurement_review
    (status = 'procurement_review' AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND department = 'Procurement & Supply-Chain' AND role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
    ))
    OR
    -- Legal can update if status is legal_review
    (status = 'legal_review' AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND department = 'Legal & Compliance' AND role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
    ))
    OR
    -- Audit can update if status is audit_review
    (status = 'audit_review' AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND department = 'Finance & Accounting' AND role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
    ))
    OR
    -- Executives/CEO can approve
    (status = 'executive_approval' AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('executive', 'ceo', 'admin')
    ))
  );

-- Legal Reviews Policies
DROP POLICY IF EXISTS "Legal team can view all reviews" ON public.legal_reviews;
CREATE POLICY "Legal team can view all reviews" ON public.legal_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND department = 'Legal & Compliance'
    ) OR
    auth.uid() = created_by OR
    auth.uid() = assigned_to
  );

-- Audit Cases Policies
DROP POLICY IF EXISTS "Audit team can view all cases" ON public.audit_cases;
CREATE POLICY "Audit team can view all cases" ON public.audit_cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND department IN ('Finance & Accounting', 'Legal & Compliance')
        AND role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
    ) OR
    auth.uid() = created_by OR
    auth.uid() = assigned_to
  );

-- Department Threads Policies
DROP POLICY IF EXISTS "Users can view threads from/to their department" ON public.department_threads;
CREATE POLICY "Users can view threads from/to their department" ON public.department_threads
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE department IN (
        SELECT name FROM public.departments 
        WHERE id = department_threads.from_department_id OR id = department_threads.to_department_id
      )
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('executive', 'ceo', 'admin'))
  );

DROP POLICY IF EXISTS "Users can create threads from their department" ON public.department_threads;
CREATE POLICY "Users can create threads from their department" ON public.department_threads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.departments d ON u.department = d.name
      WHERE u.id = auth.uid() AND d.id = department_threads.from_department_id
    )
  );

-- Thread Messages Policies
DROP POLICY IF EXISTS "Users can view messages in accessible threads" ON public.thread_messages;
CREATE POLICY "Users can view messages in accessible threads" ON public.thread_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.department_threads dt
      WHERE dt.id = thread_messages.thread_id
        AND (
          auth.uid() IN (
            SELECT id FROM public.users 
            WHERE department IN (
              SELECT name FROM public.departments 
              WHERE id = dt.from_department_id OR id = dt.to_department_id
            )
          ) OR
          EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('executive', 'ceo', 'admin'))
        )
    )
  );

DROP POLICY IF EXISTS "Users can create messages in accessible threads" ON public.thread_messages;
CREATE POLICY "Users can create messages in accessible threads" ON public.thread_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.department_threads dt
      WHERE dt.id = thread_messages.thread_id
        AND (
          auth.uid() IN (
            SELECT id FROM public.users 
            WHERE department IN (
              SELECT name FROM public.departments 
              WHERE id = dt.from_department_id OR id = dt.to_department_id
            )
          ) OR
          EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('executive', 'ceo', 'admin'))
        )
    )
  );

-- Purchase Workflow Log Policies
DROP POLICY IF EXISTS "Users can view workflow log for their purchase requests" ON public.purchase_workflow_log;
CREATE POLICY "Users can view workflow log for their purchase requests" ON public.purchase_workflow_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.purchase_requests
      WHERE id = purchase_workflow_log.purchase_request_id
        AND (
          requestor_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.departments d ON u.department = d.name
            WHERE u.id = auth.uid() 
              AND d.name IN ('Finance & Accounting', 'Procurement & Supply-Chain', 'Legal & Compliance')
              AND u.role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
          )
        )
    )
  );

-- Department Metrics Policies
DROP POLICY IF EXISTS "Users can view metrics for their department" ON public.department_metrics;
CREATE POLICY "Users can view metrics for their department" ON public.department_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.departments d ON u.department = d.name
      WHERE u.id = auth.uid() AND d.id = department_metrics.department_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('executive', 'ceo', 'admin')
    )
  );

DROP POLICY IF EXISTS "Managers can manage department metrics" ON public.department_metrics;
CREATE POLICY "Managers can manage department metrics" ON public.department_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.departments d ON u.department = d.name
      WHERE u.id = auth.uid() 
        AND d.id = department_metrics.department_id
        AND u.role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('executive', 'ceo', 'admin')
    )
  );

-- =====================================================
-- CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_purchase_requests_requestor ON public.purchase_requests(requestor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON public.purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_workflow_log_request ON public.purchase_workflow_log(purchase_request_id);
CREATE INDEX IF NOT EXISTS idx_legal_reviews_status ON public.legal_reviews(status);
CREATE INDEX IF NOT EXISTS idx_audit_cases_status ON public.audit_cases(status);
CREATE INDEX IF NOT EXISTS idx_department_threads_departments ON public.department_threads(from_department_id, to_department_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to advance purchase request to next stage
CREATE OR REPLACE FUNCTION advance_purchase_request(
  p_request_id UUID,
  p_reviewer_id UUID,
  p_action TEXT, -- 'approved', 'rejected', 'requested_changes'
  p_comments TEXT DEFAULT NULL
)
RETURNS VOID
SET search_path = ''
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status TEXT;
  v_next_status TEXT;
BEGIN
  -- Get current status
  SELECT status INTO v_current_status
  FROM public.purchase_requests
  WHERE id = p_request_id;

  -- Determine next status based on current status and action
  IF p_action = 'approved' THEN
    CASE v_current_status
      WHEN 'submitted' THEN v_next_status := 'finance_review';
      WHEN 'finance_review' THEN v_next_status := 'procurement_review';
      WHEN 'procurement_review' THEN v_next_status := 'legal_review';
      WHEN 'legal_review' THEN v_next_status := 'audit_review';
      WHEN 'audit_review' THEN v_next_status := 'executive_approval';
      WHEN 'executive_approval' THEN v_next_status := 'approved';
      ELSE v_next_status := v_current_status;
    END CASE;
  ELSIF p_action = 'rejected' THEN
    v_next_status := 'rejected';
  ELSE
    -- requested_changes - stays in current stage
    v_next_status := v_current_status;
  END IF;

  -- Log the workflow action
  INSERT INTO public.purchase_workflow_log (purchase_request_id, stage, reviewer_id, action, comments)
  VALUES (p_request_id, v_current_status, p_reviewer_id, p_action, p_comments);

  -- Update request status
  UPDATE public.purchase_requests
  SET status = v_next_status,
      updated_at = NOW()
  WHERE id = p_request_id;
END;
$$;

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'purchase_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'department_threads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.department_threads;
  END IF;
END $$;

