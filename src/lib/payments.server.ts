import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import { depositRate, styleBySlug } from "@/lib/salon";
import { products } from "@/data/products";

type Customer = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal: string;
};
type StripeSession = {
  id: string;
  url?: string | null;
  payment_status?: string;
  currency?: string;
  amount_total?: number | null;
  metadata?: Record<string, string>;
  customer_email?: string | null;
};

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00"] as const;
const globalPool = globalThis as typeof globalThis & {
  __dayoPaymentsPool?: Pool;
  __dayoWebhookWarned?: boolean;
};

// Stripe only accepts a Checkout Session `expires_at` between 30 minutes and 24 hours after
// creation. The session TTL must stay safely above 30 minutes (request latency eats into it),
// and the database hold must outlive the Stripe session so a late payment can still be matched.
const CHECKOUT_SESSION_TTL_SECONDS = 35 * 60;
const BOOKING_HOLD_TTL_MS = 40 * 60 * 1000;
// Stripe rejects charges below the minimum for the currency (CAD $0.50).
const MIN_CHARGE_CENTS = 50;

function env(name: string) {
  // Tolerate values pasted with surrounding whitespace or quotes (common in host dashboards).
  const value = process.env[name]
    ?.trim()
    .replace(/^(["'])(.*)\1$/, "$2")
    .trim();
  return value || undefined;
}

function getPool() {
  const connectionString = env("DATABASE_URL");
  if (!connectionString) {
    throw new PaymentError(
      503,
      "Booking and checkout are not configured yet. The site owner must add DATABASE_URL to the server environment variables.",
    );
  }
  if (!globalPool.__dayoPaymentsPool) {
    globalPool.__dayoPaymentsPool = new Pool({
      connectionString,
      max: 2,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalPool.__dayoPaymentsPool;
}

function stripeSecret() {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) {
    throw new PaymentError(
      503,
      "Stripe is not configured. Add STRIPE_SECRET_KEY to the server environment variables.",
    );
  }
  if (key.startsWith("pk_")) {
    throw new PaymentError(
      503,
      "STRIPE_SECRET_KEY contains a publishable key (pk_...). Use the secret key (sk_...) or a restricted key (rk_...).",
    );
  }
  // Accept both test and live secret/restricted keys so the flow can be tested before going live.
  if (!/^(?:sk|rk)_(?:test|live)_[A-Za-z0-9]{16,}$/.test(key)) {
    throw new PaymentError(
      503,
      "STRIPE_SECRET_KEY is not a valid Stripe secret key. It should start with sk_test_, sk_live_, rk_test_ or rk_live_.",
    );
  }
  return key;
}

function isLocalHostname(hostname: string) {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "[::1]" ||
    host.endsWith(".localhost")
  );
}

function requestOrigin(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || url.host;
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    url.protocol.replace(":", "");
  try {
    return new URL(`${proto}://${host}`).origin;
  } catch {
    return url.origin;
  }
}

function appBase(request: Request) {
  const fromRequest = requestOrigin(request);
  const configured = env("APP_BASE_URL");
  if (!configured) return fromRequest;
  let origin: URL;
  try {
    origin = new URL(configured);
  } catch {
    console.error("[stripe] APP_BASE_URL is not a valid URL; using the request origin instead.");
    return fromRequest;
  }
  if (origin.protocol !== "https:" && origin.protocol !== "http:") return fromRequest;
  // A localhost value copied from a local .env into production would send customers to
  // localhost after paying (and Stripe cannot return them to the real site).
  if (isLocalHostname(origin.hostname) && !isLocalHostname(new URL(fromRequest).hostname)) {
    console.warn(
      "[stripe] APP_BASE_URL points at localhost but the request came from a public host; using the request origin. Set APP_BASE_URL to your real https domain.",
    );
    return fromRequest;
  }
  return origin.origin;
}

export class PaymentError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

export function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function fail(message: string, status = 400): never {
  throw new PaymentError(status, message);
}

function textValue(value: unknown, name: string, max = 200) {
  if (typeof value !== "string") return fail(`${name} is required.`);
  const result = value.trim();
  if (!result || result.length > max) return fail(`${name} is invalid.`);
  return result;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function todayInToronto() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function requireBookingDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Choose a valid appointment date.");
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date)
    return fail("Choose a valid appointment date.");
  const today = todayInToronto();
  const tomorrowDate = new Date(`${today}T12:00:00Z`);
  tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
  const tomorrow = tomorrowDate.toISOString().slice(0, 10);
  const maxDate = new Date(`${today}T12:00:00Z`);
  maxDate.setUTCDate(maxDate.getUTCDate() + 120);
  const lastDate = maxDate.toISOString().slice(0, 10);
  if (date < tomorrow) return fail("Appointments must be booked at least one day ahead.");
  if (date > lastDate) return fail("Appointments can currently be booked up to 120 days ahead.");
  return date;
}

function requireStripeConfigured() {
  stripeSecret();
  const webhookSecret = env("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    throw new PaymentError(
      503,
      "Stripe webhooks are not configured. Add STRIPE_WEBHOOK_SECRET to the server environment variables before accepting payments.",
    );
  }
  if (
    /replace|your[_-]|example|placeholder|xxx/i.test(webhookSecret) &&
    !globalPool.__dayoWebhookWarned
  ) {
    globalPool.__dayoWebhookWarned = true;
    console.warn(
      "[stripe] STRIPE_WEBHOOK_SECRET still looks like a placeholder. Webhook events will be rejected until you paste the real whsec_ signing secret from Stripe.",
    );
  }
  getPool();
}

async function withTransaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const value = await run(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Keep the original error.
    }
    throw error;
  } finally {
    client.release();
  }
}

