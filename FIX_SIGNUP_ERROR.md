# Fix: "Account created but role setup failed"

## What Happened

Your Supabase Auth account was created successfully, but the `users_ext` table record wasn't created because there was no RLS policy allowing it.

## Solution: Add Database Trigger

A database trigger will automatically create the `users_ext` record whenever a new user signs up.

---

## Step 1: Apply the Trigger (2 minutes)

Go to your **Supabase SQL Editor** and run this:

```sql
-- Copy and paste from: infra/supabase/auth_trigger.sql
-- Or paste this directly:

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users_ext with default role from user metadata
  INSERT INTO public.users_ext (user_id, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires after a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users_ext TO postgres, service_role;
GRANT SELECT, UPDATE ON public.users_ext TO authenticated;
```

---

## Step 2: Fix Your Existing Account (1 minute)

Your account exists in `auth.users` but not in `users_ext`. Fix it manually:

### Option A: In Supabase SQL Editor

```sql
-- Find your user ID first
SELECT id, email FROM auth.users WHERE email = 'jaylen.johnson1800@gmail.com';

-- Then insert the users_ext record (replace YOUR_USER_ID with the ID from above)
INSERT INTO public.users_ext (user_id, role, created_at)
VALUES ('YOUR_USER_ID', 'trainer', NOW());
```

### Option B: Delete and Re-create Account

1. **Delete the incomplete account**:
   - Go to Supabase → Authentication → Users
   - Find `jaylen.johnson1800@gmail.com`
   - Click the three dots → Delete User

2. **Sign up again**: Visit http://localhost:3000/sign-up
   - Now the trigger will automatically create the `users_ext` record ✅

---

## Step 3: Restart Dev Server

```bash
# The SignUpForm.tsx was updated to work with the trigger
# Restart to pick up changes:
pnpm dev
```

---

## Step 4: Test It

1. If you fixed your account (Option A): Sign in at http://localhost:3000/sign-in
2. If you deleted and will re-create: Sign up at http://localhost:3000/sign-up

Should work now! 🎉

---

## Why This Happened

The original implementation tried to insert into `users_ext` from client-side code, but:
- RLS policies didn't allow INSERT for new users
- The `auth.uid()` function returns NULL before the user is fully created

**The trigger solution is better** because:
- ✅ Runs server-side (bypasses RLS)
- ✅ Atomic operation (happens automatically with user creation)
- ✅ No race conditions
- ✅ Cleaner code

---

## Going Forward

Now when anyone signs up:
1. Supabase Auth creates the user
2. Trigger fires automatically
3. `users_ext` record created with their chosen role
4. They're redirected to dashboard

No more manual inserts needed! ✅

