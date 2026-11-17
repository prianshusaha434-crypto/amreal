# AMREAL Professional — React Demo

## Stack
- React
- Vite
- TypeScript
- React Router
- Framer Motion
- Lucide React
- Custom responsive CSS

## Run

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Routes

- `/` — premium homepage
- `/products` — searchable/filterable catalogue
- `/products/:slug` — product detail
- `/about`
- `/contact`
- `/feedback`
- `/login`
- `/dashboard`
- `/admin/dashboard`

## Product data

The supplied product list has been entered into `src/data.ts`:

1. Shampoo - Kit No 1 — 300 ml
2. Mask - Kit No 2 — 250 ml
3. Mask - Kit No 2 — 500 ml
4. Argan Screm — 50 ml
5. Permanent SPA Kit No. 3 — 1000 ml
7. Slik Protein — 1000 ml
8. Slik Protein Sample — 120 ml
9. Shampoo Dand Kit No. 1 — 250 ml
10. Scalp Scrub — 250 ml
11. Nanoplastia — 1000 ml
12. Nanoplastia — 300 ml

The numbering is preserved from the supplied list; S.No. 6 was not present.

## Important production note

The site uses the supplied AMREAL photography. Clearly labeled placeholders cover missing Nanoplastia pack/results, Pure Proteins, the Silk Protein 300 ml pack. Replace those with approved assets when available.

The PRD explicitly says not to invent product ingredients, benefits, certifications, testimonials, statistics, or clinical claims. Therefore the demo uses conservative placeholder formulation text until approved AMREAL data is supplied.

The storefront and product-management screens remain demo-first. Appointment booking uses Supabase when configured and a browser-local demo workspace otherwise.

## Appointments & availability

- Visit `/appointments` to request a customer booking, or open `/admin` → **Appointments & Availability** to manage appointments, availability, employees and services.
- Without Supabase environment variables, sample data and changes are stored only in the current browser and are labeled **DEMO WORKSPACE**.
- For a shared database, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then run `supabase-schema.sql` followed by `supabase-appointments.sql` in the Supabase SQL editor.
- Live `/admin` access uses the existing Supabase Auth session. Provision administrator accounts in Supabase Auth; the local demo passwords are not accepted in live mode.
- The SQL seed records have `is_demo = true`. In the admin workspace selector, **Demo sample data** and **Production records** are kept separate. Public booking only lists active non-demo services; configure production service hours under Availability before accepting live bookings.
- Booking submission and rescheduling re-check slots inside database functions. Appointment changes are audited, queued as admin notifications, and broadcast to authenticated admin screens through Supabase Realtime.
- Appointment detail actions can open the customer’s email app or WhatsApp. Automatic provider delivery requires a separately configured server-side integration; provider credentials must not be put in the browser app.

## October 2026 client revision

See [the change checklist and image mapping](docs/CLIENT-CHANGE-REPORT.md).
Run `npm run build` and `node scripts/verify-assets.mjs` to validate compilation and local assets.

### Adding Permanent Hair Spa results

1. Copy approved original photos into `public/assets/` as JPEGs, longest side ≤1600px, quality around 82. Preserve the complete frame and confirm the before/after photos belong to the same client/session.
2. Update the front-view entry in `spaPairs` in `src/SpaGallery.tsx` only with approved photos of the same model. This updates the home spotlight and Permanent Hair Spa detail gallery together; the second model's back-view photos are no longer displayed.
3. The front-view two-month follow-up is supplied on page 1 of `justhuman.pdf` and is enabled. Keep future follow-ups tied to the same model and front view.
4. Add approved homepage comparison pairs to `defaultBeforeAfterItems` in `src/supabase.ts` or through the before/after admin page. Do not reuse Hair Spa results for Silk Protein, Nanoplastia or another product.
5. Product pack and gallery images live in `src/data.ts`; the new photos can be recreated from the untouched `../Pictures/` originals with `python3 scripts/prepare-photos.py` (requires Pillow).

The teal Hair Revival bottle is copied but deliberately unused until packaging is confirmed. Nanoplastia and Pure Proteins use clearly labeled image placeholders, not another product's photographs.

Local product fallback data uses a version 5 key so returning visitors receive the revised catalog; prior browser data remains preserved under its old key. If production uses Supabase, its rows take precedence over `data.ts`: update those catalog rows through the admin workflow before release. No remote database was modified during this revision.