async function stripeRequest(
  path: string,
  method: "GET" | "POST",
  form?: URLSearchParams,
  idempotencyKey?: string,
) {
  let response: Response;
  try {
    response = await fetch(`https://api.stripe.com/v1/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${stripeSecret()}`,
        ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: form,
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    console.error("[stripe] could not reach the Stripe API", error);
    throw new PaymentError(502, "Could not reach Stripe. Please try again in a moment.");
  }
  const data = (await response.json().catch(() => ({}))) as {
    error?: { message?: string; type?: string; code?: string; param?: string };
    id?: string;
    url?: string | null;
    payment_status?: string;
    currency?: string;
    amount_total?: number | null;
    metadata?: Record<string, string>;
    customer_email?: string | null;
  };
  if (!response.ok) {
    console.error("[stripe] API request failed", {
      status: response.status,
      path,
      type: data.error?.type,
      code: data.error?.code,
      param: data.error?.param,
      message: data.error?.message || "Unknown Stripe error",
    });
    if (response.status === 401 || response.status === 403) {
      throw new PaymentError(
        502,
        "Stripe rejected this site's API key or its permissions. The site owner must check STRIPE_SECRET_KEY (a restricted key needs Checkout Sessions: Write and Read).",
      );
    }
    throw new PaymentError(502, "Stripe could not start the payment. Please try again.");
  }
  return data;
}

function setLineItem(
  form: URLSearchParams,
  index: number,
  name: string,
  description: string,
  amountCents: number,
  quantity: number,
) {
  form.set(`line_items[${index}][quantity]`, String(quantity));
  form.set(`line_items[${index}][price_data][currency]`, "cad");
  form.set(`line_items[${index}][price_data][unit_amount]`, String(amountCents));
  form.set(
    `line_items[${index}][price_data][product_data][name]`,
    name.trim().slice(0, 250) || "Item",
  );
  // Stripe rejects an empty-string description, so only send it when there is one.
  const trimmedDescription = description.trim().slice(0, 500);
  if (trimmedDescription) {
    form.set(`line_items[${index}][price_data][product_data][description]`, trimmedDescription);
  }
}

function baseCheckoutForm(
  base: string,
  email: string,
  successUrl: string,
  cancelUrl: string,
  orderType: "booking" | "shop",
  orderId: string,
) {
  const form = new URLSearchParams();
  form.set("mode", "payment");
  //form.set("payment_method_types[0]", "card");
  form.set("customer_email", email);
  form.set("success_url", `${base}${successUrl}`);
  form.set("cancel_url", `${base}${cancelUrl}`);
  form.set("metadata[order_type]", orderType);
  form.set("metadata[order_id]", orderId);
  form.set("payment_intent_data[metadata][order_type]", orderType);
  form.set("payment_intent_data[metadata][order_id]", orderId);
  return form;
}

export async function startBookingCheckout(request: Request) {
  requireStripeConfigured();
  const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw) return fail("Invalid booking details.");

  const serviceSlug = textValue(raw.serviceSlug, "Hairstyle", 100);
  const sizeLabel = textValue(raw.size, "Size or style option", 100);
  const appointmentDate = requireBookingDate(textValue(raw.date, "Appointment date", 10));
  const appointmentTime = textValue(raw.time, "Appointment time", 5);
  if (!TIME_SLOTS.includes(appointmentTime as (typeof TIME_SLOTS)[number]))
    return fail("Choose one of the available appointment times.");

  const fullName = textValue(raw.fullName, "Full name", 140);
  const email = textValue(raw.email, "Email", 200).toLowerCase();
  const phone = textValue(raw.phone, "Phone number", 60);
  if (!validEmail(email)) return fail("Enter a valid email address.");

  const style = styleBySlug(serviceSlug);
  if (!style || style.quote || style.contactOnly)
    return fail("This hairstyle requires a custom quote. Please contact the salon to book it.");
  const size = style.sizes.find((item) => item.label.en === sizeLabel);
  if (!size) return fail("Choose a valid size or style option.");

  const fullAmountCents = Math.round(Number(size.price) * 100);
  const depositAmountCents = Math.round(fullAmountCents * depositRate);
  if (
    !Number.isFinite(fullAmountCents) ||
    fullAmountCents <= 0 ||
    depositAmountCents < MIN_CHARGE_CENTS
  )
    return fail("This hairstyle cannot be paid for online yet.");

  const bookingId = `bk_${randomUUID().replace(/-/g, "")}`;
  const holdExpiresAt = new Date(Date.now() + BOOKING_HOLD_TTL_MS);
  try {
    await withTransaction(async (client) => {
      // Serialize reservations by Toronto-local appointment date before counting day capacity.
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1)::bigint)", [
        `dayo-booking-day:${appointmentDate}`,
      ]);
      await client.query(
        "UPDATE dayo_bookings SET status = 'expired' WHERE appointment_date = $1 AND status = 'pending_payment' AND expires_at <= now()",
        [appointmentDate],
      );
      const countResult = await client.query<{ count: string }>(
        "SELECT count(*)::text AS count FROM dayo_bookings WHERE appointment_date = $1 AND (status = 'confirmed' OR (status = 'pending_payment' AND expires_at > now()))",
        [appointmentDate],
      );
      if (Number(countResult.rows[0]?.count ?? 0) >= 5) {
        throw new PaymentError(
          409,
          "This date has reached its limit of five appointments. Please choose another day.",
        );
      }
      const duplicate = await client.query(
        "SELECT id FROM dayo_bookings WHERE appointment_date = $1 AND appointment_time = $2 AND (status = 'confirmed' OR (status = 'pending_payment' AND expires_at > now())) LIMIT 1",
        [appointmentDate, appointmentTime],
      );
      if (duplicate.rowCount)
        throw new PaymentError(409, "That time was just taken. Choose another available time.");
      await client.query(
        `INSERT INTO dayo_bookings
          (id, customer_name, email, phone, service_slug, service_name, size_label, appointment_date, appointment_time,
           service_amount_cents, deposit_amount_cents, status, expires_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending_payment',$12)`,
        [
          bookingId,
          fullName,
          email,
          phone,
          style.slug,
          style.name,
          sizeLabel,
          appointmentDate,
          appointmentTime,
          fullAmountCents,
          depositAmountCents,
          holdExpiresAt,
        ],
      );
    });
  } catch (error) {
    if (error instanceof PaymentError) throw error;
    if ((error as { code?: string })?.code === "23505")
      throw new PaymentError(409, "That time was just taken. Choose another available time.");
    throw error;
  }

  const base = appBase(request);
  const form = baseCheckoutForm(
    base,
    email,
    `/booking-success?session_id={CHECKOUT_SESSION_ID}`,
    `/reservation?service=${encodeURIComponent(style.slug)}&size=${encodeURIComponent(sizeLabel)}&payment=cancelled`,
    "booking",
    bookingId,
  );
  form.set("expires_at", String(Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS));
  setLineItem(
    form,
    0,
    `${style.name} — 35% booking deposit (${sizeLabel})`,
    `Appointment ${appointmentDate} at ${appointmentTime}. Full service price: $${(fullAmountCents / 100).toFixed(2)} CAD. Remaining balance is payable at the appointment.`,
    depositAmountCents,
    1,
  );

  try {
    const session = await stripeRequest("checkout/sessions", "POST", form, bookingId);
    if (!session.id || !session.url)
      throw new PaymentError(502, "Stripe did not return a checkout link.");
    await getPool().query(
      "UPDATE dayo_bookings SET checkout_session_id = $2, expires_at = $3 WHERE id = $1 AND status = 'pending_payment'",
      [bookingId, session.id, holdExpiresAt],
    );
    return { url: session.url };
  } catch (error) {
    await getPool()
      .query(
        "UPDATE dayo_bookings SET status = 'payment_failed' WHERE id = $1 AND status = 'pending_payment'",
        [bookingId],
      )
      .catch(() => undefined);
    throw error;
  }
}

