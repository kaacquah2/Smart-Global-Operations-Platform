-- =====================================================
-- CREATE ADMIN USER: kaacquah2004@gmail.com
-- =====================================================
-- This script creates an admin user profile
-- IMPORTANT: You must create the auth user first!
--
-- Option 1: Use Supabase Dashboard
--   1. Go to Authentication > Users > Add User
--   2. Email: kaacquah2004@gmail.com
--   3. Password: Acquah@17
--   4. Auto Confirm: Yes
--   5. Then run this script
--
-- Option 2: Use the Node.js script
--   node scripts/create-admin-user.js
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
  v_hq_branch_id UUID;
  v_it_dept_id UUID;
  v_avatar_url TEXT;
BEGIN
  -- Find the auth user by email
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'kaacquah2004@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth user not found! Please create the auth user first:
    1. Go to Supabase Dashboard > Authentication > Users
    2. Click "Add User"
    3. Email: kaacquah2004@gmail.com
    4. Password: Acquah@17
    5. Auto Confirm: Yes
    6. Then run this script again';
  END IF;

  -- Find or create New York HQ branch
  SELECT id INTO v_hq_branch_id 
  FROM public.branches 
  WHERE name = 'New York HQ' 
  LIMIT 1;

  IF v_hq_branch_id IS NULL THEN
    -- Create New York HQ branch if it doesn't exist
    INSERT INTO public.branches (id, name, country, city, status)
    VALUES (
      gen_random_uuid(),
      'New York HQ',
      'United States',
      'New York, NY',
      'active'
    )
    RETURNING id INTO v_hq_branch_id;
  END IF;

  -- Find or create IT department
  SELECT id INTO v_it_dept_id 
  FROM public.departments 
  WHERE name = 'Information Technology (IT)' 
    AND branch_id = v_hq_branch_id
  LIMIT 1;

  IF v_it_dept_id IS NULL THEN
    -- Create IT department if it doesn't exist
    INSERT INTO public.departments (id, name, branch_id)
    VALUES (
      gen_random_uuid(),
      'Information Technology (IT)',
      v_hq_branch_id
    )
    RETURNING id INTO v_it_dept_id;
  END IF;

  -- Generate avatar URL
  v_avatar_url := 'https://api.dicebear.com/7.x/avataaars/svg?seed=kaacquah2004';

  -- Create or update user profile
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    role, 
    department, 
    branch, 
    position, 
    phone, 
    hire_date, 
    avatar, 
    is_active, 
    manager_id
  ) VALUES (
    v_user_id,
    'kaacquah2004@gmail.com',
    'Admin User',
    'admin',
    'Information Technology (IT)',
    'New York HQ',
    'System Administrator',
    NULL,
    CURRENT_DATE,
    v_avatar_url,
    true,
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    branch = EXCLUDED.branch,
    position = EXCLUDED.position,
    phone = EXCLUDED.phone,
    hire_date = EXCLUDED.hire_date,
    avatar = EXCLUDED.avatar,
    is_active = EXCLUDED.is_active,
    manager_id = EXCLUDED.manager_id;

  RAISE NOTICE '✅ Admin user created successfully!';
  RAISE NOTICE '   Email: kaacquah2004@gmail.com';
  RAISE NOTICE '   Password: Acquah@17';
  RAISE NOTICE '   Role: admin';
  RAISE NOTICE '   User ID: %', v_user_id;

END $$;

