-- Run this in Supabase SQL Editor to check your user

-- Find your auth.users record
SELECT id, email, created_at, raw_user_meta_data 
FROM auth.users 
WHERE email = 'jaylen.johnson1800@gmail.com';

-- Find your users_ext record
SELECT * 
FROM public.users_ext 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'jaylen.johnson1800@gmail.com'
);

-- If no users_ext record, manually create it:
-- (Replace YOUR_USER_ID with the ID from the first query)
/*
INSERT INTO public.users_ext (user_id, role, created_at)
VALUES ('YOUR_USER_ID', 'trainer', NOW())
ON CONFLICT (user_id) DO UPDATE SET role = 'trainer';
*/