function parseCustomer(value: unknown): Customer {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return fail("Enter your delivery details.");
  const raw = value as Record<string, unknown>;
  const customer = {
    fullName: textValue(raw.fullName, "Full name", 140),
    email: textValue(raw.email, "Email", 200).toLowerCase(),
    phone: textValue(raw.phone, "Phone number", 60),
    address: textValue(raw.address, "Street address", 220),
    city: textValue(raw.city, "City", 100),
    province: textValue(raw.province, "Province", 20),
    postal: textValue(raw.postal, "Postal code", 30).toUpperCase(),
  };
  if (!validEmail(customer.email)) return fail("Enter a valid email address.");
  if (!/^[A-Z]{2}$/.test(customer.province)) return fail("Choose a valid province.");
  if (!/^[A-Z]\d[A-Z] ?\d[A-Z]\d$/.test(customer.postal))
    return fail("Enter a valid Canadian postal code, such as M5V 2T6.");
  return customer;
}

export async function startShopCheckout(request: Request) {
  requireStripeConfigured();
  const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw) return fail("Invalid checkout details.");
  const customer = parseCustomer(raw.customer);
  if (!Array.isArray(raw.items) || raw.items.length < 1 || raw.items.length > 50)
    return fail("Your cart is empty or invalid.");

  const items = raw.items.map((entry) => {
    if (!entry || typeof entry !== "object") return fail("Invalid product in your cart.");
    const line = entry as Record<string, unknown>;
    const id = Number(line.id);
    const qty = Number(line.qty);
    const product = products.find((item) => item.id === id);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20)
      return fail("A product in your cart has invalid quantity.");
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      qty,
      unitPriceCents: Math.round(product.price * 100),
    };
  });
  const totalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.qty, 0);
  if (totalCents < MIN_CHARGE_CENTS)
    return fail("The order total is below the $0.50 CAD minimum Stripe can charge.");

  const orderId = `ord_${randomUUID().replace(/-/g, "")}`;
  await getPool().query(
    "INSERT INTO dayo_orders (id, customer_email, customer_json, items_json, total_cents, status) VALUES ($1,$2,$3::jsonb,$4::jsonb,$5,'pending_payment')",
    [orderId, customer.email, JSON.stringify(customer), JSON.stringify(items), totalCents],
  );

  const base = appBase(request);
  const form = baseCheckoutForm(
    base,
    customer.email,
    "/merci?session_id={CHECKOUT_SESSION_ID}",
    `/checkout?cancelled=1`,
    "shop",
    orderId,
  );
  items.forEach((item, index) =>
    setLineItem(form, index, item.name, item.description, item.unitPriceCents, item.qty),
  );
  try {
    const session = await stripeRequest("checkout/sessions", "POST", form, orderId);
    if (!session.id || !session.url)
      throw new PaymentError(502, "Stripe did not return a checkout link.");
    await getPool().query("UPDATE dayo_orders SET checkout_session_id = $2 WHERE id = $1", [
      orderId,
      session.id,
    ]);
    return { url: session.url };
  } catch (error) {
    await getPool()
      .query("UPDATE dayo_orders SET status = 'payment_failed' WHERE id = $1", [orderId])
      .catch(() => undefined);
    throw error;
  }
}

