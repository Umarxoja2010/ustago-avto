# UstaGo Avto — Agent Instructions

<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Project Overview

**UstaGo Avto** is a React-based mobile web app connecting customers with mechanics in Central Asia. Phase 13 is complete — the entire frontend (customer, mechanic, and admin panels) is **fully wired to a real Laravel API** (`ustago-backend`, running on `localhost:8000`).

- **3 user roles**: customer (book repairs), mechanic (accept jobs, manage shop), admin (dashboard, user management)
- **3 languages**: Uzbek (uz), Russian (ru), English (en) — fully translated using i18n
- **Real backend**: Every feature is integrated with the Laravel API; no feature is mock-only
- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19 + SSR) with TypeScript

## Tech Stack & Key Libraries

- **Build**: Vite + TanStack Start (via Lovable's preset)
- **Routing**: `@tanstack/react-router` (file-based, generated into `src/routeTree.gen.ts`)
- **State & API**: `@tanstack/react-query` (hooks-based, see [src/lib/hooks/](src/lib/hooks/))
- **UI**: Radix UI components + Tailwind CSS
- **Forms**: React Hook Form + Zod (via `@hookform/resolvers`)
- **Styling**: `clsx` + `class-variance-authority` for component variants
- **i18n**: Custom context + JSON locales in [src/locales/](src/locales/) (not i18next — simpler)
- **Date handling**: `date-fns`

## Architecture & Key Files

### Data Flow: API Client → React Query → Components

1. **API Layer** (`src/lib/api-client.ts`)
   - Fetch wrapper that:
     - Unwraps the backend's `{ success, message, data, errors }` envelope
     - Attaches Sanctum bearer token automatically
     - Throws `ApiError` (with `.fieldError(field)` for form validation)
   - Env: `VITE_API_URL` (defaults to `/api` in dev, proxied to `localhost:8000` by Vite)

2. **Type Definitions** (`src/lib/api-types.ts` + `src/lib/api-admin-types.ts`)
   - 1:1 mapping with backend Resource types
   - Use these as the source of truth for backend schema

3. **React Query Hooks** (`src/lib/hooks/*.ts`)
   - One file per domain: `use-masters`, `use-vehicles`, `use-bookings`, `use-notifications`, `use-reviews`, `use-admin`
   - Examples: `useBookings(status?)`, `useUpdateBookingStatus()`, `useServiceCatalog()`
   - Always re-export hooks from their specific file, not a barrel export

4. **Adapters** (`src/lib/api-adapters.ts`)
   - Maps API types onto UI types (e.g., `ApiMaster` → `MechanicProfile`)
   - Centralized logic for avatar URLs, status enums, etc.

5. **Authentication** (`src/lib/auth.tsx`)
   - `AuthProvider` + `useAuth()` context hook
   - Roles: `"customer" | "mechanic" | "admin"`
   - Role homes: `roleHome` export (routes to `/app`, `/mechanic`, `/dashboard` respectively)
   - Handles login, register, logout; syncs with token in localStorage

### Routing & Role Guards

- **File-based routing**: Routes are in `src/routes/`, prefixed by their parent (e.g., `_admin.tsx`, `_admin.dashboard.tsx`)
- **Generated router**: `src/routeTree.gen.ts` is auto-generated; never edit manually
- **Role guarding**: `src/lib/use-role-guard.ts` — call inside a route loader or component to redirect if role doesn't match

### i18n & Localization

- **No external i18n library** — simple key-value JSON in `src/locales/{en,ru,uz}/index.ts`
- **Usage**: `const t = useLanguage(); t("key.here", { defaultValue: "..." })`
- **Common keys**: Check `src/lib/data-i18n.ts` for data enums (status → labels, etc.)
- **Backend messages**: API errors return i18n keys like `"errors.invalidCredentials"` — use `t(err.message)` to render

### Component Organization

- **UI components** (`src/components/ui/`): Radix-based, shadcn-style, low-level (Button, Dialog, etc.)
- **Feature components** (`src/components/{customer,mechanic,admin}/`): High-level screens and cards
- **Shared components** (`src/components/`): `LanguageSwitcher`, etc.

## Development Workflow

### Setup & Run

```bash
npm install
npm run dev        # Starts Vite on http://localhost:5173, proxies /api to :8000
npm run build      # Production build
npm run lint       # ESLint + Prettier checks
npm run format     # Auto-format with Prettier
```

**Prerequisites**: Backend running (`php artisan migrate --seed` to populate service catalog + admin account).

### Adding a New Screen

1. Create a route file: `src/routes/app.myfeature.tsx`
2. Create matching component: `src/components/customer/MyFeature.tsx`
3. Use React Query hooks for data: `const { data } = useBookings()`
4. Wrap text in i18n keys: `t("screen.myfeature.title")`
5. Run `npm run dev` — router auto-regenerates
6. Type-check: `npx tsc --noEmit` (Phase 13 maintains zero TS errors)

### Adding an API Hook

1. Create `src/lib/hooks/use-myfeature.ts`
2. Use `useQuery` for reads, `useMutation` for writes
3. Import and use the API client: `import { api } from "@/lib/api-client"`
4. Throw `ApiError` on failure (auto-handled in UI)
5. Export the hook and any types it needs

### Wiring a Form to the API

```tsx
import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";
import { useForm } from "react-hook-form";

const { mutate, isPending } = useMutation({
  mutationFn: (input: BookingInput) => api.post("/bookings", input),
});

const {
  register,
  formState: { errors },
} = useForm<BookingInput>();

// Display field error: errors.fieldName?.message || apiError?.fieldError("fieldName")
```

## Important Constraints & Gotchas

### Lovable Integration

- **Do NOT force-push or rebase commits** that are already pushed — this breaks Lovable's sync
- Make your commits atomic and logical; rebase/squash only before initial push if needed
- Every push syncs back to Lovable

### No Mock-Only Features

- Phase 13 enforces: **if something has a UI screen, it must be wired to a real API endpoint**
- If an endpoint doesn't exist, document it in the screen (see `mechanic.earnings.tsx` for the payout-history pattern)
- This ensures agents don't accidentally leave placeholders behind

### Role-Based UI

- Always wrap role-specific screens with a loader that calls `useRoleGuard(role)` to auto-redirect
- Example: `_admin.dashboard.tsx` routes to `/dashboard` only if logged in as admin

### Token Storage & Expiry

- Token stored in `localStorage` (key: `"ustago.auth.token.v1"`)
- On 401 response, the API client auto-clears it
- After logout, `useAuth().signOut()` clears token + navigates to `/`

### Build & Proxy

- Vite's dev proxy (`vite.config.ts`) forwards `/api/*` to `localhost:8000`
- In production, set `VITE_API_URL` to your backend URL (no relative paths)
- SSR entry is redirected to `src/server.ts` (error wrapper)

### i18n Keys Must Exist

- All `t(key)` calls must have corresponding keys in all 3 locale files
- Use `defaultValue` in `t()` as a fallback, but always translate properly
- Missing keys will render the key name (e.g., `"errors.notFound"`) — easy to spot in testing

## Common Tasks

### Debug API Calls

- Vite dev proxy logs requests to `/api` — check browser console and terminal
- `ApiError` includes `.status` and `.errors` (validation errors); inspect in Network tab
- Token always attached (see `setToken()` in `auth.tsx`)

### Add a Translation

1. Add key to all 3 files: `src/locales/{en,ru,uz}/index.ts`
2. Use in component: `const t = useLanguage(); return <span>{t("mykey")}</span>`
3. Verify with `npm run dev` + toggle language in UI

### Handle Form Validation

- Use `ApiError.fieldError(field)` to display inline errors
- Backend returns `{ errors: { field: ["message key", ...] } }`
- Map to React Hook Form's `setError()` if needed

### Optimize Queries

- React Query caching is aggressive (`defaultStaleTime: 0` means immediate refetch on focus)
- Use `useQuery(..., { staleTime: 1000 * 60 })` to cache for 1 minute
- Mutations auto-invalidate related queries (implement in hook, e.g., after POST, refetch the list)

## File Structure Quick Reference

```
src/
├── components/
│   ├── ui/               # Radix-based low-level components
│   ├── customer/         # Customer feature components
│   ├── mechanic/         # Mechanic feature components
│   ├── admin/            # Admin feature components
│   └── LanguageSwitcher.tsx
├── lib/
│   ├── api-client.ts     # Fetch wrapper + ApiError
│   ├── api-types.ts      # Backend resource types (source of truth)
│   ├── api-adapters.ts   # Map API types → UI types
│   ├── auth.tsx          # Authentication context
│   ├── i18n.ts           # i18n config + useLanguage() hook
│   ├── hooks/            # React Query hooks (one per domain)
│   └── utils.ts          # cn() + other helpers
├── routes/               # TanStack Router file-based routes
├── locales/              # i18n JSON files {en,ru,uz}
└── [other setup files]
```

## What to Watch For

1. **Type safety**: Phase 13 maintains zero TS errors — use `npx tsc --noEmit` often
2. **No mock state**: Every query/mutation must hit the API (even if it's stubbed in-dev)
3. **Role consistency**: Ensure role guards, menu items, and API calls all check the same role
4. **i18n coverage**: Don't miss any hardcoded strings — use `t()` or locale-specific components
5. **ESLint warnings**: React Hook Form, React Query, and React Router all have ESLint plugins — follow their rules
6. **Token lifecycle**: Logout must clear token; login must set it; 401 must auto-clear it

## References

- [PHASE13-STATUS.md](PHASE13-STATUS.md) — Phase 13 completion report (what's wired, what's not, decisions made)
- [Backend API](http://localhost:8000/api) — Swagger docs if available
- [TanStack Router docs](https://tanstack.com/router/latest/docs)
- [React Query docs](https://tanstack.com/query/latest/docs)
- [Radix UI components](https://www.radix-ui.com/) — all used in `src/components/ui/`
