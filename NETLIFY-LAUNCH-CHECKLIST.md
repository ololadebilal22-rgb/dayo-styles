# Dayo Styles — launch checklist

## 1. Create the database

Create a PostgreSQL database (Neon is one option). Copy its pooled connection string with TLS enabled (`sslmode=require`) and keep the password private.

## 2. Deploy the code to Netlify

1. Push this project to a GitHub repository.
2. In Netlify choose **Add new project → Import an existing project** and connect that repository.
3. Build command: `npm run build`; publish directory: `dist/client`; Node version: `22` (already set in `netlify.toml`).
4. In **Site configuration → Environment variables**, add:
   - `DATABASE_URL` = the PostgreSQL connection string
   - `STRIPE_SECRET_KEY` = Stripe test secret, starts with `sk_test_`
   - `APP_BASE_URL` = the exact HTTPS domain Netlify assigned, without a trailing slash
   - `STRIPE_WEBHOOK_SECRET` = add after creating the webhook below
5. Deploy. The SQL migration runs during the build if `DATABASE_URL` is present. Until the webhook secret is configured, payment endpoints intentionally fail closed.

## 3. Set up Stripe webhooks

1. In Stripe Dashboard, stay in **test mode** and open **Developers → Webhooks**.
2. Add endpoint: `https://YOUR-NETLIFY-DOMAIN/api/stripe/webhook`.
3. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.expired`.
4. Copy the endpoint signing secret (`whsec_...`) into Netlify as `STRIPE_WEBHOOK_SECRET`.
5. Redeploy so the function receives the environment variable.

Keep all secrets in Netlify's server-side environment settings, never in frontend code or a `VITE_*` variable. Do not share secret keys in chat.

## 4. Test in Stripe test mode

- Complete a booking with a Stripe test card (for example `4242 4242 4242 4242`, any future expiry and any 3-digit CVC).
- Verify the booking appears as confirmed only after payment and the success page says it is confirmed.
- Try the same date/time twice, try to create six bookings on one date, cancel checkout, and leave checkout unpaid. None of these unpaid cases should confirm a booking.
- Test a product order, a cancelled product payment, and a successful product payment.
- In Stripe, inspect webhook delivery and confirm the endpoint returns HTTP 200 for successful events.

## 5. Before switching to live mode

- Review all products and prices in `src/data/products.ts`. Several current sample prices are CAD $10.99.
- Decide your shipping-charge and tax rules. The current shop Stripe amount is the product subtotal; shipping/tax are not automatically charged by this version.
- The booking flow currently requires a **35% deposit**; the remaining service balance is due at the appointment. It does not charge the full service price online.
- In Stripe live mode, replace `STRIPE_SECRET_KEY` with the live `sk_live_...` key and create/use a live-mode webhook endpoint with its own live `whsec_...` value. Update both Netlify variables and redeploy.
- Make a real low-value live test only when ready, then refund it if appropriate. Do not switch to live mode before all test-mode cases above pass.
