-- Persistent orders and pay-before-confirmation appointment reservations.
-- This migration must run against the production Postgres DATABASE_URL before launch.
create table if not exists dayo_bookings (
  id text primary key,
  customer_name text not null,
  email text not null,
  phone text not null,
  service_slug text not null,
  service_name text not null,
  size_label text not null,
  appointment_date date not null,
  appointment_time text not null,
  service_amount_cents integer not null check (service_amount_cents > 0),
  deposit_amount_cents integer not null check (deposit_amount_cents > 0),
  status text not null check (status in ('pending_payment', 'confirmed', 'expired', 'payment_failed', 'payment_issue')),
  checkout_session_id text unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- Pending checkouts hold a slot temporarily; paid bookings hold it permanently.
create unique index if not exists dayo_bookings_unique_active_slot
  on dayo_bookings (appointment_date, appointment_time)
  where status in ('pending_payment', 'confirmed');
create index if not exists dayo_bookings_active_day
  on dayo_bookings (appointment_date, status, expires_at);
create index if not exists dayo_bookings_email
  on dayo_bookings (email, created_at desc);

create table if not exists dayo_orders (
  id text primary key,
  customer_email text not null,
  customer_json jsonb not null,
  items_json jsonb not null,
  total_cents integer not null check (total_cents > 0),
  status text not null check (status in ('pending_payment', 'paid', 'payment_failed', 'payment_issue')),
  checkout_session_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists dayo_orders_email on dayo_orders (customer_email, created_at desc);
