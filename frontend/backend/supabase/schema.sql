-- ============================================================================
-- Mabuyu Street — Supabase schema (Phase 2 Migration Update)
-- Run this in the Supabase SQL Editor (or via `supabase db push`).
-- ============================================================================

create extension if not exists "uuid-ossp";

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  signup_method text not null default 'email' check (signup_method in ('email', 'magic_link')),
  loyalty_points integer not null default 0,
  total_orders integer not null default 0,
  is_repeat_customer boolean generated always as (total_orders >= 3) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null default 'admin' check (role in ('admin', 'superadmin')),
  is_2fa_enabled boolean not null default false,
  totp_secret text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image text not null,
  badge text,
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  stock integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customer_profiles(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  delivery_address text,
  contact_phone text,
  payment_method text default 'mpesa',
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity integer not null check (quantity > 0)
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customer_profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete cascade,
  guest_name text,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Group 2 Tables: Delivery Zones, Loyalty Tiers, Event Types & Presets
-- ============================================================================

create table if not exists public.delivery_zones (
    id text primary key,
    label text not null,
    fee numeric not null default 0,
    note text,
    sort_order integer not null default 0,
    is_active boolean not null default true
);

create table if not exists public.loyalty_tiers (
    id text primary key,
    name text not null,
    threshold integer not null,
    perk text not null,
    sort_order integer not null default 0
);

create table if not exists public.event_types (
    id text primary key,
    name text not null,
    description text,
    sort_order integer not null default 0,
    is_active boolean not null default true
);

create table if not exists public.event_presets (
    id uuid primary key default uuid_generate_v4(),
    event_type_id text not null references public.event_types(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    quantity integer not null default 1,
    is_active boolean not null default true
);

-- Seed initial delivery zones safely
insert into public.delivery_zones (id, label, fee, note, sort_order, is_active) values
('pickup', 'Pickup', 0, 'Collect at Juja Gate C', 0, true),
('juja', 'Juja', 0, 'Free delivery within Juja', 1, true),
('kenyatta_road', 'Kenyatta Road', 40, 'Kenyatta Road area', 2, true),
('witeithie', 'Witeithie', 50, 'Witeithie area', 3, true),
('thika', 'Thika', 60, 'Thika town & surrounding', 4, true),
('toll_kimbo', 'Toll / Kimbo', 60, 'Toll Station & Kimbo', 5, true),
('thika_road_corridor', 'Ruiru, Bypass, KU, Kahawa Sukari, Kahawa Wendani, Githurai', 90, 'Thika Road corridor', 6, true),
('roysambu_cbd', 'Roysambu to CBD', 120, 'Any point along this route', 7, true)
on conflict (id) do nothing;

create table if not exists public.loyalty_rewards (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.customer_profiles(id) on delete cascade,
  points integer not null,
  reason text not null,
  granted_by uuid references public.admin_users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  actor_type text not null check (actor_type in ('customer', 'admin', 'system')),
  actor_id uuid,
  event_type text not null,
  details jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_activity_log_created on public.activity_log(created_at desc);
create index if not exists idx_products_category on public.products(category_id);

create or replace function public.increment_customer_orders(customer_uuid uuid)
returns void as $$   update public.customer_profiles   set total_orders = total_orders + 1, updated_at = now()   where id = customer_uuid; $$ language sql;

alter table public.customer_profiles enable row level security;
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.loyalty_tiers enable row level security;
alter table public.event_types enable row level security;
alter table public.event_presets enable row level security;
alter table public.loyalty_rewards enable row level security;
alter table public.activity_log enable row level security;

create policy "customer reads own profile" on public.customer_profiles
  for select using (auth.uid() = id);
create policy "customer updates own profile" on public.customer_profiles
  for update using (auth.uid() = id);

create policy "admin_users no client access" on public.admin_users
  for all using (false);

create policy "public reads categories" on public.categories
  for select using (true);
create policy "public reads active products" on public.products
  for select using (is_active = true);

create policy "customer reads own orders" on public.orders
  for select using (auth.uid() = customer_id);
create policy "customer reads own order items" on public.order_items
  for select using (exists (
    select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()
  ));

create policy "public reads published reviews" on public.reviews
  for select using (is_published = true);
create policy "customer inserts own review" on public.reviews
  for insert with check (auth.uid() = customer_id or customer_id is null);

create policy "public reads delivery zones" on public.delivery_zones
  for select using (is_active = true);
create policy "public reads loyalty tiers" on public.loyalty_tiers
  for select using (true);
create policy "public reads event types" on public.event_types
  for select using (is_active = true);
create policy "public reads event presets" on public.event_presets
  for select using (is_active = true);

create policy "loyalty no client access" on public.loyalty_rewards
  for all using (false);
create policy "activity log no client access" on public.activity_log
  for all using (false);
  -- ============================================================================
-- Phase 2b: unread flags for the admin dashboard's red badge counts
-- ============================================================================

alter table public.orders add column if not exists is_read_by_admin boolean not null default false;
alter table public.reviews add column if not exists is_read_by_admin boolean not null default false;
alter table public.customer_profiles add column if not exists is_read_by_admin boolean not null default false;

create index if not exists idx_orders_unread on public.orders(is_read_by_admin) where is_read_by_admin = false;
create index if not exists idx_reviews_unread on public.reviews(is_read_by_admin) where is_read_by_admin = false;
create index if not exists idx_customers_unread on public.customer_profiles(is_read_by_admin) where is_read_by_admin = false;