export async function getBookingAvailability(date: string) {
  // Availability only reads the database; it must not depend on Stripe being configured.
  getPool();
  const appointmentDate = requireBookingDate(date);
  const result = await getPool().query<{ appointment_time: string; count: string }>(
    `SELECT appointment_time, count(*) OVER()::text AS count
     FROM dayo_bookings
     WHERE appointment_date = $1
       AND (status = 'confirmed' OR (status = 'pending_payment' AND expires_at > now()))`,
    [appointmentDate],
  );
  const bookedTimes = result.rows.map((row) => row.appointment_time.slice(0, 5));
  const activeCount = Number(result.rows[0]?.count ?? 0);
  return {
    date: appointmentDate,
    times: TIME_SLOTS.filter((time) => !bookedTimes.includes(time)),
    remaining: Math.max(0, 5 - activeCount),
  };
}

async function getStripeSession(sessionId: string): Promise<StripeSession> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId))
    throw new PaymentError(400, "Invalid checkout session.");
  return (await stripeRequest(
    `checkout/sessions/${encodeURIComponent(sessionId)}`,
    "GET",
  )) as StripeSession;
}

async function markPaidSession(session: StripeSession) {
  if (session.payment_status !== "paid" || session.currency?.toLowerCase() !== "cad") return false;
  const orderType = session.metadata?.order_type;
  const orderId = session.metadata?.order_id;
  if (!orderId || !session.id) return false;

  if (orderType === "booking") {
    const updated = await getPool().query(
      `UPDATE dayo_bookings
       SET status = 'confirmed', paid_at = COALESCE(paid_at, now())
       WHERE id = $1 AND checkout_session_id = $2 AND deposit_amount_cents = $3
         AND status IN ('pending_payment', 'confirmed')
       RETURNING id`,
      [orderId, session.id, session.amount_total ?? -1],
    );
    return (updated.rowCount ?? 0) === 1;
  }
  if (orderType === "shop") {
    const updated = await getPool().query(
      `UPDATE dayo_orders
       SET status = 'paid', paid_at = COALESCE(paid_at, now())
       WHERE id = $1 AND checkout_session_id = $2 AND total_cents = $3
         AND status IN ('pending_payment', 'paid')
       RETURNING id`,
      [orderId, session.id, session.amount_total ?? -1],
    );
    return (updated.rowCount ?? 0) === 1;
  }
  return false;
}

