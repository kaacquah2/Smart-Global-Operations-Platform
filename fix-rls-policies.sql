-- =====================================================
-- FIX RLS INFINITE RECURSION FOR USERS TABLE
-- =====================================================
-- This fixes the "infinite recursion detected in policy" error
-- The issue is that policies are checking the users table
-- which triggers other policies that check users again
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all active users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Create a function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id 
      AND role = 'admin'
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies with better logic to avoid recursion

-- Policy 1: Users can view their own profile (by ID match)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy 2: Allow service role and authenticated users to view active users
-- This avoids recursion by not querying users table in the policy itself
CREATE POLICY "Authenticated users can view active users" ON public.users
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' 
    AND is_active = true
  );

-- Policy 3: Admins can manage all users (using function to avoid recursion)
CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Policy 4: Allow service role full access
CREATE POLICY "Service role has full access" ON public.users
  FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- Alternative: Simpler approach without function
-- =====================================================
-- If the above doesn't work, you can use this simpler approach:
/*
-- Drop all policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all active users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view active users" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;

-- Simple policy: Allow authenticated users to view active users
CREATE POLICY "Authenticated can view active users" ON public.users
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' 
    AND is_active = true
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Service role full access
CREATE POLICY "Service role full access" ON public.users
  FOR ALL
  USING (auth.role() = 'service_role');
*/

