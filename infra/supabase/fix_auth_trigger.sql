-- Fix for "Database error saving new user"
-- Run this in Supabase SQL Editor

-- First, make sure the user_role enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('trainer', 'client', 'admin');
    END IF;
END $$;

-- Drop the old trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role_value text;
BEGIN
  -- Get role from metadata, default to 'client'
  user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  
  -- Ensure role is valid
  IF user_role_value NOT IN ('trainer', 'client', 'admin') THEN
    user_role_value := 'client';
  END IF;
  
  -- Insert into users_ext
  INSERT INTO public.users_ext (user_id, role, created_at)
  VALUES (
    NEW.id,
    user_role_value::user_role,
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate errors
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure proper permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users_ext TO postgres, service_role;
GRANT SELECT, UPDATE ON public.users_ext TO authenticated;

-- Verify the trigger was created
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

