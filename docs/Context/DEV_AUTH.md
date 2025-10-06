# Authentication Implementation Guide

## Overview

TrainU uses **Supabase Auth** for authentication with email/password, providing a secure and scalable authentication system integrated with Next.js 14 App Router and Server Components.

## Architecture

### Auth Flow

```
1. User visits /dashboard/** → Middleware checks session
2. No session → Redirect to /sign-in?redirect=/dashboard/...
3. User signs in → Supabase Auth sets cookies
4. Redirect to original destination
5. Middleware refreshes session on each request
6. Server Components use session for data access
```

### Key Components

- **Middleware** (`middleware.ts`): Protects routes, refreshes sessions, handles redirects
- **Auth Helpers** (`lib/auth.ts`): Server-side session management
- **Supabase Clients**: 
  - `lib/supabase/client.ts`: Browser-side auth operations
  - `lib/supabase/server.ts`: Server-side data access (service role)
  - `lib/auth.ts`: Server Components auth with proper cookie handling

## Environment Variables

### Required

```bash
# Supabase Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Project Settings → API → Service Role (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# For backward compatibility with existing code
SUPABASE_URL=https://your-project.supabase.co
```

### Setup

1. Copy `.env.example` to `.env.local`
2. Get your Supabase project credentials from [app.supabase.com](https://app.supabase.com)
3. Navigate to: Project Settings → API
4. Copy the Project URL, anon/public key, and service_role key

## Database Setup

### 1. Apply Core Schema

First, apply the main schema:

```bash
# In Supabase SQL Editor
cat infra/supabase/schema.sql
# Copy and execute
```

### 2. Apply Auth Policies

Then apply RLS policies:

```bash
# In Supabase SQL Editor
cat infra/supabase/auth_policies.sql
# Copy and execute
```

### Key Tables

- **auth.users**: Managed by Supabase Auth (email, password hash, etc.)
- **public.users_ext**: Extension table with role (trainer/client/admin)
- **public.trainers**: Trainer profiles
- **public.clients**: Client profiles

### User Roles

Defined in `user_role` enum:
- `trainer`: Can view own clients, manage training programs
- `client`: Can view own data, goals, and progress
- `admin`: Full system access (future)

## Auth Pages

### Sign In (`/sign-in`)

- Email/password form
- "Forgot password?" link
- Redirects to dashboard or original destination
- Client-side form with `clientSupabase.auth.signInWithPassword()`

### Sign Up (`/sign-up`)

- Email/password/confirm password form
- Role selection (trainer vs client)
- Creates auth.users record + users_ext record with role
- Client-side form with `clientSupabase.auth.signUp()`

### Password Reset (`/reset-password`)

- Email input form
- Sends password reset email via `clientSupabase.auth.resetPasswordForEmail()`
- Redirects to `/update-password` after clicking email link

### Update Password (`/update-password`)

- New password form
- Updates password via `clientSupabase.auth.updateUser()`
- Redirects to dashboard

## Usage in Components

### Server Components (Recommended)

```typescript
import { requireUser, requireUserWithRole, getSession } from "@/lib/auth";

// Require authentication (redirects to /sign-in if not authenticated)
const user = await requireUser();

// Get user with role
const { user, role } = await requireUserWithRole();

// Optional: just check if authenticated
const session = await getSession();
if (session) {
  // User is authenticated
}
```

### Client Components

```typescript
"use client";
import { clientSupabase } from "@/lib/supabase/client";

// Sign in
const { data, error } = await clientSupabase.auth.signInWithPassword({
  email,
  password,
});

// Sign out
await clientSupabase.auth.signOut();

// Get current session
const { data: { session } } = await clientSupabase.auth.getSession();
```

## Row Level Security (RLS)

All user-facing tables have RLS enabled. Key patterns:

### Own Data Access

```sql
-- Users can view their own records
CREATE POLICY "Users can view own data"
  ON table_name
  FOR SELECT
  USING (auth.uid() = user_id);
```

### Trainer-Client Access

```sql
-- Trainers can view their clients' data
CREATE POLICY "Trainers can view client data"
  ON table_name
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      INNER JOIN trainers t ON t.user_id = auth.uid()
      WHERE c.user_id = table_name.user_id
    )
  );
```

### Helper Functions

```sql
-- Check if current user is a trainer
SELECT is_trainer(); -- returns boolean

-- Check if current user is admin
SELECT is_admin(); -- returns boolean
```

## Middleware Protection

Protected routes:
- `/dashboard/**` - All dashboard routes require authentication

Redirects:
- Unauthenticated access to `/dashboard/**` → `/sign-in?redirect=<original-path>`
- Authenticated access to `/sign-in` or `/sign-up` → `/dashboard`

## Session Refresh

The middleware automatically refreshes the user's session on every request. This is critical for Server Components to work correctly with auth.

## Sign Out

The `SignOutButton` component (in AppLayout header):
- Calls `clientSupabase.auth.signOut()`
- Redirects to home page
- Refreshes router to clear cached data

## Testing

### Manual Testing

1. **Sign Up Flow**
   - Visit `/sign-up`
   - Enter email, password, select role
   - Submit form
   - Check email for confirmation (if enabled)
   - Sign in at `/sign-in`

2. **Sign In Flow**
   - Visit `/sign-in`
   - Enter credentials
   - Should redirect to `/dashboard`

3. **Protected Routes**
   - Sign out
   - Try to visit `/dashboard`
   - Should redirect to `/sign-in?redirect=/dashboard`
   - Sign in
   - Should redirect back to `/dashboard`

4. **Sign Out**
   - Click sign out button in header
   - Should redirect to home page
   - Visiting `/dashboard` should redirect to sign in

### Playwright Tests

See `apps/web/tests/auth.spec.ts`:
- Anonymous user redirected from dashboard
- Sign up flow
- Sign in flow
- Protected route access
- Sign out flow

Run tests:
```bash
cd apps/web
pnpm playwright test
```

## Troubleshooting

### "Invalid JWT" Errors

- Clear browser cookies
- Sign out and sign back in
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match your project

### "User has no role assigned" Error

- User was created but `users_ext` record is missing
- Manually insert record in Supabase SQL Editor:
  ```sql
  INSERT INTO public.users_ext (user_id, role)
  VALUES ('user-uuid-here', 'client');
  ```

### Session Not Persisting

- Check middleware is enabled
- Verify cookies are being set (check browser DevTools → Application → Cookies)
- Ensure `NEXT_PUBLIC_SUPABASE_URL` starts with `https://`

### RLS Blocking Queries

- Check policies in Supabase Dashboard → Authentication → Policies
- Verify `auth.uid()` returns expected user ID
- For admin operations, use service role key (bypasses RLS)

## Security Best Practices

1. **Never expose service role key to client**
   - Only use in Server Components/Actions
   - Never in `NEXT_PUBLIC_*` env vars

2. **Always use RLS**
   - Every user-facing table should have RLS enabled
   - Test policies thoroughly

3. **Password Requirements**
   - Minimum 8 characters (enforced in forms)
   - Consider adding complexity requirements

4. **Email Verification**
   - Enable in Supabase → Authentication → Settings → Email Auth
   - Recommended for production

5. **Rate Limiting**
   - Configure in Supabase → Authentication → Settings → Rate Limits
   - Protects against brute force attacks

## Next Steps

- [ ] Add OAuth providers (Google, Apple)
- [ ] Implement magic link sign-in
- [ ] Add MFA/2FA support
- [ ] Create role-based middleware
- [ ] Add session activity logging
- [ ] Implement "Remember me" functionality

## Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js App Router + Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture
- [API_CONTRACTS.md](../../API_CONTRACTS.md) - API specifications

