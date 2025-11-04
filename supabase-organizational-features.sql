-- =====================================================
-- ORGANIZATIONAL FEATURES MIGRATION
-- Run this AFTER supabase-migration.sql
-- =====================================================

-- =====================================================
-- LEAVE MANAGEMENT SYSTEM
-- =====================================================

-- Leave types table (e.g., Annual, Sick, Maternity, etc.)
CREATE TABLE IF NOT EXISTS public.leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  max_days_per_year INTEGER DEFAULT 0, -- 0 means unlimited
  carry_forward BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave balance tracker (tracks leave balance per user per year)
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_allotted INTEGER NOT NULL DEFAULT 0,
  used INTEGER DEFAULT 0,
  pending INTEGER DEFAULT 0,
  remaining INTEGER NOT NULL,
  carried_forward INTEGER DEFAULT 0, -- From previous year
  UNIQUE(user_id, leave_type_id, year),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave requests/applications
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  attachments TEXT[], -- URLs to attachment files
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

-- Leave calendar (for tracking team leave visibility)
CREATE TABLE IF NOT EXISTS public.leave_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leave_request_id UUID NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  date DATE NOT NULL,
  is_half_day BOOLEAN DEFAULT false,
  half_day_type TEXT CHECK (half_day_type IN ('morning', 'afternoon')),
  UNIQUE(leave_request_id, date),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORGANIZATIONAL STRUCTURE
-- =====================================================

-- Organizational chart positions/hierarchy
CREATE TABLE IF NOT EXISTS public.org_chart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  position_name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  branch_id UUID REFERENCES public.branches(id),
  reports_to_id UUID REFERENCES public.org_chart(id), -- Self-referencing for hierarchy
  level INTEGER DEFAULT 0, -- Organizational level (0 = CEO, 1 = Executives, etc.)
  is_manager BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- POLICIES AND DOCUMENTS
-- =====================================================

-- Policy categories
CREATE TABLE IF NOT EXISTS public.policy_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policies and documents
CREATE TABLE IF NOT EXISTS public.policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- Full policy content or markdown
  category_id UUID REFERENCES public.policy_categories(id),
  version TEXT DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  applies_to_roles TEXT[], -- Which roles can view this
  file_url TEXT, -- Link to PDF or document file
  effective_date DATE,
  expiry_date DATE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  approved_by UUID REFERENCES public.users(id),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy acknowledgments (track who has read/acknowledged policies)
CREATE TABLE IF NOT EXISTS public.policy_acknowledgments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(policy_id, user_id)
);

-- =====================================================
-- ANNOUNCEMENTS
-- =====================================================

-- Organizational announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'important', 'urgent', 'event', 'policy_update')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'department', 'branch', 'role')),
  target_department TEXT,
  target_branch TEXT,
  target_roles TEXT[], -- Specific roles if not 'all'
  is_pinned BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ, -- When announcement expires
  attachments TEXT[],
  created_by UUID NOT NULL REFERENCES public.users(id),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcement views tracking
CREATE TABLE IF NOT EXISTS public.announcement_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- =====================================================
-- EVENTS AND CALENDAR
-- =====================================================

-- Company events (meetings, training, etc.)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'training', 'workshop', 'social', 'holiday', 'deadline')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  virtual_link TEXT,
  organizer_id UUID NOT NULL REFERENCES public.users(id),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'department', 'branch', 'custom')),
  target_department TEXT,
  target_branch TEXT,
  target_users UUID[], -- Specific user IDs for custom events
  is_all_day BOOLEAN DEFAULT false,
  requires_rsvp BOOLEAN DEFAULT false,
  max_attendees INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_time > start_time)
);

-- Event attendees
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'attending', 'not_attending', 'maybe')),
  attended BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- =====================================================
-- ASSET MANAGEMENT
-- =====================================================

-- Asset categories
CREATE TABLE IF NOT EXISTS public.asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES public.asset_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company assets
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.asset_categories(id),
  asset_tag TEXT UNIQUE, -- Barcode/QR code identifier
  serial_number TEXT,
  purchase_date DATE,
  purchase_cost DECIMAL(10, 2),
  current_value DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired', 'lost')),
  location TEXT, -- Physical location
  branch_id UUID REFERENCES public.branches(id),
  department_id UUID REFERENCES public.departments(id),
  assigned_to UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ,
  warranty_expiry DATE,
  maintenance_schedule TEXT, -- JSON or text
  image_url TEXT,
  documentation_url TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset assignment history
