# Perch

Read your café before you leave the building. Perch gives PhD students and
academic researchers real-time outlet availability, noise tiers, and laptop-policy
flags for cafés near their campus — so they never waste a writing session on a
dead commute.

Every café is a live instrument panel: outlet density (with a last-verified
timestamp), a 24-hour noise heatmap, a laptop-policy flag, and a real-time
crowding indicator driven by voluntary one-tap check-ins that auto-expire after
90 minutes.

## Stack

- Backend — Node.js, Express, Prisma, PostgreSQL
- Frontend — React, Vite, Tailwind (served as static files by Express in production)
- Realtime — Server-Sent Events (/api/stream) in the same Express process
- Background work — pg-boss scheduled cleanup of expired check-ins
- Payments — Stripe (optional; gated behind STRIPE_SECRET_KEY)

## Run it (one command)

1. Copy the env template:  cp .env.example .env
2. Set a real JWT_SECRET in .env. Generate one with:  openssl rand -base64 48
3. Start everything:  docker compose up --build

Open http://localhost:4000

On first boot the container runs prisma migrate deploy, seeds four campuses
(Ann Arbor, Berkeley, Madison, Austin) with 15–30 venues each, then starts the
API and serves the built frontend.

## Required configuration

- JWT_SECRET (required) — at least 32 chars. The app refuses to boot without it.
  Generate with: openssl rand -base64 48
- POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB (required) — used by the db
  service and to assemble DATABASE_URL.
- STRIPE_SECRET_KEY / STRIPE_PRICE_ID / STRIPE_WEBHOOK_SECRET (optional) — leave
  empty to run Pro checkout in a clearly-labelled "not connected" state.

## Features

- Outlet density with last-verified timestamp — every check-in updates the
  venue's outlet count and verification time; sortable and filterable.
- Laptop-ban / time-limit flag — per-venue policy (welcome / time-limited /
  banned), surfaced everywhere and confirmable on check-in.
- Noise tier heatmap by hour — user noise reports aggregated by hour-of-day,
  merged with a seeded baseline, rendered as a draggable 24-column strip.
- Real-time crowding — voluntary one-tap check-ins with a 90-minute TTL.
  Query-time filtering is the source of truth; pg-boss keeps the table lean.

## Development

- Backend:  cd backend, then npm install, then npm run dev  (http://localhost:4000)
- Frontend: cd frontend, then npm install, then npm run dev  (http://localhost:5173, proxies /api)

You'll need a local Postgres and a backend/.env (see backend/.env.example), then
cd backend, npx prisma migrate dev, and node prisma/seed.js.

## Honest scope

- Pro push notifications are modelled as a stored preference and per-venue notify
  toggle, not delivered push. Real push (service worker plus VAPID/FCM) is out of
  scope; the UI labels this clearly and marketing copy frames Pro as real-time
  alerts plus saved presets.
- Payments require Stripe credentials. Without them, the upgrade flow shows a
  "not connected" state instead of failing silently.