# AMREAL website

This ZIP contains the editable Vite + React + TypeScript project and the ready-built website in `dist/`.

## Run the site locally

Install Node.js 20.19+ (or 22.12+), then run these commands in this folder:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Preview the production build

```bash
npm ci
npm run preview
```

## Build and deploy

```bash
npm run build
```

Upload the contents of `dist/` to a static web host. Configure a fallback to `index.html` for React Router paths (the included `vercel.json` does this on Vercel). Serve via HTTP; double-clicking `index.html` is not supported.

## Images and content

- Images: `public/assets/`
- Products and hero slides: `src/data.ts`
- Hair Spa gallery and follow-up slot: `src/SpaGallery.tsx`
- Full change checklist: `docs/CLIENT-CHANGE-REPORT.md`
- Verification results: `docs/browser-results.json`

Missing photography uses clearly labeled placeholders, which can be replaced with approved images later. The teal Hair Revival bottle remains unused pending confirmation.

No credentials are included. Forms currently use the existing demo submission flow. Optional Supabase configuration and its schema are provided in the project; no live database changes were made.
