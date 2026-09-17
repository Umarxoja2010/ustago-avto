# UstaGo Avto — Frontend (Phase 13 COMPLETE — customer + mechanic + admin)

React (TanStack Start) frontend now wired against the real Laravel API
(`ustago-backend`, Phases 3–12 + several endpoints added during this phase —
see each section below) for **the entire app**: customer, mechanic, and
admin. Every screen is either wired to a real endpoint or its gap is
explicitly documented — see "Known gaps" and each section's own notes.

## Setup

```bash
npm install   # or bun install
cp .env.example .env   # set VITE_API_URL if your API isn't on localhost:8000
npm run dev
```

Requires the backend running with `php artisan migrate --seed` (the seeder
adds the service catalog + one admin account).

## What's wired (Phase 13b — mechanic side)

All 8 mechanic screens, same verification discipline as the customer side —
every edit followed by a live `npx tsc --noEmit`, zero errors throughout:

- `mechanic.index` (dashboard) — real jobs (requests/active), accept/reject,
  online toggle (now genuinely persisted via `PATCH /master/profile`
  `isOpen`, not local-only state), weekly earnings chart, unread notification
  count
- `mechanic.jobs` — full request/active/completed/rejected tabs wired to
  `useBookings()` + `useUpdateBookingStatus()`
