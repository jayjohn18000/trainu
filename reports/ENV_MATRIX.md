# Environment Variables Matrix

## Current Environment Variables

| NAME | Used in file(s) | Required? | Scope | Source |
|------|----------------|-----------|-------|---------|
| **Supabase** |
| `NEXT_PUBLIC_SUPABASE_URL` | apps/web/lib/auth.ts, apps/web/lib/supabaseClient.ts, apps/agent/src/logger.ts, scripts/seed_dev.py | ✅ Required | Client + Server | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | apps/web/lib/auth.ts, apps/web/lib/supabaseClient.ts | ✅ Required | Client | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | apps/agent/src/logger.ts, apps/web/app/api/webhooks/ghl/route.ts, apps/web/lib/serverSupabase.ts | ✅ Required | Server Only | Supabase Dashboard |
| **PostHog Analytics** |
| `NEXT_PUBLIC_POSTHOG_KEY` | apps/web/lib/posthog.ts | ✅ Required | Client | PostHog Dashboard |
| `NEXT_PUBLIC_POSTHOG_HOST` | apps/web/lib/posthog.ts, infra/vercel.json | ❓ Optional | Client | Default: "https://us.i.posthog.com" |
| **GoHighLevel Integration** |
| `GHL_API_BASE` | apps/web/lib/ghl.ts | ❓ Optional | Server | Default: "https://services.leadconnectorhq.com" |
| `GHL_ACCESS_TOKEN` | apps/web/lib/ghl.ts | ✅ Required | Server | GoHighLevel API |
| `GHL_WEBHOOK_SECRET` | apps/web/app/api/webhooks/ghl/route.ts | ✅ Required | Server | GoHighLevel Webhook Settings |

## Missing Environment Variables

Based on the context documents, these additional environment variables are expected but not found in the codebase:

| NAME | Expected Source | Purpose | Required? |
|------|----------------|---------|-----------|
| `OPENAI_API_KEY` | OpenAI Dashboard | AI Agent functionality | ✅ Required |
| `SENTRY_DSN` | Sentry Dashboard | Error tracking | ✅ Required |
| `SENTRY_AUTH_TOKEN` | Sentry Dashboard | Error tracking deployment | ❓ Optional |

## Lovable App Environment Variables

The Lovable app (`trainu-grow-connect-main/`) currently has **NO environment variables** defined. This indicates:

- All data is mocked/static
- No external API integrations
- No authentication system
- No analytics tracking
- No error monitoring

## Migration Requirements

### 1. Environment Variable Migration
- **No migration needed** - Lovable app has no env vars to migrate
- **Add missing variables** to Next.js app for full functionality

### 2. Next.js App Router Considerations
- **Client variables**: Must be prefixed with `NEXT_PUBLIC_`
- **Server variables**: No prefix required, only available in server components/API routes
- **Build-time variables**: Available during build process
- **Runtime variables**: Available during runtime

### 3. Security Considerations
- **Client variables**: Exposed to browser, use only for non-sensitive data
- **Server variables**: Keep API keys and secrets server-only
- **Webhook secrets**: Critical for security, must be server-only

## Recommended .env.example

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# GoHighLevel Integration
GHL_API_BASE=https://services.leadconnectorhq.com
GHL_ACCESS_TOKEN=your_ghl_access_token
GHL_WEBHOOK_SECRET=your_ghl_webhook_secret

# OpenAI Integration
OPENAI_API_KEY=your_openai_api_key

# Sentry Error Tracking
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

## Validation Checklist

- [ ] All required environment variables are set
- [ ] Client variables are prefixed with `NEXT_PUBLIC_`
- [ ] Server variables are not exposed to client
- [ ] Webhook secrets are properly configured
- [ ] API keys are stored securely
- [ ] Environment variables are documented in `.env.example`
