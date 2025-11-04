-- =====================================================
-- COMMENTS SYSTEM
-- Run this AFTER supabase-workflow-approval-system.sql
-- =====================================================

-- Comments table for purchase requests, work submissions, etc.
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('purchase_request', 'work_submission', 'task', 'leave_request', 'legal_review', 'audit_case')),
  entity_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For threaded comments
  user_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  mentions UUID[], -- User IDs mentioned with @
  attachments TEXT[], -- File URLs
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment reactions (like, etc.)
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'thumbs_up', 'thumbs_down', 'heart', 'laugh')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Comments
CREATE POLICY "Users can view comments on accessible entities" ON public.comments
  FOR SELECT USING (
    -- Can view if they created it
    auth.uid() = user_id
    OR
    -- Can view if they have access to the entity (purchase request, etc.)
    (
      (entity_type = 'purchase_request' AND EXISTS (
        SELECT 1 FROM public.purchase_requests 
        WHERE id = comments.entity_id 
        AND (requestor_id = auth.uid() OR status IN ('submitted', 'finance_review', 'procurement_review', 'legal_review', 'audit_review', 'executive_approval'))
      ))
      OR
      (entity_type = 'work_submission' AND EXISTS (
        SELECT 1 FROM public.work_submissions 
        WHERE id = comments.entity_id 
        AND (employee_id = auth.uid() OR EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() 
          AND department = work_submissions.department
          AND role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
        ))
      ))
      OR
      (entity_type = 'task' AND EXISTS (
        SELECT 1 FROM public.tasks 
        WHERE id = comments.entity_id 
        AND (assignee_id = auth.uid() OR created_by = auth.uid())
      ))
      OR
      (entity_type = 'leave_request' AND EXISTS (
        SELECT 1 FROM public.leave_requests 
        WHERE id = comments.entity_id 
        AND (user_id = auth.uid() OR EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() 
          AND role IN ('department_head', 'manager', 'executive', 'ceo', 'admin')
        ))
      ))
    )
  );

CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Comment Reactions
CREATE POLICY "Users can view reactions" ON public.comment_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can react to comments" ON public.comment_reactions
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON public.comment_reactions(comment_id);

-- Enable realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
END $$;