CREATE TABLE IF NOT EXISTS public.asset_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.users(id),
  assigned_by UUID NOT NULL REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  return_reason TEXT,
  condition_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRAINING AND DEVELOPMENT
-- =====================================================

-- Training programs
CREATE TABLE IF NOT EXISTS public.training_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., 'Technical', 'Soft Skills', 'Compliance'
  duration_hours DECIMAL(5, 2),
  format TEXT CHECK (format IN ('online', 'in-person', 'hybrid', 'self-paced')),
  provider TEXT, -- Internal or external provider name
  cost DECIMAL(10, 2),
  target_roles TEXT[], -- Which roles should take this
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  content_url TEXT, -- Link to training materials
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee training records
CREATE TABLE IF NOT EXISTS public.training_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  training_program_id UUID NOT NULL REFERENCES public.training_programs(id),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'expired')),
  enrolled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expiry_date DATE, -- For certifications that expire
  score DECIMAL(5, 2), -- If there's a test/assessment
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, training_program_id)
);

-- =====================================================
-- PERFORMANCE REVIEWS
-- =====================================================

-- Performance review cycles
CREATE TABLE IF NOT EXISTS public.review_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('annual', 'semi-annual', 'quarterly', 'monthly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance reviews
CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_cycle_id UUID NOT NULL REFERENCES public.review_cycles(id),
  employee_id UUID NOT NULL REFERENCES public.users(id),
  reviewer_id UUID NOT NULL REFERENCES public.users(id), -- Manager/HR reviewing
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'self_review', 'manager_review', 'hr_review', 'completed', 'cancelled')),
  self_review_date TIMESTAMPTZ,
  manager_review_date TIMESTAMPTZ,
  overall_rating DECIMAL(3, 1) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  employee_comments TEXT,
  manager_comments TEXT,
  goals_achieved INTEGER DEFAULT 0,
  goals_total INTEGER DEFAULT 0,
  strengths TEXT,
  areas_for_improvement TEXT,
  next_cycle_goals TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance review criteria/ratings
CREATE TABLE IF NOT EXISTS public.review_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  performance_review_id UUID NOT NULL REFERENCES public.performance_reviews(id) ON DELETE CASCADE,
  criterion TEXT NOT NULL, -- e.g., 'Communication', 'Problem Solving'
  rating DECIMAL(3, 1) CHECK (rating >= 0 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- KNOWLEDGE BASE
-- =====================================================

-- Knowledge base categories
CREATE TABLE IF NOT EXISTS public.kb_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES public.kb_categories(id),
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge base articles
CREATE TABLE IF NOT EXISTS public.kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown or HTML
  category_id UUID REFERENCES public.kb_categories(id),
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID NOT NULL REFERENCES public.users(id),
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge base article feedback
CREATE TABLE IF NOT EXISTS public.kb_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- =====================================================
-- ENABLE RLS AND CREATE POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_chart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_feedback ENABLE ROW LEVEL SECURITY;

-- Leave Requests Policies
CREATE POLICY "Users can view their own leave requests" ON public.leave_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team leave requests" ON public.leave_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'department_head', 'executive', 'ceo', 'admin')
        AND (branch = (SELECT branch FROM public.users WHERE id = leave_requests.user_id)
          OR department = (SELECT department FROM public.users WHERE id = leave_requests.user_id))
    )
  );

CREATE POLICY "Users can create their own leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can approve/reject leave requests" ON public.leave_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'department_head', 'executive', 'ceo', 'admin')
    )
  );

-- Leave Balances Policies
CREATE POLICY "Users can view their own leave balances" ON public.leave_balances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team leave balances" ON public.leave_balances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u1
      JOIN public.users u2 ON u1.branch = u2.branch OR u1.department = u2.department
      WHERE u1.id = auth.uid() AND u2.id = leave_balances.user_id
        AND u1.role IN ('manager', 'department_head', 'executive', 'ceo', 'admin')
    )
  );

