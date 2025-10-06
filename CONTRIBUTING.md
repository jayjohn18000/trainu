# Contributing to TrainU

Thank you for contributing to TrainU! This document outlines our development process and guidelines.

## Development Process

### Branch Naming
Use descriptive branch names following the pattern:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Use conventional commits format:
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(auth): add role-based access control`
- `fix(ghl): handle webhook signature verification`
- `docs(api): update integration specifications`

## Pull Request Process

### Before Submitting
1. **Run Quality Checks:**
   ```bash
   # Type checking
   pnpm run typecheck
   
   # Linting
   pnpm run lint
   
   # Formatting
   pnpm run format
   ```

2. **Update Documentation:**
   - Update relevant docs in `docs/Context/` if changing APIs or architecture
   - Update links to point to `docs/Context/` files
   - Add deprecation banners to superseded docs

3. **Add PostHog Events:**
   - Instrument new user-facing features with PostHog events
   - Follow the event naming conventions in `docs/Observability.md`
   - Test event tracking in development

### PR Checklist
Before submitting, ensure:

- [ ] **Code Quality**
  - [ ] TypeScript compilation passes (`pnpm run typecheck`)
  - [ ] ESLint passes (`pnpm run lint`)
  - [ ] Code is formatted (`pnpm run format`)
  - [ ] No console.log statements in production code

- [ ] **Testing**
  - [ ] New features have appropriate tests
  - [ ] Existing tests still pass
  - [ ] E2E tests updated if UI changes

- [ ] **Documentation**
  - [ ] README.md updated if needed
  - [ ] API changes documented in `docs/Context/`
  - [ ] Internal links updated to point to `docs/Context/`
  - [ ] Deprecated docs moved to `docs/_archive/` with deprecation banner

- [ ] **Analytics & Observability**
  - [ ] PostHog events added for new user actions
  - [ ] Sentry error tracking considered for new error paths
  - [ ] Performance implications considered

- [ ] **Security & Privacy**
  - [ ] No hardcoded secrets or API keys
  - [ ] PII handling follows security guidelines
  - [ ] New environment variables added to `.env.example`

### Review Process
1. **Automated Checks:** CI/CD pipeline runs typecheck, lint, and tests
2. **Code Review:** At least one team member reviews the PR
3. **Testing:** Reviewer tests the changes locally
4. **Documentation:** Reviewer verifies documentation updates

### Merge Requirements
- [ ] All CI checks pass
- [ ] At least one approval from team member
- [ ] No merge conflicts
- [ ] Branch is up to date with main

## Development Guidelines

### Code Style
- **TypeScript:** Strict mode enabled, prefer explicit types
- **React:** Use functional components with hooks
- **Next.js:** App Router patterns, prefer server components
- **Styling:** Tailwind CSS, prefer utility classes

### Architecture Principles
- **Agent-First:** Focus on AI agent capabilities for v1
- **Human-in-the-Loop:** All AI outputs require human approval
- **Idempotent:** All external integrations must be idempotent
- **Observable:** All user actions and system events must be tracked

### Security Guidelines
- **No Hardcoded Secrets:** Use environment variables
- **RLS Policies:** Enable Row Level Security on all user-facing tables
- **Input Validation:** Validate all external inputs
- **Error Handling:** Don't expose sensitive information in errors

### Performance Guidelines
- **Database Queries:** Use indices, avoid N+1 queries
- **API Responses:** Keep response times < 500ms (p95)
- **Bundle Size:** Monitor and optimize JavaScript bundle size
- **Images:** Use Next.js Image component with optimization

## Environment Setup

### Required Environment Variables
See `.env.example` for all required variables:

```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# GoHighLevel
GHL_API_BASE=
GHL_ACCESS_TOKEN=
GHL_LOCATION_ID=
GHL_WEBHOOK_SECRET=

# OpenAI
OPENAI_API_KEY=

# Analytics
POSTHOG_KEY=
POSTHOG_HOST=

# Error Tracking
SENTRY_DSN=
SENTRY_ENV=

# Payments (future)
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
```

### Local Development
1. **Clone and Install:**
   ```bash
   git clone <repository>
   cd train-u
   pnpm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env.local
   # Fill in required values
   ```

3. **Database Setup:**
   - Create Supabase project
   - Apply schema: `infra/supabase/schema.sql`
   - Configure RLS policies

4. **Start Development:**
   ```bash
   # Web app
   pnpm -C apps/web dev
   
   # Agent worker
   pnpm -C apps/agent dev
   ```

## Testing

### Test Types
- **Unit Tests:** Individual functions and components
- **Integration Tests:** API endpoints and database operations
- **E2E Tests:** Complete user journeys
- **Performance Tests:** Load and stress testing

### Running Tests
```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

## Documentation Standards

### Context Documents
All canonical documentation lives in `docs/Context/`:
- Use clear, concise language
- Include examples where helpful
- Cross-reference related documents
- Keep technical specifications up to date

### Code Documentation
- **README:** High-level project overview and quickstart
- **Comments:** Explain "why" not "what"
- **Type Definitions:** Use TypeScript for documentation
- **API Documentation:** Include request/response examples

### Deprecation Process
When superseding documentation:
1. Move old doc to `docs/_archive/`
2. Add deprecation banner with reference to new doc
3. Update all internal links
4. Include date of deprecation

## Troubleshooting

### Common Issues
1. **Build Failures:** Check TypeScript errors and missing dependencies
2. **Database Issues:** Verify Supabase connection and schema
3. **Webhook Issues:** Check GHL webhook configuration and signatures
4. **Analytics Issues:** Verify PostHog configuration and event tracking

### Getting Help
- **Documentation:** Check `docs/Context/` for specifications
- **Issues:** Create GitHub issue with reproduction steps
- **Discussions:** Use GitHub Discussions for questions

## Release Process

### Versioning
We use semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes prepared
- [ ] PostHog events validated
- [ ] Monitoring alerts configured

## Related Documents

- [Architecture](ARCHITECTURE.md) - System design and boundaries
- [API Contracts](API_CONTRACTS.md) - API endpoints and webhook specifications
- [Error Handling](ERRORS.md) - Error handling patterns and idempotency
- [Observability](docs/Observability.md) - Monitoring and analytics
- [Security & Privacy](docs/Context/SECURITY_PRIVACY.md) - Data protection policies
- [Vision & Scope](docs/Context/VISION_SCOPE.md) - Product direction
