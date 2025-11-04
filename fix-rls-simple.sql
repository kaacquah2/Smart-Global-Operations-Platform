-- =====================================================
-- SIMPLE FIX FOR RLS INFINITE RECURSION
-- =====================================================
-- This fixes the "infinite recursion detected in policy" error
-- by using a simpler approach that doesn't query users table
-- =====================================================

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all active users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view active users" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated can view active users" ON public.users;

-- Simple policy 1: Any authenticated user can view active users
-- This avoids recursion by not checking the users table
CREATE POLICY "Authenticated can view active users" ON public.users
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' 
    AND is_active = true
  );

-- Simple policy 2: Users can view their own profile (by ID)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- Simple policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Simple policy 4: Service role has full access
CREATE POLICY "Service role full access" ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');

-- For admin operations, we'll rely on application-level checks
-- or create a separate function/trigger if needed later