-- Announcements Policies
CREATE POLICY "All authenticated users can view announcements" ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY "Managers can create announcements" ON public.announcements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'department_head', 'executive', 'ceo', 'admin')
    )
  );

-- Events Policies
CREATE POLICY "Users can view relevant events" ON public.events
  FOR SELECT USING (
    target_audience = 'all' OR
    (target_audience = 'department' AND target_department = (SELECT department FROM public.users WHERE id = auth.uid())) OR
    (target_audience = 'branch' AND target_branch = (SELECT branch FROM public.users WHERE id = auth.uid())) OR
    auth.uid() = ANY(target_users) OR
    auth.uid() = organizer_id
  );

CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Assets Policies
CREATE POLICY "Users can view assigned assets" ON public.assets
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'admin', 'executive', 'ceo')
    )
  );

CREATE POLICY "Managers can manage assets" ON public.assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'admin', 'executive', 'ceo')
    )
  );

-- Policies/Documents Policies
CREATE POLICY "Users can view published policies" ON public.policies
  FOR SELECT USING (
    status = 'published' AND (
      'all' = ANY(applies_to_roles) OR
      (SELECT role FROM public.users WHERE id = auth.uid()) = ANY(applies_to_roles)
    )
  );

-- Performance Reviews Policies
CREATE POLICY "Users can view their own reviews" ON public.performance_reviews
  FOR SELECT USING (
    auth.uid() = employee_id OR
    auth.uid() = reviewer_id OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo', 'executive')
    )
  );

-- Knowledge Base Policies
CREATE POLICY "All users can view published articles" ON public.kb_articles
  FOR SELECT USING (status = 'published');

-- Announcement Views Policies
DROP POLICY IF EXISTS "Users can view their own announcement views" ON public.announcement_views;
CREATE POLICY "Users can view their own announcement views" ON public.announcement_views
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create announcement views" ON public.announcement_views;
CREATE POLICY "Users can create announcement views" ON public.announcement_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Asset Assignments Policies
DROP POLICY IF EXISTS "Users can view their own asset assignments" ON public.asset_assignments;
CREATE POLICY "Users can view their own asset assignments" ON public.asset_assignments
  FOR SELECT USING (
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'admin', 'executive', 'ceo')
    )
  );

DROP POLICY IF EXISTS "Managers can manage asset assignments" ON public.asset_assignments;
CREATE POLICY "Managers can manage asset assignments" ON public.asset_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'admin', 'executive', 'ceo')
    )
  );

-- Asset Categories Policies
DROP POLICY IF EXISTS "All authenticated users can view asset categories" ON public.asset_categories;
CREATE POLICY "All authenticated users can view asset categories" ON public.asset_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Managers can manage asset categories" ON public.asset_categories;
CREATE POLICY "Managers can manage asset categories" ON public.asset_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'admin', 'executive', 'ceo')
    )
  );

-- Event Attendees Policies
DROP POLICY IF EXISTS "Users can view event attendees" ON public.event_attendees;
CREATE POLICY "Users can view event attendees" ON public.event_attendees
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_attendees.event_id AND organizer_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'admin', 'executive', 'ceo')
    )
  );

DROP POLICY IF EXISTS "Users can manage their own RSVP" ON public.event_attendees;
CREATE POLICY "Users can manage their own RSVP" ON public.event_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own RSVP" ON public.event_attendees;
CREATE POLICY "Users can update their own RSVP" ON public.event_attendees
  FOR UPDATE USING (auth.uid() = user_id);

-- Leave Calendar Policies
DROP POLICY IF EXISTS "Users can view leave calendar" ON public.leave_calendar;
CREATE POLICY "Users can view leave calendar" ON public.leave_calendar
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.leave_requests lr
      JOIN public.users u ON lr.user_id = u.id
      WHERE lr.id = leave_calendar.leave_request_id
        AND (
          u.branch = (SELECT branch FROM public.users WHERE id = auth.uid())
          OR u.department = (SELECT department FROM public.users WHERE id = auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role IN ('manager', 'department_head', 'executive', 'ceo', 'admin')
          )
        )
    )
  );

