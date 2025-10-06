# Dependencies Analysis - Lovable to Next.js Migration

## Framework & Tooling Versions

### Lovable App (Source)
- **Vite**: 5.4.19
- **React**: 18.3.1
- **React Router DOM**: 6.30.1
- **TypeScript**: 5.8.3
- **Tailwind CSS**: 3.4.17
- **PostCSS**: 8.5.6

### Next.js App (Target)
- **Next.js**: 14.2.4
- **React**: 18.3.1
- **TypeScript**: 5.4.5
- **Tailwind CSS**: 3.4.10

## Vite Plugins Used
- `@vitejs/plugin-react-swc` (3.11.0)
- `lovable-tagger` (1.1.10) - Development only

## Dependency Migration Analysis

| Package | Lovable Version | Next.js Version | Action | Migration Notes |
|---------|----------------|-----------------|--------|-----------------|
| **Core Framework** |
| `react` | 18.3.1 | 18.3.1 | ✅ Keep | Compatible |
| `react-dom` | 18.3.1 | 18.3.1 | ✅ Keep | Compatible |
| `typescript` | 5.8.3 | 5.4.5 | ⚠️ Replace | Use Next.js version |
| **Routing** |
| `react-router-dom` | 6.30.1 | - | ❌ Remove | Replace with Next.js App Router |
| **UI Components** |
| `@radix-ui/*` | Various | Various | ✅ Keep | All versions compatible |
| `lucide-react` | 0.462.0 | 0.462.0 | ✅ Keep | Compatible |
| `class-variance-authority` | 0.7.1 | 0.7.1 | ✅ Keep | Compatible |
| `clsx` | 2.1.1 | 2.1.1 | ✅ Keep | Compatible |
| `tailwind-merge` | 2.6.0 | 2.6.0 | ✅ Keep | Compatible |
| `tailwindcss-animate` | 1.0.7 | 1.0.7 | ✅ Keep | Compatible |
| **State Management** |
| `zustand` | 5.0.8 | 5.0.8 | ✅ Keep | Compatible |
| **Data Fetching** |
| `@tanstack/react-query` | 5.83.0 | - | ❓ Evaluate | Consider Next.js data fetching |
| **Forms** |
| `react-hook-form` | 7.61.1 | 7.64.0 | ✅ Keep | Next.js has newer version |
| `@hookform/resolvers` | 3.10.0 | - | ❓ Add | If using form validation |
| `zod` | 3.25.76 | 4.1.11 | ✅ Keep | Next.js has newer version |
| **Charts & Visualization** |
| `recharts` | 2.15.4 | 2.15.4 | ✅ Keep | Compatible |
| **Date Handling** |
| `date-fns` | 3.6.0 | 3.6.0 | ✅ Keep | Compatible |
| `react-day-picker` | 8.10.1 | 8.10.1 | ✅ Keep | Compatible |
| **UI Enhancements** |
| `embla-carousel-react` | 8.6.0 | 8.6.0 | ✅ Keep | Compatible |
| `react-resizable-panels` | 2.1.9 | 2.1.9 | ✅ Keep | Compatible |
| `cmdk` | 1.1.1 | 1.1.1 | ✅ Keep | Compatible |
| `input-otp` | 1.4.2 | 1.4.2 | ✅ Keep | Compatible |
| `sonner` | 1.7.4 | 1.7.4 | ✅ Keep | Compatible |
| `vaul` | 0.9.9 | 0.9.9 | ✅ Keep | Compatible |
| **Theming** |
| `next-themes` | 0.3.0 | 0.4.6 | ✅ Keep | Next.js has newer version |
| **Build Tools** |
| `vite` | 5.4.19 | - | ❌ Remove | Replaced by Next.js |
| `@vitejs/plugin-react-swc` | 3.11.0 | - | ❌ Remove | Replaced by Next.js |
| `lovable-tagger` | 1.1.10 | - | ❌ Remove | Lovable-specific |
| **Styling** |
| `tailwindcss` | 3.4.17 | 3.4.10 | ✅ Keep | Use Next.js version |
| `autoprefixer` | 10.4.21 | - | ❓ Add | If needed for CSS |
| `postcss` | 8.5.6 | - | ❓ Add | If needed for CSS |
| `@tailwindcss/typography` | 0.5.16 | - | ❓ Add | If using prose classes |

## Vite-Only Features to Replace

### Environment Variables
- **Current**: `import.meta.env.VITE_*`
- **Next.js**: `process.env.NEXT_PUBLIC_*` (client) or `process.env.*` (server)

### Import Aliases
- **Current**: `@/` resolves to `./src/`
- **Next.js**: Configure in `tsconfig.json` paths

### Development Server APIs
- **Current**: `import.meta.hot` (HMR)
- **Next.js**: Built-in Fast Refresh

### Build Output
- **Current**: `vite build` outputs to `dist/`
- **Next.js**: `next build` outputs to `.next/`

## Missing Dependencies in Next.js App

The Next.js app is missing several key dependencies that are in the Lovable app:
- `@tanstack/react-query` - For data fetching
- `@hookform/resolvers` - For form validation
- `@tailwindcss/typography` - For prose styling
- `autoprefixer` and `postcss` - For CSS processing

## Recommended Migration Steps

1. **Add missing dependencies** to Next.js app
2. **Update import statements** from `import.meta.env` to `process.env`
3. **Replace React Router** with Next.js App Router
4. **Update TypeScript version** to match Next.js
5. **Configure build aliases** in `tsconfig.json`
6. **Remove Vite-specific plugins** and configurations
