-- =====================================================
-- ACTIVITY LOGGING SYSTEM
-- Creates tables and functions for audit trail
-- =====================================================

-- Activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50), -- 'user', 'purchase_request', 'task', etc.
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON public.activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_severity ON public.activity_logs(severity);

-- Two-Factor Authentication table
CREATE TABLE IF NOT EXISTS public.user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  secret VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[], -- Array of backup codes
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for 2FA
CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON public.user_2fa(user_id);

-- RLS Policies for activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Service role can insert activity logs
CREATE POLICY "Service role can insert activity logs" ON public.activity_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for user_2fa
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

-- Users can view their own 2FA settings
CREATE POLICY "Users can view own 2FA" ON public.user_2fa
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own 2FA settings
CREATE POLICY "Users can update own 2FA" ON public.user_2fa
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role has full access to 2FA
CREATE POLICY "Service role has full 2FA access" ON public.user_2fa
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to log activity (can be called from application code)
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50) DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_severity VARCHAR(20) DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    severity
  )
  VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_severity
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.log_activity TO authenticated;

-- Create view for activity log summary (for admin dashboard)
CREATE OR REPLACE VIEW public.activity_log_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  action,
  severity,
  COUNT(*) as count
FROM public.activity_logs
GROUP BY DATE_TRUNC('day', created_at), action, severity
ORDER BY date DESC;

-- Grant view access to admins
GRANT SELECT ON public.activity_log_summary TO authenticated;