-- Leave Types Policies
DROP POLICY IF EXISTS "All authenticated users can view active leave types" ON public.leave_types;
CREATE POLICY "All authenticated users can view active leave types" ON public.leave_types
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage leave types" ON public.leave_types;
CREATE POLICY "Admins can manage leave types" ON public.leave_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'executive', 'ceo')
    )
  );

-- Org Chart Policies
DROP POLICY IF EXISTS "All authenticated users can view org chart" ON public.org_chart;
CREATE POLICY "All authenticated users can view org chart" ON public.org_chart
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage org chart" ON public.org_chart;
CREATE POLICY "Admins can manage org chart" ON public.org_chart
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'executive', 'ceo')
    )
  );

-- Policy Acknowledgments Policies
DROP POLICY IF EXISTS "Users can view their own policy acknowledgments" ON public.policy_acknowledgments;
CREATE POLICY "Users can view their own policy acknowledgments" ON public.policy_acknowledgments
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own policy acknowledgments" ON public.policy_acknowledgments;
CREATE POLICY "Users can create their own policy acknowledgments" ON public.policy_acknowledgments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Managers can view all policy acknowledgments" ON public.policy_acknowledgments;
CREATE POLICY "Managers can view all policy acknowledgments" ON public.policy_acknowledgments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'department_head', 'admin', 'executive', 'ceo')
    )
  );

-- Policy Categories Policies
DROP POLICY IF EXISTS "All authenticated users can view active policy categories" ON public.policy_categories;
CREATE POLICY "All authenticated users can view active policy categories" ON public.policy_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Managers can manage policy categories" ON public.policy_categories;
CREATE POLICY "Managers can manage policy categories" ON public.policy_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'department_head', 'admin', 'executive', 'ceo')
    )
  );

-- Review Cycles Policies
DROP POLICY IF EXISTS "Users can view active review cycles" ON public.review_cycles;
CREATE POLICY "Users can view active review cycles" ON public.review_cycles
  FOR SELECT USING (
    status != 'draft' OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'department_head', 'admin', 'executive', 'ceo')
    )
  );

DROP POLICY IF EXISTS "Admins can manage review cycles" ON public.review_cycles;
CREATE POLICY "Admins can manage review cycles" ON public.review_cycles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'executive', 'ceo')
    )
  );

-- Review Ratings Policies
DROP POLICY IF EXISTS "Users can view review ratings for their reviews" ON public.review_ratings;
CREATE POLICY "Users can view review ratings for their reviews" ON public.review_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.performance_reviews
      WHERE id = review_ratings.performance_review_id
        AND (employee_id = auth.uid() OR reviewer_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'ceo', 'executive')
    )
  );

DROP POLICY IF EXISTS "Reviewers can create review ratings" ON public.review_ratings;
CREATE POLICY "Reviewers can create review ratings" ON public.review_ratings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.performance_reviews
      WHERE id = review_ratings.performance_review_id AND reviewer_id = auth.uid()
    )
  );

-- KB Categories Policies
DROP POLICY IF EXISTS "All authenticated users can view active KB categories" ON public.kb_categories;
CREATE POLICY "All authenticated users can view active KB categories" ON public.kb_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Managers can manage KB categories" ON public.kb_categories;
CREATE POLICY "Managers can manage KB categories" ON public.kb_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'department_head', 'admin', 'executive', 'ceo')
    )
  );

-- KB Feedback Policies
DROP POLICY IF EXISTS "Users can view their own KB feedback" ON public.kb_feedback;
CREATE POLICY "Users can view their own KB feedback" ON public.kb_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create KB feedback" ON public.kb_feedback;
CREATE POLICY "Users can create KB feedback" ON public.kb_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own KB feedback" ON public.kb_feedback;
CREATE POLICY "Users can update their own KB feedback" ON public.kb_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Training Programs Policies
DROP POLICY IF EXISTS "All authenticated users can view active training programs" ON public.training_programs;
CREATE POLICY "All authenticated users can view active training programs" ON public.training_programs
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Managers can manage training programs" ON public.training_programs;
CREATE POLICY "Managers can manage training programs" ON public.training_programs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'department_head', 'admin', 'executive', 'ceo')
    )
  );

