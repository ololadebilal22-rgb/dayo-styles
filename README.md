# Dayo Styles — salon bookings and hair products

A bilingual (English/French) Dayo Styles salon and hair-products storefront built with TanStack Start, React, TypeScript and Tailwind CSS. The project is prepared for deployment on Netlify.

## Requirements

- Node.js 22
- A persistent PostgreSQL database (Neon recommended)
- A Stripe account
- A Netlify site

## Run locally

```bash
npm install
cp .env.example .env
# Fill in DATABASE_URL and Stripe test credentials in .env
npm run dev
```

Use `npm install` for the first install so npm generates a fresh `package-lock.json` including the Netlify adapter. Commit that generated lockfile if you deploy from GitHub.

Open <http://localhost:8080>. Keep Stripe in **test mode** until all booking and product checkout tests pass. `npm run build` applies the SQL migrations when `DATABASE_URL` is present.

## Stripe payment rules

- Appointment checkout charges the currently configured **35% booking deposit** in CAD. The service balance is shown as payable at the appointment, consistent with the existing booking policy. Update the policy and code if you decide to charge 100% online instead.
- Appointment rows are created with `pending_payment`; they become `confirmed` only after the server verifies the Stripe Checkout Session is paid.
- Stripe Checkout Sessions expire after 35 minutes (Stripe requires at least 30). An unpaid booking hold expires after 40 minutes, so it always outlives the Stripe session.
- PostgreSQL serializes bookings per appointment date, rejects the same date/time twice, and refuses more than five active/confirmed appointments on one date. The UI availability check is for convenience; the server is authoritative.
- Shop orders also remain `pending_payment` until verified paid. Prices and totals are recalculated on the server using `src/data/products.ts` (never from browser totals).
- Stripe Checkout accepts cards. Apple Pay / Google Pay may be displayed by Stripe for supported browsers/devices and when enabled in your Stripe account. Do not advertise a wallet as guaranteed for every customer.
- The current product list has demo-like pricing (many items are CAD $10.99). Review every product name, image, stock and price in `src/data/products.ts` before accepting live money.
- Shop checkout currently charges the product subtotal only. It collects delivery details but does not yet calculate shipping fees or sales tax. Set up and test the correct delivery/tax rules before taking live shop orders; do not silently treat shipping as free unless that is your policy.

## Where to add Stripe keys

### Local development

Copy `.env.example` to `.env`, then set:

- `DATABASE_URL`: pooled production-style PostgreSQL connection string from Neon (use its pooled URL and require SSL).
- `STRIPE_SECRET_KEY`: secret API key from Stripe Dashboard → Developers → API keys. Start with `sk_test_...`.
- `STRIPE_WEBHOOK_SECRET`: signing secret generated when creating the webhook endpoint below (`whsec_...`).
- `APP_BASE_URL`: site origin, no trailing slash. Use `http://localhost:8080` locally and your real HTTPS domain in production.

Never put Stripe secret or webhook keys in `VITE_*` variables, browser code, source control, screenshots or public frontend config. Never commit `.env`.

### Netlify production environment

In Netlify open **Site configuration → Environment variables** and add the same four variables. Set `APP_BASE_URL` to the final deployed HTTPS origin. Start with a Stripe `sk_test_...` secret; only switch to `sk_live_...` after end-to-end test payments and webhook delivery work. Add the webhook signing secret only after you create the endpoint in Stripe.

## Stripe webhook setup

In Stripe Dashboard → Developers → Webhooks, create an endpoint:

`https://YOUR-SITE.netlify.app/api/stripe/webhook`

Select these events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`

Copy the endpoint's signing secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET` in Netlify, then redeploy. Use Stripe's webhook delivery tool to send a test event and confirm the endpoint returns HTTP 200. After deploying, verify the endpoint is reachable at `/api/stripe/webhook`; if your Netlify deployment routes it differently, use the actual public route URL that reaches the server handler.

## Database

The migration `migrations/0002_dayo_storefront.sql` creates the bookings and orders tables. Set `DATABASE_URL` before the Netlify build so `npm run build` can run `scripts/migrate.mjs`. A persistent database is required: the in-memory PGlite preview is not appropriate for live bookings or payments.

## Deploy to Netlify

1. Push this project to a GitHub repository, or upload/import the project into Netlify.
2. Set the project root to this folder (the folder containing `package.json` and `netlify.toml`).
3. Build command: `npm run build`. Publish directory: `dist/client` (already configured in `netlify.toml`). Use Node.js 22.
4. Add `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `APP_BASE_URL` in Netlify environment variables. Configure webhook as above.
5. Deploy with test keys first. Verify booking conflicts, the five-per-day cap, unpaid/cancelled checkouts, successful paid appointments, shop payments, and webhook delivery. Only after that, use Stripe live keys and verify the live webhook secret.

## Useful files

| Task | File |
| --- | --- |
| Homepage, service cards and hair-products strip | `src/routes/index.tsx` |
| Appointment form and deposit amount display | `src/routes/reservation.tsx` |
| Server booking and shop checkout | `src/lib/payments.server.ts` |
| Stripe API endpoints and webhook | `src/routes/api/stripe/` |
| Product catalogue and prices | `src/data/products.ts` |
| SQL tables | `migrations/0002_dayo_storefront.sql` |
| Logo assets | `public/brand-logo.png`, `public/brand-icon.png`, `public/brand-favicon.png` |
| Netlify build settings | `netlify.toml` |
