# Ekima — AGENTS.md

## Stack
- **Next.js 15** App Router, Tailwind CSS v4, shadcn/ui
- **Drizzle ORM** + SQLite (better-sqlite3, synchrone)
- Auth custom (HMAC tokens, PBKDF2, cookies)
- Package manager: **pnpm**

## Scripts
```sh
pnpm dev          # dev server
pnpm build        # production build
pnpm db:generate  # drizzle schema → SQL
pnpm db:migrate   # run migrations
pnpm db:studio    # drizzle studio
```

## Architecture
- `app/` — App Router (toutes les pages en `"use client"`)
- `app/(app)/` — route group (réservé, non utilisé)
- `components/` — composants partagés
- `components/app-layout.tsx` — layout unifié (Sidebar + wrapper)
- `components/page-skeleton.tsx` — skeleton loading pour toutes les pages
- `hooks/` — hooks custom (use-auth, use-user-preferences, use-school-info)
- `lib/` — auth, DB, services
- `lib/guards/auth.guard.ts` — `requireAuth()` pour les pages protégées
- `middleware.ts` — session check sur chaque requête

## Pages loading
- `app/loading.tsx` + `app/dashboard/loading.tsx` + ~7 sous-routes avec `PageSkeleton`
- Tous les anciens `loading.jsx` retournaient `null` — corrigé
- Tous chargent `import { PageSkeleton } from "@/components/page-skeleton"`

## Build
```sh
pnpm build
```
- `config.next` ignore ESLint + TS errors en build
- `images.unoptimized: true` (pas de next/image optimization)
- `serverExternalPackages: ["better-sqlite3"]`

## DB / Auth
- SQLite: `ekima_db/data.db`
- Session cookie: `edumali_session` (httpOnly, 8h TTL, 7x avec rememberMe)
- Schéma: `lib/models/schema.ts` (table `users`)
- Instrumentation: `lib/bootstrap.ts` crée le schéma et l'admin par défaut

## Pièges
- Migrations Drizzle : exécuter `db:generate` puis `db:migrate`
- Le middleware appelle `decodeSessionToken()` sur chaque requête (coût HMAC)
- `requireAuth()` dans `dashboard/layout.tsx` bloque le rendu tant que la DB n'a pas répondu
- Ne PAS modifier les fichiers `drizzle/` à la main