export async function verifyCheckoutSession(sessionId: string) {
  // Verifying an existing session needs the API key and database, not the webhook secret.
  stripeSecret();
  getPool();
  const session = await getStripeSession(sessionId);
  if (session.payment_status === "paid") await markPaidSession(session);
  const type = session.metadata?.order_type;
  const id = session.metadata?.order_id;
  if (!id || !type) return { paid: false, type: null };
  if (type === "booking") {
    const found = await getPool().query<{
      status: string;
      service_name: string;
      appointment_date: string;
      appointment_time: string;
    }>(
      "SELECT status, service_name, appointment_date::text, appointment_time FROM dayo_bookings WHERE id = $1 AND checkout_session_id = $2",
      [id, session.id],
    );
    const booking = found.rows[0];
    return {
      paid: session.payment_status === "paid" && booking?.status === "confirmed",
      type: "booking",
      status: booking?.status ?? "not_found",
      service: booking?.service_name,
      date: booking?.appointment_date,
      time: booking?.appointment_time?.slice(0, 5),
    };
  }
  const found = await getPool().query<{ status: string }>(
    "SELECT status FROM dayo_orders WHERE id = $1 AND checkout_session_id = $2",
    [id, session.id],
  );
  return {
    paid: session.payment_status === "paid" && found.rows[0]?.status === "paid",
    type: "shop",
    status: found.rows[0]?.status ?? "not_found",
  };
}

function validStripeSignature(body: string, header: string, secret: string) {
  const parts = header.split(",").map((part) => part.split("=", 2));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts
    .filter(([key]) => key === "v1")
    .map(([, value]) => value)
    .filter((v): v is string => Boolean(v));
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${body}`, "utf8").digest();
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    const actual = Buffer.from(signature, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
}

export async function handleStripeWebhook(request: Request) {
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!secret) throw new PaymentError(503, "Stripe webhook is not configured.");
  getPool();
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();
  if (!signature || !validStripeSignature(body, signature, secret))
    throw new PaymentError(400, "Invalid Stripe webhook signature.");
  let event: { type?: string; data?: { object?: StripeSession } };
  try {
    event = JSON.parse(body) as { type?: string; data?: { object?: StripeSession } };
  } catch {
    throw new PaymentError(400, "Invalid Stripe event body.");
  }
  const session = event.data?.object;
  if (
    session?.id &&
    ["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(
      event.type ?? "",
    ) &&
    session.payment_status === "paid"
  ) {
    const updated = await markPaidSession(session);
    if (!updated) {
      // Return a retriable error rather than acknowledging a paid session we could not
      // reconcile. Stripe will retry this webhook; the customer is never auto-confirmed.
      console.error("[stripe] Paid checkout could not be linked to a pending order", session.id);
      throw new PaymentError(
        500,
        "Paid checkout could not yet be reconciled. Stripe should retry this event.",
      );
    }
  }
  if (session?.id && event.type === "checkout.session.expired") {
    const type = session.metadata?.order_type;
    const id = session.metadata?.order_id;
    if (type === "booking" && id) {
      await getPool().query(
        "UPDATE dayo_bookings SET status = 'expired' WHERE id = $1 AND checkout_session_id = $2 AND status = 'pending_payment'",
        [id, session.id],
      );
    }
    if (type === "shop" && id) {
      await getPool().query(
        "UPDATE dayo_orders SET status = 'payment_failed' WHERE id = $1 AND checkout_session_id = $2 AND status = 'pending_payment'",
        [id, session.id],
      );
    }
  }
  return { received: true };
}
