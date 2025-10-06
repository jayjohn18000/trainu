# Next.js App Router Migration Map

## Route Migration Mapping

| Current Path | Next App Route | Layout Segment | Data Needs | Client/Server Component |
|--------------|----------------|----------------|------------|------------------------|
| **Public Routes** |
| `/` | `app/(public)/page.tsx` | `(public)` | Static content | Server |
| `/discover` | `app/(public)/discover/page.tsx` | `(public)` | Trainer data, filters | Server + Client |
| `/directory` | `app/(public)/directory/page.tsx` | `(public)` | Trainer data, search | Server + Client |
| `/trainers/:slug` | `app/(public)/trainers/[slug]/page.tsx` | `(public)` | Trainer data, sessions | Server + Client |
| **Protected Routes** |
| `/dashboard/client` | `app/(dashboard)/client/page.tsx` | `(dashboard)` | Client data, goals | Server + Client |
| `/dashboard/trainer` | `app/(dashboard)/trainer/page.tsx` | `(dashboard)` | Trainer data, clients | Server + Client |
| `/dashboard/gym-admin` | `app/(dashboard)/gym-admin/page.tsx` | `(dashboard)` | Admin data, analytics | Server + Client |
| `/calendar` | `app/(dashboard)/calendar/page.tsx` | `(dashboard)` | Calendar data, sessions | Server + Client |
| `/workout` | `app/(dashboard)/workout/page.tsx` | `(dashboard)` | Workout data, exercises | Client |
| `/progress` | `app/(dashboard)/progress/page.tsx` | `(dashboard)` | Progress data, charts | Server + Client |
| `/programs` | `app/(dashboard)/programs/page.tsx` | `(dashboard)` | Program data, templates | Server + Client |
| `/clients` | `app/(dashboard)/clients/page.tsx` | `(dashboard)` | Client data, management | Server + Client |
| `/messages` | `app/(dashboard)/messages/page.tsx` | `(dashboard)` | Messages, conversations | Client |
| `/community/events` | `app/(dashboard)/community/events/page.tsx` | `(dashboard)` | Event data, RSVP | Server + Client |
| `/events/:id` | `app/(dashboard)/community/events/[id]/page.tsx` | `(dashboard)` | Event details, attendees | Server + Client |
| `/community/people` | `app/(dashboard)/community/people/page.tsx` | `(dashboard)` | People data, connections | Server + Client |
| `/community/groups` | `app/(dashboard)/community/groups/page.tsx` | `(dashboard)` | Group data, members | Server + Client |
| `/growth` | `app/(dashboard)/growth/page.tsx` | `(dashboard)` | Analytics, metrics | Server + Client |
| `/settings` | `app/(dashboard)/settings/page.tsx` | `(dashboard)` | User settings, preferences | Client |
| `/admin` | `app/(dashboard)/admin/page.tsx` | `(dashboard)` | Admin data, management | Server + Client |
| `/admin/trainers` | `app/(dashboard)/admin/trainers/page.tsx` | `(dashboard)` | Trainer management | Server + Client |
| `/admin/classes` | `app/(dashboard)/admin/classes/page.tsx` | `(dashboard)` | Class management | Server + Client |

## Layout Structure

### Root Layout (`app/layout.tsx`)
```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### Public Layout (`app/(public)/layout.tsx`)
```tsx
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  )
}
```

### Dashboard Layout (`app/(dashboard)/layout.tsx`)
```tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
```

## Data Fetching Strategy

### Server Components (Initial Data)
- **Trainer data**: Fetch from Supabase in server components
- **User data**: Fetch from Supabase auth in server components
- **Static content**: Pre-render at build time

### Client Components (Interactive Data)
- **Real-time updates**: Use Supabase real-time subscriptions
- **Form submissions**: Use Server Actions
- **Search/filtering**: Use client-side state with debouncing
- **Calendar interactions**: Use client-side state management

### API Routes
- **Webhooks**: `app/api/webhooks/ghl/route.ts` (already exists)
- **Booking API**: `app/api/bookings/route.ts` (new)
- **Messages API**: `app/api/messages/route.ts` (new)
- **Analytics API**: `app/api/analytics/route.ts` (new)

## State Management Migration

### Current State (Zustand)
- **Auth Store**: `useAuthStore` - Migrate to Supabase auth
- **Calendar Store**: `useCalendarStore` - Keep for client-side calendar state

### Next.js App Router State
- **Server State**: Use Supabase queries in server components
- **Client State**: Use React state + Zustand for complex interactions
- **Form State**: Use React Hook Form with Server Actions
- **URL State**: Use Next.js searchParams for filters

## Component Migration Strategy

### 1. Layout Components
- **AppLayout** → Split into Public/Dashboard layouts
- **TabNavigation** → Move to dashboard layout
- **RoleSwitcher** → Move to dashboard header

### 2. Page Components
- **Convert to server components** where possible
- **Add loading.tsx** for each route segment
- **Add error.tsx** for error boundaries
- **Add not-found.tsx** for 404 pages

### 3. Interactive Components
- **Booking components** → Use Server Actions
- **Calendar components** → Keep as client components
- **Form components** → Use React Hook Form + Server Actions

## Authentication Migration

### Current (Mock Auth)
- **Zustand store** with mock user data
- **Local storage** persistence
- **Role switching** for demo purposes

### Target (Supabase Auth)
- **Server-side auth** with Supabase
- **Middleware protection** for dashboard routes
- **Role-based access** with RLS policies

## Performance Optimizations

### 1. Code Splitting
- **Route-based splitting** with App Router
- **Component lazy loading** for heavy components
- **Dynamic imports** for charts and calendars

### 2. Data Fetching
- **Server components** for initial data
- **Streaming** for progressive loading
- **Caching** with Next.js cache system

### 3. Bundle Optimization
- **Tree shaking** for unused components
- **Dynamic imports** for large libraries
- **Image optimization** with Next.js Image

## Migration Phases

### Phase 1: Core Infrastructure
- [ ] Set up App Router structure
- [ ] Migrate authentication to Supabase
- [ ] Set up middleware for route protection
- [ ] Migrate basic layouts

### Phase 2: Public Routes
- [ ] Migrate landing page
- [ ] Migrate directory and discovery
- [ ] Migrate trainer profiles
- [ ] Set up public layout

### Phase 3: Dashboard Routes
- [ ] Migrate dashboard layouts
- [ ] Migrate core dashboard pages
- [ ] Set up data fetching patterns
- [ ] Migrate interactive components

### Phase 4: Advanced Features
- [ ] Migrate booking system
- [ ] Migrate messaging system
- [ ] Migrate calendar functionality
- [ ] Set up real-time features

### Phase 5: Optimization
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Error handling
- [ ] Testing and validation
