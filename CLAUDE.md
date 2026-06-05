# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Type-check (tsc -b) then Vite production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

There is no test suite. Verification is done by running the dev server and opening the views.

## Architecture

**Datinder** is a real-time binary (A/B) voting platform for live events. Participants vote on their phones; a projector screen shows live vote bars and compatibility matches.

### Data layer — `src/db/`

The entire app reads and writes through a single `Datasource` interface (`src/db/Datasource.ts`). The active implementation is selected at boot time in `src/db/index.ts`:

```
VITE_USE_MOCK=true  (default) → MockDatasource  (in-memory, 16 animated bots)
VITE_USE_MOCK=false            → SupabaseDatasource (reads VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)
```

**Never import `MockDatasource` or `SupabaseDatasource` directly from components** — always use `import { db } from '@/db'`.

- `src/db/mock/seed.ts` — singleton store: demo session `AFTERWORK`, 20 questions (some with `peso: 3`), 16 virtual users.
- `src/db/mock/bots.ts` — `startBots()` makes the 16 virtual users vote with random delays whenever a new question becomes active. Called once from `Board.tsx` on mount.
- `src/db/mock/emitter.ts` — lightweight `EventEmitter` that simulates Supabase Realtime postgres_changes. `MockDatasource` calls `emitter.emit('sesion:<id>')` on every write; `suscribir()` wires a listener.
- `src/db/migration.sql` — Supabase schema (also shown in the Admin → SQL tab).

### Realtime hook — `src/hooks/useRealtimeSession.ts`

All views that need live data use `useRealtimeSession(sesionId)`. It calls `db.suscribir()` and re-fetches the full session state on every change event. This is intentionally a full re-fetch (not a delta) so both implementations behave identically.

### Compatibility algorithm — `src/lib/afinidad.ts`

Pure functions, no side effects:
- `calcularMatches()` — computes all user-pair affinities. Only runs when ≥5 questions have responses (`MATCHES_DESDE_PREGUNTA` in `src/config.ts`). Formula: `(Σ peso of matching answers) / (Σ peso of all answered-by-both) × 100`. Tie-break: longest consecutive identical streak → alphabetical.
- `preguntaMasPolarizada()` / `preguntaMayorConsenso()` — used in the final insights panel.

### Views (`src/views/`)

| File | Route | Focus |
|------|-------|-------|
| `Login.tsx` | `/` | Mobile-first login (simulated LinkedIn OAuth or guest form) + session code entry |
| `Lobby.tsx` | `/lobby` | Waiting room; auto-redirects to `/play` when `sesion.estado` becomes `'jugando'` |
| `Play.tsx` | `/play` | Two giant vote buttons; shows lock screen after voting; polls `sesion.estado` for end |
| `Board.tsx` | `/board/:codigo` | Projector view; calls `startBots()` in mock mode; switches to `<Podium>` when `'finalizado'` |
| `Admin.tsx` | `/admin` | Multi-tab admin; credentials checked against `ADMIN_USER`/`ADMIN_PASS` in `src/config.ts` |

Presenter controls (next question, pause, restart) live in `Sidebar.tsx` and are shown when `?rol=presentador` is in the URL.

### Session state

User and session objects are persisted to `localStorage` via `src/context/SessionContext.tsx` so they survive page refreshes. The context is consumed with `useSession()`.

### UI components

`src/components/ui/` contains hand-written shadcn/ui-compatible primitives (Button, Card, Input, etc.) built on Radix UI primitives. Do not run `npx shadcn add` — add new components manually following the same pattern.

The `@/` alias resolves to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

### Key config values (`src/config.ts`)

```ts
ADMIN_USER = 'admin'
ADMIN_PASS = 'datinder2026'
DEMO_SESSION_CODE = 'AFTERWORK'
MATCHES_DESDE_PREGUNTA = 5   // minimum questions with responses before matches appear
```

## TypeScript strictness

`noUnusedLocals` and `noUnusedParameters` are enabled. Remove unused imports before building. The JSX transform is configured so `import React` is not needed in component files.
