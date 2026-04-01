# Project Context - Ana Alexandre Atelier

## Tech Stack
- React 18 + Vite 6 + Tailwind CSS
- Supabase (Auth + Database + Storage)
- React Router DOM v6
- TypeScript

## Current Status: ✅ Working (with mock fallback)

## What Was Done

### 1. Mobile (~85% complete)
- Mobile header with language selector, account icon, cart icon
- Footer with working links (Instagram, Facebook, Pinterest, Google Maps)
- CookieConsent integrated
- Touch targets increased (>44px)
- Body scroll lock on modals

### 2. Supabase (~70% complete)
- SQL schema with tables: obras, contactos, newsletter, config_site
- Storage bucket "obras" created
- CRUD functions in db.ts (getObras, getObrasDestaque, createObra, updateObra, deleteObra)
- Image upload: uploadObraImage(), deleteObraImage()

### 3. Frontend Connected
- HomePage and GaleriaPage fetch data from Supabase
- Fallback to mock data if DB is empty
- Site is working!

### 4. Fixed Issues
- React Router imports fixed (all to "react-router-dom")
- Error handling added
- Multiple node_modules cleanup

## What Still Needs Work

See `prompt/checklist.md` for full details.

### High Priority:
1. Add test data to Supabase
2. Connect Admin Dashboard to Supabase (currently using mock data)
3. Create obra form with image upload
4. Connect all admin sections (contactos, newsletter, config)

## Quick Start Commands
```bash
npm run dev    # Start development server
npm run build  # Production build
```

## Supabase Credentials
- URL: https://vqunmqtozykwqtmyfjyi.supabase.co
- Project ID: vqunmqtozykwqtmyfjyi