-- Training Records Policies
DROP POLICY IF EXISTS "Users can view their own training records" ON public.training_records;
CREATE POLICY "Users can view their own training records" ON public.training_records
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Managers can view team training records" ON public.training_records;
CREATE POLICY "Managers can view team training records" ON public.training_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u1
      JOIN public.users u2 ON u1.branch = u2.branch OR u1.department = u2.department
      WHERE u1.id = auth.uid() AND u2.id = training_records.user_id
        AND u1.role IN ('manager', 'department_head', 'executive', 'ceo', 'admin')
    )
  );

DROP POLICY IF EXISTS "Managers can manage training records" ON public.training_records;
CREATE POLICY "Managers can manage training records" ON public.training_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('manager', 'department_head', 'admin', 'executive', 'ceo')
    )
  );

-- =====================================================
-- CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON public.leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON public.leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_year ON public.leave_balances(user_id, year);
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON public.announcements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_time ON public.events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_assets_assigned ON public.assets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_training_records_user ON public.training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON public.performance_reviews(employee_id);

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
-- Note: notifications is already added in supabase-migration.sql
-- These commands will only add tables if they're not already in the publication

DO $$
BEGIN
  -- Add leave_requests if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'leave_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
  END IF;

  -- Add announcements if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  END IF;

  -- Add events if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  END IF;

  -- notifications is already added in original migration, skip it
END $$;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate leave balance automatically
CREATE OR REPLACE FUNCTION calculate_leave_balance()
RETURNS TRIGGER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update remaining balance when used or pending changes
  NEW.remaining := NEW.total_allotted + NEW.carried_forward - NEW.used - NEW.pending;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_calculate_leave_balance
  BEFORE INSERT OR UPDATE ON public.leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION calculate_leave_balance();

-- Function to update leave balance when request is approved
CREATE OR REPLACE FUNCTION update_leave_balance_on_approval()
RETURNS TRIGGER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  v_year INTEGER;
  v_leave_type_id UUID;
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    v_year := EXTRACT(YEAR FROM NEW.start_date);
    v_leave_type_id := NEW.leave_type_id;
    
    -- Update used balance
    UPDATE public.leave_balances
    SET used = used + NEW.total_days,
        pending = pending - NEW.total_days,
        updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND leave_type_id = v_leave_type_id
      AND year = v_year;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_leave_balance_approval
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_leave_balance_on_approval();

-- Function to initialize leave balance for new user/year
CREATE OR REPLACE FUNCTION initialize_leave_balance(
  p_user_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS VOID
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  v_leave_type RECORD;
BEGIN
  FOR v_leave_type IN SELECT * FROM public.leave_types WHERE is_active = true
  LOOP
    INSERT INTO public.leave_balances (user_id, leave_type_id, year, total_allotted, remaining)
    VALUES (
      p_user_id,
      v_leave_type.id,
      p_year,
      COALESCE(v_leave_type.max_days_per_year, 0),
      COALESCE(v_leave_type.max_days_per_year, 0)
    )
    ON CONFLICT (user_id, leave_type_id, year) DO NOTHING;
  END LOOP;
END;
$$;

-- Function to update leave balance when request is cancelled or rejected
CREATE OR REPLACE FUNCTION update_leave_balance_on_cancel_or_reject()
RETURNS TRIGGER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  v_year INTEGER;
BEGIN
  -- If status changed from pending to cancelled or rejected, refund pending days
  IF (NEW.status = 'cancelled' OR NEW.status = 'rejected') AND OLD.status = 'pending' THEN
    v_year := EXTRACT(YEAR FROM NEW.start_date)::INTEGER;
    
    UPDATE public.leave_balances
    SET pending = pending - NEW.total_days,
        remaining = remaining + NEW.total_days,
        updated_at = NOW()
    WHERE user_id = NEW.user_id
      AND leave_type_id = NEW.leave_type_id
      AND year = v_year;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_leave_balance_cancel_reject
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND (NEW.status = 'cancelled' OR NEW.status = 'rejected'))
  EXECUTE FUNCTION update_leave_balance_on_cancel_or_reject();

