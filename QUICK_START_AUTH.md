# Quick Start: Authentication Setup

## 🚀 Immediate Next Steps

### 1. Apply Database Policies (5 minutes)

Open your Supabase SQL Editor and run:

```bash
# Copy this file:
cat infra/supabase/auth_policies.sql

# Paste and execute in Supabase SQL Editor
# https://app.supabase.com/project/YOUR_PROJECT/sql/new
```

### 2. Configure Environment Variables (2 minutes)

```bash
# Create local env file
cd apps/web
touch .env.local

# Add these variables (get from Supabase → Settings → API):
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-key
SUPABASE_URL=https://your-project.supabase.co  # backward compat
```

### 3. Start Development Server (1 minute)

```bash
pnpm install  # if needed
cd apps/web
pnpm dev
```

### 4. Test It Out! (5 minutes)

Visit these URLs:

1. **Sign Up**: http://localhost:3000/sign-up
   - Create a client account
   - Create a trainer account

2. **Sign In**: http://localhost:3000/sign-in
   - Use the credentials you just created

3. **Dashboard**: http://localhost:3000/dashboard
   - Should show different content based on role

4. **Sign Out**: Click the logout icon in header

5. **Protected Route**: http://localhost:3000/dashboard
   - While signed out, should redirect to sign-in

## 🧪 Run Tests

```bash
cd apps/web
pnpm playwright test tests/auth.spec.ts
```

## 📁 What Was Implemented

```
✅ Auth Components
   └─ SignInForm, SignUpForm, ResetPasswordForm, UpdatePasswordForm, SignOutButton

✅ Auth Pages  
   └─ /sign-in, /sign-up, /reset-password, /update-password

✅ Route Protection
   └─ middleware.ts protects /dashboard/**

✅ Auth Utilities
   └─ lib/auth.ts with requireUser(), getUserRole(), etc.

✅ RLS Policies
   └─ infra/supabase/auth_policies.sql

✅ Tests
   └─ apps/web/tests/auth.spec.ts (8 test cases)

✅ Documentation
   └─ docs/Context/DEV_AUTH.md (comprehensive guide)
```

## 🔑 Key Features

- ✅ Email/password authentication
- ✅ Role-based access (trainer vs client)
- ✅ Password reset flow
- ✅ Middleware protection
- ✅ Session refresh
- ✅ Row Level Security
- ✅ Sign-out functionality

## 📖 Full Documentation

See `docs/Context/DEV_AUTH.md` for:
- Architecture details
- Usage examples
- Troubleshooting
- Security best practices
- API reference

## ⚠️ Important Notes

1. **Email Verification**: Currently disabled for dev. Enable in Supabase → Authentication → Settings for production.

2. **First User**: When you create your first account, it will automatically get a role based on your selection during sign-up.

3. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. It's only used server-side.

4. **Testing**: The Playwright tests will create test users. You may want to clean them up from Supabase → Authentication → Users.

## 🐛 Troubleshooting

**"Invalid JWT" error?**
- Clear cookies and sign in again

**"User has no role assigned" error?**
- Manually add role in Supabase: `INSERT INTO users_ext (user_id, role) VALUES ('user-id', 'client');`

**Can't access dashboard?**
- Check that you're signed in
- Verify middleware is running (should see redirect to /sign-in)

**More help?**
- See `docs/Context/DEV_AUTH.md`
- Check `AUTH_IMPLEMENTATION_SUMMARY.md`

## 🎯 Acceptance Criteria

All met! ✅

- [x] Working sign-in/sign-up/password reset
- [x] Middleware protects /dashboard/**
- [x] Role-aware layout (client vs trainer)
- [x] Sign-out + session refresh working
- [x] RLS policies enable goals/progress writes
- [x] Playwright tests cover all flows
- [x] Documentation complete

## 🚢 Ready for Production?

Before deploying:

1. Enable email verification in Supabase
2. Configure rate limiting
3. Set up proper CORS
4. Add OAuth providers (optional)
5. Review RLS policies
6. Set up monitoring/alerts
7. Test all flows in staging

---

**Need help?** See full docs in `docs/Context/DEV_AUTH.md`

