# Configuration

## Required Environment Variables

### Supabase (Database, Auth, Storage)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anon key for client-side
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server-side operations

### GoHighLevel (CRM, Bookings, Messaging)
- `GHL_API_BASE` - GHL API base URL (https://rest.gohighlevel.com/v1)
- `GHL_ACCESS_TOKEN` - GHL API access token
- `GHL_LOCATION_ID` - GHL location/agency ID
- `GHL_WEBHOOK_SECRET` - Webhook signature verification secret

### OpenAI (AI Agent LLM)
- `OPENAI_API_KEY` - OpenAI API key for LLM calls

### Analytics & Monitoring
- `POSTHOG_KEY` - PostHog project key for analytics
- `POSTHOG_HOST` - PostHog instance URL
- `SENTRY_DSN` - Sentry DSN for error tracking
- `SENTRY_ENV` - Environment name (development/staging/production)

### Application
- `APP_URL` - Application URL (http://localhost:3000 for dev)
- `WP_URL` - WordPress site URL (https://trainu.online)
- `NODE_ENV` - Node environment (development/production)

### Optional: Future Integrations
- `STRIPE_PUBLIC_KEY` - Stripe public key for payments
- `STRIPE_SECRET_KEY` - Stripe secret key for payments
- `POCKETFLOW_BASE_URL` - PocketFlow API base URL
- `POCKETFLOW_API_KEY` - PocketFlow API key
- `AGENT_LOG_LEVEL` - Log level for agent operations (info/debug/error)

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in all required values
3. Ensure Supabase project is created and schema applied
4. Configure GHL webhook endpoints
5. Set up PostHog and Sentry projects

## Development Overrides

For local development, you can optionally set:
- `DISABLE_AI_APPROVAL=true` - Skip human approval for AI messages
- `MOCK_GHL_WEBHOOKS=true` - Use mock webhook data
- `DISABLE_POSTHOG=true` - Disable analytics tracking
