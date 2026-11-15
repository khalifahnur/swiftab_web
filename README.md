# Swiftab Web

The marketing site and restaurant dashboard for Swiftab (Next.js, App Router).
It talks to the Go API in `swiftab-server`.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

```bash
npm run typecheck   # TypeScript
npm test            # unit tests for the floor-plan geometry
npm run build       # production build
```

## Configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SWIFTAB_BASE_URL` | Base URL of the API including `/api/v2`, e.g. `https://api.swiftab.co.ke/api/v2`. Required. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional. Enables "Find on map" address search in restaurant setup and Settings. Without it, the position comes from the browser's location or typed coordinates. |

The dashboard signs in with an HTTP-only cookie set by the API, so the API
must allow this site's origin (see `ALLOWED_ORIGIN` in the server). For local
development run the server with `APP_ENV=development`.

## What is where

| Area | Path |
| --- | --- |
| Landing page | `src/app/page.tsx`, `src/components/landing/` |
| Dashboard shell (auth redirect, setup wizard, header) | `src/components/pages/DashboardLayout.tsx`, `src/components/Sidebar/` |
| Restaurant setup wizard | `src/components/multiform/Container.tsx` |
| Overview | `src/components/pages/dashboard/` |
| Live orders | `src/components/pages/orderline/` |
| Menu and sections | `src/components/pages/menu/` |
| Floor plan editor and live view | `src/components/pages/table/floorplan/`, rules in `src/lib/floor.ts` |
| Reservations | `src/components/pages/reservation/` |
| Settings (restaurant, staff, promotions, account) | `src/components/pages/settings/` |
| API client, hooks, types | `src/lib/api.ts`, `src/hooks/queries.ts`, `src/types/api.ts` |

Live updates come from the API's event stream (`src/hooks/useLiveEvents.ts`);
the same data also polls, so the dashboard stays correct if the stream drops.
