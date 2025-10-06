# React Router DOM References Found

## Summary
Found **53 references** to React Router DOM across **16 files** that need to be converted to Next.js equivalents.

## Files with React Router DOM Usage

### Pages (13 files)
1. **`trainu-grow-connect-main/src/pages/Landing.tsx`**
   - `useNavigate` hook
   - Navigation calls

2. **`trainu-grow-connect-main/src/pages/ClientDashboard.tsx`**
   - `useNavigate` hook
   - Navigation calls

3. **`trainu-grow-connect-main/src/pages/EventDetail.tsx`**
   - `useParams` hook
   - `Link` component (2 instances)

4. **`trainu-grow-connect-main/src/pages/NotFound.tsx`**
   - `useLocation` hook

5. **`trainu-grow-connect-main/src/pages/Clients.tsx`**
   - `useNavigate` hook
   - Navigation calls

6. **`trainu-grow-connect-main/src/pages/TrainerProfile.tsx`**
   - `useParams` hook
   - `Link` component
   - `useNavigate` hook

7. **`trainu-grow-connect-main/src/pages/community/Events.tsx`**
   - `Link` component (2 instances)

8. **`trainu-grow-connect-main/src/pages/Discover.tsx`**
   - `useNavigate` hook
   - Navigation calls

9. **`trainu-grow-connect-main/src/pages/GymAdminDashboard.tsx`**
   - `useNavigate` hook
   - Navigation calls

10. **`trainu-grow-connect-main/src/pages/TrainerDashboard.tsx`**
    - `useNavigate` hook
    - Navigation calls

11. **`trainu-grow-connect-main/src/pages/Directory.tsx`**
    - `Link` component (2 instances)

### Components (3 files)
12. **`trainu-grow-connect-main/src/components/TabNavigation.tsx`**
    - `useNavigate` hook
    - `useLocation` hook
    - Navigation calls

13. **`trainu-grow-connect-main/src/components/RoleSwitcher.tsx`**
    - `useNavigate` hook
    - Navigation calls

14. **`trainu-grow-connect-main/src/components/AppLayout.tsx`**
    - `useNavigate` hook
    - Navigation calls

15. **`trainu-grow-connect-main/src/components/booking/SuccessStep.tsx`**
    - `useNavigate` hook
    - Navigation calls

## Conversion Patterns Needed

### 1. Import Statements
```typescript
// Before
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

// After
import { useRouter, usePathname, useParams } from "next/navigation";
import Link from "next/link";
```

### 2. Hook Usage
```typescript
// Before
const navigate = useNavigate();
const location = useLocation();
const { id } = useParams();

// After
const router = useRouter();
const pathname = usePathname();
const params = useParams();
const { id } = params as { id: string };
```

### 3. Navigation Calls
```typescript
// Before
navigate('/dashboard');
navigate('/dashboard', { replace: true });
navigate(-1);

// After
router.push('/dashboard');
router.replace('/dashboard');
router.back();
```

### 4. Link Components
```typescript
// Before
<Link to="/dashboard">Dashboard</Link>
<NavLink to="/dashboard">Dashboard</NavLink>

// After
<Link href="/dashboard">Dashboard</Link>
```

### 5. Location Usage
```typescript
// Before
location.pathname
location.search
location.hash

// After
pathname
useSearchParams().toString()
window.location.hash
```

## Automated Conversion

The codemod script `scripts/codemod-router-to-next.js` can automatically convert most of these patterns:

```bash
# Convert a single file
node scripts/codemod-router-to-next.js src/components/TabNavigation.tsx

# Convert entire directory
node scripts/codemod-router-to-next.js src/

# Convert specific pages
node scripts/codemod-router-to-next.js src/pages/
```

## Manual Review Required

After running the codemod, manual review is needed for:

1. **Dynamic Route Parameters** - Next.js params are async
2. **Search Parameters** - May need `useSearchParams()` hook
3. **Router Events** - Different event system in Next.js
4. **Navigation State** - May need query parameters instead
5. **Hash Navigation** - Different handling in Next.js

## Priority Order

1. **High Priority** - Core navigation components
   - `TabNavigation.tsx`
   - `AppLayout.tsx`
   - `RoleSwitcher.tsx`

2. **Medium Priority** - Page components
   - All page files in `src/pages/`

3. **Low Priority** - Utility components
   - `SuccessStep.tsx`

## Testing Strategy

After conversion, test:
- [ ] All navigation links work correctly
- [ ] Back/forward browser buttons work
- [ ] Deep linking works
- [ ] Dynamic routes work with params
- [ ] Search parameters are preserved
- [ ] Hash navigation works
