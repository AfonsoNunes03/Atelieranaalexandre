# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server
npm run build    # production build (output: dist/)
```

No test runner is configured. There is no lint script — ESLint is not set up.

## Environment

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Both variables are required at startup — `src/lib/supabase.ts` throws if either is missing.

## Architecture

This is a **Vite + React SPA** (not Next.js) deployed to Vercel. `vercel.json` rewrites all routes to `index.html` for client-side routing.

### Routing

`src/app/routes.ts` defines all routes via `react-router-dom`. The root layout (`Layout`) wraps all public pages via nested routes. `/login`, `/register`, and `/admin` are top-level routes outside the layout.

### Supabase

All database access goes through `src/lib/db.ts`, which exports typed functions for every operation. `src/lib/supabase.ts` exports the singleton client typed against `src/lib/database.types.ts`. Auth helpers (sign in/out/up, session) are in `src/lib/auth.ts`. The database schema is in `supabase/schema.sql` and is idempotent.

**Tables:** `obras` (artworks), `contactos` (contact form submissions), `newsletter`, `config_site` (key/value site config).

**RLS:** Public read on `obras`; authenticated write. Public insert on `contactos` and `newsletter`; authenticated read/update.

### i18n

`src/app/i18n.tsx` provides a `LanguageProvider` and `useLanguage()` hook. Supported languages: `pt` (default), `en`, `es`, `fr`. All translations live in a single `translations` record in that file.

### Assets

Figma-exported assets are referenced via `figma:asset/<hash>.png` imports. `vite.config.ts` includes a custom `figmaAssetPlugin` that maps these hashes to real files under `public/assets/`. When adding new assets from Figma, update the `assetMap` in `vite.config.ts`.

The `@` alias resolves to `src/`.

### Admin

`/admin` is protected by `src/app/components/AdminProtected.tsx`, which checks Supabase auth state. The `AdminDashboard` component manages obras CRUD, contact messages, newsletter subscribers, and site config.
