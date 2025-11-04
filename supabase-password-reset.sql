-- =====================================================
-- PASSWORD RESET REQUEST SYSTEM
-- =====================================================

-- Password reset requests table
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_by UUID REFERENCES public.users(id),
  processed_at TIMESTAMPTZ,
  new_password TEXT, -- Temporary storage, will be cleared after sending
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create a password reset request (forgot password)
CREATE POLICY "Anyone can create password reset requests" ON public.password_reset_requests
  FOR INSERT WITH CHECK (true);

-- Users can view their own requests
CREATE POLICY "Users can view their own password reset requests" ON public.password_reset_requests
  FOR SELECT USING (
    user_email = (SELECT email FROM public.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'executive', 'ceo')
    )
  );

-- Only admins can update/process requests
CREATE POLICY "Admins can update password reset requests" ON public.password_reset_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'executive', 'ceo')
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status ON public.password_reset_requests(status);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_user_email ON public.password_reset_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_requested_at ON public.password_reset_requests(requested_at);

-- Function to notify admins when password reset is requested
CREATE OR REPLACE FUNCTION notify_admin_password_reset_request()
RETURNS TRIGGER
SET search_path = ''
LANGUAGE plpgsql
AS $$
DECLARE
  v_admin_ids UUID[];
  v_user_name TEXT;
BEGIN
  -- Get user name if user_id exists
  IF NEW.user_id IS NOT NULL THEN
    SELECT name INTO v_user_name FROM public.users WHERE id = NEW.user_id;
  END IF;
  
  -- Get all admin user IDs
  SELECT ARRAY_AGG(id) INTO v_admin_ids
  FROM public.users
  WHERE role IN ('admin', 'executive', 'ceo') AND is_active = true;
  
  -- Create notifications for all admins
  IF v_admin_ids IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, description, read)
    SELECT 
      admin_id,
      'alert',
      'Password Reset Request',
      COALESCE(v_user_name || ' (' || NEW.user_email || ')', NEW.user_email) || ' has requested a password reset.',
      false
    FROM UNNEST(v_admin_ids) AS admin_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to notify admins when password reset is requested
CREATE TRIGGER trigger_notify_admin_password_reset
  AFTER INSERT ON public.password_reset_requests
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_admin_password_reset_request();

-- Function to clear sensitive data after 24 hours
CREATE OR REPLACE FUNCTION cleanup_password_reset_data()
RETURNS void
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clear new_password field for completed requests older than 24 hours
  UPDATE public.password_reset_requests
  SET new_password = NULL,
      updated_at = NOW()
  WHERE status = 'completed'
    AND processed_at < NOW() - INTERVAL '24 hours'
    AND new_password IS NOT NULL;
END;
$$;

