# Fix "Database error saving new user"

The trigger is failing. Here are two options:

---

## Option 1: Fix the Trigger (Recommended)

Run this in **Supabase SQL Editor**:

```sql
-- Copy from: infra/supabase/fix_auth_trigger.sql

-- Ensure enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('trainer', 'client', 'admin');
    END IF;
END $$;

-- Drop old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role_value text;
BEGIN
  user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  
  IF user_role_value NOT IN ('trainer', 'client', 'admin') THEN
    user_role_value := 'client';
  END IF;
  
  INSERT INTO public.users_ext (user_id, role, created_at)
  VALUES (
    NEW.id,
    user_role_value::user_role,
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users_ext TO postgres, service_role;
GRANT SELECT, UPDATE ON public.users_ext TO authenticated;
```

Then try signing up again.

---

## Option 2: Use Server Action (If Trigger Still Fails)

If the trigger approach keeps failing, we can use a different approach.

Let me know if Option 1 doesn't work and I'll implement Option 2.

---

## Debug: Check What's Missing

Run this in Supabase SQL Editor to see what might be missing:

```sql
-- Check if user_role enum exists
SELECT typname FROM pg_type WHERE typname = 'user_role';

-- Check if users_ext table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users_ext';

-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check existing users_ext records
SELECT * FROM public.users_ext LIMIT 5;
```

Share the results if you're still stuck!