- `mechanic.services` — services CRUD, **redesigned around the real
  constraint that a mechanic prices catalog services rather than inventing
  arbitrary names**: the old mock let you free-type any service name; the
  real "add service" flow now picks from the global catalog (excluding
  services already added) and sets price/duration. Editing lets you change
  price/duration/active but not which catalog service it is (matches the
  backend, which doesn't allow that either)
- `mechanic.schedule` — today's upcoming jobs (real bookings) + working
  hours, where toggling one day's switch sends the full 7-day payload the
  backend requires (`PUT /master/working-hours`)
- `mechanic.profile` — real workshop profile, online toggle, own phone (from
  `useAuth()`, not the public-profile privacy gap — a mechanic can see
  _their own_ phone number)
- `mechanic.reviews` — real reviews + rating breakdown via
  `useMasterReviewsMine()`
- `mechanic.notifications` — same shared `/api/notifications` endpoint as
  the customer side, with a mechanic-specific icon mapping
- `mechanic.earnings` — see the dedicated section below, this one needed a
  product-rule judgment call

Removed: `src/lib/mechanic-store.tsx` entirely (all its state — jobs,
services, hours, online — was mock state now replaced by React Query; unlike
`customer-store.tsx` there was no local-only setting left to keep it for)
and its `<MechanicStoreProvider>` wrapper in `mechanic.tsx`.

**Backend additions made mid-phase** (both read-only, both low-risk):

- `GET /api/services` — mechanics need to browse the catalog to add a
  priced service; only an admin-only catalog endpoint existed before.
- `GET /api/master/earnings/weekly` + `.../monthly` — see below.

### `mechanic.earnings.tsx` and the payout product rule

The mock had two distinct concepts bundled into one screen:

1. **Calculated revenue charts** (`weeklyEarnings`/`monthlyEarnings`) — a
   sum of what the mechanic has actually earned from completed bookings.
   This is safely derivable from real data (`bookings.price` where
   `status = completed`), so it's now real — see the two new backend
   endpoints above.
2. **"Payout history"** — a list implying _money that was actually
   transferred to the mechanic_. This is a genuinely different thing:
   disbursement records require an actual payout workflow (who initiates a
   payout, on what schedule, via what payment rail — bank transfer? mobile
   money? manual admin action?). None of that was ever specified, and the
   `Payout` model/migration that exists from Phase 3–6 has never been
   written to by anything. Inventing payout records here would mean
   fabricating financial data that doesn't correspond to anything real.

Per the explicit product rule for this phase: **left this section as an
honest empty state** ("Payout history isn't available yet — this will show
real disbursements once payouts are set up", translated into all 3 locales)
rather than wiring it to nothing or making up numbers. This needs a product
decision before it's an engineering task.

## What's wired (Phase 13a — customer side)

New files:

- `src/lib/api-client.ts` — fetch wrapper: bearer token storage, envelope
  unwrapping, `ApiError` with `.fieldError()` and i18n-key `.message`
- `src/lib/api-types.ts` — TS types matching every backend Resource 1:1
- `src/lib/api-adapters.ts` — maps API types onto the existing UI types
  (`MechanicProfile`, `Vehicle`, `CustomerBooking`, `MechanicReview`) so the
  existing display components work **unmodified** against real data
- `src/lib/hooks/*.ts` — React Query hooks, one file per backend domain:
  `use-masters`, `use-vehicles`, `use-favorites`, `use-bookings`,
  `use-notifications`, `use-reviews`, `use-mechanic` (mechanic-side, built
  but not yet wired into any mechanic route — see below)

Rewritten:

- `src/lib/auth.tsx` — real Sanctum auth, **same exported interface** as the
  old mock (`AuthProvider`, `useAuth`, `RegisterInput`, `AuthUser`,
  `roleHome`) so `register.tsx` needed zero changes and picked up real
  registration/login automatically
- `src/lib/customer-store.tsx` — stripped down to local-only UI settings
  (dark mode, language, pinned quick-service shortcuts). Vehicles, bookings,
  and favorites used to live here as mock state; they're real server data
  now and live in the React Query hooks instead
- Every customer route: `app.index` (home), `app.search`, `app.mechanic.$id`
  (profile + booking creation), `app.bookings` (list/cancel/reschedule),
  `app.favorites`, `app.vehicles`, `app.profile`, `app.notifications`
- `components/customer/MechanicCard.tsx` — the shared favorite-heart button
  now calls the real favorites API instead of the store

Removed: the `DEV ONLY` demo-accounts card on the login screen (it called a
`demoAccounts` export that no longer exists now that login is real).

**Backend addition made mid-phase**: discovered `app.bookings.tsx` has a
working "reschedule" UI with no backend endpoint behind it. Added
`PATCH /api/bookings/{id}/reschedule` to the backend rather than ship a dead
button — see `ustago-backend` README's Phase 12 addendum for details.

### Verification

Every single edit in this phase was checked against a **real** TypeScript
compiler run (`npx tsc --noEmit`), not eyeballed — `node`/`npm` are
available in this sandbox and `registry.npmjs.org` is allowlisted, so
`npm install` actually works here (unlike the PHP backend, where
`packagist.org` is blocked). Baseline was a clean `tsc` run _before_ any
changes; every file edit was followed by another `tsc` run, and every error
surfaced was fixed before moving on — nothing was shipped on a hunch. Final
state: **zero TypeScript errors project-wide.**

That said, `tsc` only proves the types line up — it does not prove the app
actually renders correctly or that the UX is right end-to-end. Nobody has
run this against a live backend yet. Before trusting it: run
`php artisan serve` (backend) + `npm run dev` (frontend) together and click
through register → browse → book → cancel/reschedule → favorite → profile.

## What's wired (Phase 13c — admin side)

All 8 `_admin.*` routes, same discipline as customer/mechanic — every edit
followed by `npx tsc --noEmit`, zero errors throughout. New
`src/lib/api-admin-types.ts` + `src/lib/hooks/use-admin.ts` cover the whole
Admin API domain.

- `_admin.dashboard` — real report data (`useAdminReportOverview` +
  `useAdminSignupsReport` + `useAdminRevenueReport` + recent-items panels).
  Removed the mock's fabricated growth multipliers (`users.length * 128`)
  and made-up trend percentages — real counts only, no fake "+12.4%".
- `_admin.users` — list/filter/paginate real; suspend/activate real
  (`useUpdateAdminUserStatus`, blocked against admin targets by the
  backend). Edit/delete: **no backend endpoint exists** for either — handled
  with an honest `toast.info(...)`, the same pattern the _original mock
  code already used_ for "invite user" (that placeholder pre-dates this
  session; edit/delete now follow the same established convention rather
  than pretending to work).
- `_admin.mechanics` — list/filter/paginate real; approve/reject/suspend
  real (`useUpdateAdminMasterVerification` — all three transitions the
  backend actually supports). Edit/delete: same unsupported-action pattern
  as users.
- `_admin.bookings` — list/filter/paginate real; status changes and cancel
  now go through a **new admin override endpoint** (see below) rather than
  the customer/mechanic-scoped one, which is gated by ownership policies an
  admin doesn't satisfy.
- `_admin.reviews` — list/paginate real; hide/unhide real
  (`useToggleAdminReviewHidden`, triggers the same `recalculateRating()` as
  the mechanic-facing toggle). Delete: unsupported, same honest-toast
  pattern.
- `_admin.notifications` — broadcast composer real
  (`useSendAdminBroadcast`); sent-history list now real too, via a
  **new listing endpoint** (see below — the send endpoint existed from
  Phase 12 but nothing let the admin see what had actually been sent).
  Delete-a-sent-broadcast: unsupported, same pattern.
- `_admin.reports` — all 4 charts real. Signups/bookings-per-month are
  aggregated client-side from the daily-granularity report endpoints into
  6 monthly buckets (no monthly-granularity endpoint exists, and adding one
  wasn't worth it just for a different grouping of the same data). Top-rated
  mechanics list: real, sorted client-side over a `perPage:50` fetch (the
  admin masters endpoint has no sort param, not worth adding for a top-6
  slice). Total revenue now uses the real all-time `completedRevenue` figure
  instead of summing whatever window happened to be visible.
- `_admin.settings` — **deliberately left as a documented gap, not wired.**
  See the dedicated subsection below — this one's different in kind from
  every other admin screen.

### New backend endpoints/fields added while wiring admin (5 total)

Each one reasoned through individually, not defaulted to:

1. **`AdminMasterResource.services`** — the mechanics table needs to show
   each workshop's services; the data was there (`masterServices` relation)
   but never eager-loaded or exposed on that resource.
2. **`PATCH /admin/bookings/{id}/status`** — genuinely new capability. The
   existing booking-status endpoint is ownership-gated (customer cancels
   their own, mechanic manages their own workshop's) and transition-legality-gated
   (can't skip straight from pending to completed). An admin satisfies
   neither ownership check, and needs override power for dispute
   resolution anyway — so this is a separate endpoint, not a relaxation of
   the existing one, and every transition it makes is logged with the label
   "Updated by admin" for traceability.
3. **`ReviewResource.master`** — `masterProfile` was already being
   eager-loaded in the admin reviews query, just never surfaced in the JSON
   response. One-line fix.
4. **`GET /admin/notifications`** — the send endpoint (`POST
/admin/notifications/broadcast`) has existed since Phase 12, but nothing
   ever let an admin see the history of what was sent. Read-only listing,
   same low-risk category as the other additions.
5. **`AdminRevenuePoint.bookingsCount`** — extended the existing
   `/admin/reports/revenue` query to also `count(*)` alongside `sum(price)`
   in the same grouped query, rather than adding a whole new endpoint just
   for a count instead of a sum of the same rows.

All 5 are read-only or moderation-only (no money movement, no new PII
exposure beyond what admins already see elsewhere) and all have test
coverage. Backend test count: **58**, up from 52 at the start of the admin
push (48 at the very start of Phase 13).

### `_admin.settings.tsx` — why this one is different

Every other admin screen was "a real resource exists, it just needs a
read/write endpoint" — a wiring gap. Settings is not that. I checked: there
is no `Setting`/`Config` model, migration, or table anywhere in the backend,
across all 12 phases. This screen (app name, support contact, enabled
languages + default language, compact-tables theme toggle, brand color,
a static security note) is a full platform-configuration subsystem that was
never designed on the backend at all — not a missing endpoint on an
existing thing, but a missing _thing_.

Building one now would mean inventing a settings table, migration, model,
API resource, and controller from scratch with no existing product spec
behind any of the fields — precisely the "invent functionality just to make
the UI look functional" trap this whole phase was explicit about avoiding.

What changed: the **UI is untouched** (all fields, toggles, and layout
exactly as before — nothing removed, nothing redesigned), but the "Save
changes" button no longer shows a fake success toast. It now honestly says
these settings aren't backed by a real API and nothing is actually
persisted. That's the only functional change in this file.

## Known gaps (defaulted deliberately, not silently)

These are documented in code comments (`api-adapters.ts` module doc, mainly)
as well as here:

- **`distanceKm`**: always `0`. No geolocation is captured anywhere in the
  app. The search screen's distance filter is applied client-side against
  this always-0 value, so it currently never filters anything out — worth
  fixing before this ships for real, either by adding geolocation capture
  or hiding the distance UI until it's backed by something real.
- **`vehicleTypes`**: always `[]`. Not modeled on the backend at all — a
  mechanic's coverage of car types (sedan/SUV/etc.) was never part of the
  Phase 3–6 schema. The search screen's vehicle-type filter is real UI but
  currently filters against an always-empty array.
- **Public workshop `phone`**: always `""`. The backend's public
  `MasterProfileResource` intentionally doesn't expose a mechanic's phone
  number (privacy) — it's only revealed via `booking.master.phone` once a
  booking exists. This is a deliberate choice, not an oversight; if the
  product wants a public "call now" button, that's a backend Resource
  change + a product decision about whether that's the right privacy
  trade-off, not just a frontend fix.
- **`gallery`**: just `[cover]` when a cover image exists. Backend only
  stores one `cover` + one `logo` per workshop, no multi-image gallery
  table.
- **"Nearest" sort**: falls back to the same server-side `rating` sort as
  "Recommended" — no distance data to sort by (same root cause as
  `distanceKm`).
- **Search's `openNow` / `vehicleType` / `maxDistance` filters** are applied
  client-side on top of the server-paginated result page (not passed to the
  API, since the backend doesn't support them) — meaning a workshop that
  would match these filters but didn't make it into the current page of
  results won't show up. Fine for a demo/small dataset, not correct at
  scale. The honest fix is adding real backend support for at least
  `openNow` (computable from `working_hours` + current time) if not the
  other two.
- **Booking timeline** only shows real logged events (`done: true` for
  each), not the old mock's synthetic "upcoming step" placeholders — more
  honest than fabricating a preview of steps that haven't happened, but a
  visual downgrade from the mock's fuller-looking timeline.

## Not done / remaining gaps — final list

Everything customer/mechanic/admin is wired or explicitly documented. What's
left is genuinely out of scope for a wiring pass, not oversight:

- **Messages** (`ShopMessage`/`shopMessages` in `mechanic-data.ts`) — a
  `Message` model and migration exist from Phase 3–6, but **no controller or
  routes were ever built**, and — importantly — grepping the entire
  component tree found **zero UI consumers** of `ShopMessage` anywhere. This
  isn't a wiring gap, it's dead mock data with no screen behind it. Building
  a message-thread API would mean designing a feature from scratch with no
  existing UI to wire it into, so it's left alone rather than invented.
- ~~**Booking-lifecycle notifications**~~ — **RESOLVED in Phase 14** (backend
  only; see `ustago-backend/README.md`'s Phase 14 section). Notifications
  now fire on booking created/accepted/rejected/completed/cancelled/rescheduled
  and on review submission. Frontend screens needed no changes — they were
  already correctly wired to `GET /api/notifications`, they just had nothing
  real to display before. 7 new backend tests cover it.
- **`_admin.settings.tsx`** — platform configuration was never modeled on
  the backend at all (no `Setting` model/migration anywhere). Needs a
  product decision (what settings actually need to be admin-configurable,
  and how) before it's an engineering task — see the dedicated section
  above. UI intact, Save button now honest instead of faking success.
- **Mechanic payout history** (`mechanic.earnings.tsx`) — calculated
  revenue is real; actual payout/disbursement records are not, because no
  payout workflow (who initiates one, on what schedule, via what rail) was
  ever defined. Same category of gap as admin settings — needs a product
  decision, not code.
- ~~**`app.mechanic.$id.tsx` SEO head tags**~~ — **RESOLVED**. Added an
  async `loader` that calls `context.queryClient.ensureQueryData()` with the
  exact same query key `useMaster()` reads (`["masters", id]`), so `head()`
  gets real workshop data to build per-page `<title>`/description/OG tags
  from, and the component's own `useMaster(id)` call finds the data already
  cached — no double-fetch. Falls back to the generic tags on any failure
  (not found, unverified, network error) rather than crashing the route.
  The dynamic i18n keys (`titleWithName`, `description`, `ogDescription`)
  already existed in all 3 locales from before the mock→real migration —
  they'd just never been wired up. Verified with a real `npm run build`,
  not just `tsc`.
- **Search/report client-side approximations** — see "Known gaps" above
  (`distanceKm`, `vehicleTypes`, `openNow` filter, monthly report
  aggregation done client-side from daily data). All function correctly for
  a demo/small dataset; the honest fixes are backend work, not frontend
  bugs.

## Where things stand

Phase 13 is complete: customer, mechanic, and admin are each either wired to
the real API or have their remaining gap explicitly written down above —
nothing was left silently broken or silently faked. Phase 14 (event-driven
notifications) is done — see `ustago-backend/README.md`. The mechanic-detail
SEO regression is also fixed (see above). Backend is at **65 tests** (48 at
Phase 13 start, 58 at Phase 13 end, +7 in Phase 14). Frontend is at zero
TypeScript errors, checked after literally every edit across the whole
project so far, including two real `npm run build` runs that succeeded (not
just `tsc`).

What's left is genuinely a product-decision gap, not an engineering one:
mechanic payout history and admin platform settings both need someone to
decide what they should actually do before more code makes sense. Beyond
that, the honest next step is a real `php artisan test` run and a real
`npm run dev` + click-through against a live backend — nothing has been
verified against a live _running_ system yet, only statically (lint,
typecheck, build, and manual tracing of test assertions against the actual
code). `composer install` is blocked in this sandbox (`repo.packagist.org`
returns 403), so the backend has never actually booted here.
