# TrainU Project Topography

## Current Project Structure

```
train-u/
├── apps/                           # Monorepo applications
│   ├── web/                        # Next.js App Router application (target)
│   │   ├── app/                    # App Router structure
│   │   │   ├── (auth)/            # Auth route group
│   │   │   ├── (public)/          # Public route group  
│   │   │   ├── api/               # API routes
│   │   │   ├── dashboard/         # Dashboard pages
│   │   │   └── layout.tsx         # Root layout
│   │   ├── components/            # React components
│   │   ├── lib/                   # Utilities and integrations
│   │   └── middleware.ts          # Next.js middleware
│   └── agent/                     # LangGraph worker for PocketFlow
│       └── src/                   # Agent source code
├── packages/                      # Shared packages
│   ├── types/                     # Shared TypeScript types
│   └── ui/                        # Shared UI components
├── trainu-grow-connect-main/      # Lovable/Vite app (source to migrate)
│   ├── src/                       # Vite React source
│   │   ├── pages/                 # Route components (22 files)
│   │   ├── components/            # UI components (93 files)
│   │   ├── lib/                   # Utilities and stores
│   │   ├── hooks/                 # Custom React hooks
│   │   └── services/              # External service integrations
│   ├── public/                    # Static assets
│   └── vite.config.ts            # Vite configuration
├── docs/                          # Project documentation
│   ├── Context/                   # Canonical project docs
│   ├── _archive/                  # Deprecated documents
│   └── Observability.md          # Analytics and monitoring
├── infra/                         # Infrastructure configs
│   └── supabase/                  # Database schema
└── reports/                       # Migration audit reports (generated)
```

## Top-Level Folder Purposes

- **`apps/`** - Monorepo applications (web app, agent worker)
- **`packages/`** - Shared libraries (types, UI components)
- **`trainu-grow-connect-main/`** - Legacy Lovable/Vite app to migrate from
- **`docs/`** - Project documentation and context
- **`infra/`** - Infrastructure and deployment configs
- **`reports/`** - Migration audit and analysis reports
- **`scripts/`** - Build and utility scripts
- **`GPT-5-PROMPTS/`** - AI prompt templates and context

## Migration Context

- **Source**: `trainu-grow-connect-main/` (Vite + React Router)
- **Target**: `apps/web/` (Next.js App Router - already partially implemented)
- **Status**: Next.js app exists but needs migration of Lovable app features
- **Architecture**: Monorepo with shared packages and multiple apps
