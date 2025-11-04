-- Admin Settings Table for Password Reset and Other Admin Configurations
-- This table stores admin settings like password reset schedules

CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(key);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read/write settings
CREATE POLICY "Admins can manage settings" ON public.admin_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Policy: Service role has full access
CREATE POLICY "Service role has full access" ON public.admin_settings
  FOR ALL
  USING (auth.role() = 'service_role');

-- Insert default password reset settings
INSERT INTO public.admin_settings (key, value, description)
VALUES (
  'password_reset_settings',
  '{
    "enabled": true,
    "frequency": "quarterly",
    "nextResetDate": null,
    "lastResetDate": null,
    "notifyUsers": true,
    "daysBeforeNotification": 7
  }'::jsonb,
  'Password reset schedule configuration'
)
ON CONFLICT (key) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE public.admin_settings IS 'Stores admin configuration settings including password reset schedules';

