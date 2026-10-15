-- SA SPORTS database schema + Row Level Security.
-- Run this whole file once in Supabase: SQL Editor > New query > paste > Run.

create extension if not exists pgcrypto;

-- ---------- Admins ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Catalog ----------
create table if not exists public.categories (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  category_slug text not null references public.categories(slug) on update cascade,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  image_url text not null default '',
  stock int not null default 0 check (stock >= 0),
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Inquiries ----------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  country text not null check (char_length(country) between 1 and 100),
  product_category text not null check (char_length(product_category) between 1 and 100),
  phone text check (phone is null or char_length(phone) <= 40),
  message text not null check (char_length(message) between 1 and 4000),
  status text not null default 'new' check (status in ('new','replied','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.wholesale_leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null check (char_length(company_name) between 1 and 160),
  country text not null check (char_length(country) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  product_category text not null check (char_length(product_category) between 1 and 100),
  estimated_quantity text not null check (char_length(estimated_quantity) between 1 and 100),
  message text not null default '' check (char_length(message) <= 4000),
  status text not null default 'new' check (status in ('new','contacted','quoted','won','lost')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- ---------- Orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  email text not null,
  phone text,
  country text not null,
  address text not null,
  notes text not null default '',
  total numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0)
);

-- ---------- Row Level Security ----------
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.inquiries enable row level security;
alter table public.wholesale_leads enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- admins: a signed-in user can only see their own row. Nobody can write from the browser.
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select to authenticated using (user_id = auth.uid());

-- categories: public read, admin write
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- products: public sees active only, admin sees and writes everything
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select to anon, authenticated using (active or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- inquiries: anyone can submit (new only), only admins can read/manage
drop policy if exists "inquiries public insert" on public.inquiries;
create policy "inquiries public insert" on public.inquiries for insert to anon, authenticated with check (status = 'new');
drop policy if exists "inquiries admin all" on public.inquiries;
create policy "inquiries admin all" on public.inquiries for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- wholesale leads: same pattern
drop policy if exists "wholesale public insert" on public.wholesale_leads;
create policy "wholesale public insert" on public.wholesale_leads for insert to anon, authenticated with check (status = 'new' and notes = '');
drop policy if exists "wholesale admin all" on public.wholesale_leads;
create policy "wholesale admin all" on public.wholesale_leads for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- orders: NO public insert. Customers place orders through place_order() below, which prices items from the database.
drop policy if exists "orders admin all" on public.orders;
create policy "orders admin all" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "order items admin all" on public.order_items;
create policy "order items admin all" on public.order_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Safe order placement ----------
-- p_items example: [{"slug":"signature-bridle-belt","quantity":2}]
-- Prices always come from the products table, never from the browser.
create or replace function public.place_order(
  p_name text, p_email text, p_phone text, p_country text, p_address text, p_notes text, p_items jsonb
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref text;
  v_order_id uuid;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_prod public.products%rowtype;
  v_qty int;
begin
  if p_name is null or char_length(trim(p_name)) = 0 or char_length(p_name) > 120 then raise exception 'Invalid name'; end if;
  if p_email is null or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(p_email) > 200 then raise exception 'Invalid email'; end if;
  if p_country is null or char_length(trim(p_country)) = 0 or char_length(p_country) > 100 then raise exception 'Invalid country'; end if;
  if p_address is null or char_length(trim(p_address)) = 0 or char_length(p_address) > 500 then raise exception 'Invalid address'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 40 then raise exception 'Invalid cart'; end if;

  v_ref := 'SA-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 8));
  insert into public.orders (reference, customer_name, email, phone, country, address, notes, total)
  values (v_ref, trim(p_name), trim(p_email), nullif(trim(coalesce(p_phone,'')), ''), trim(p_country), trim(p_address), left(coalesce(p_notes,''), 2000), 0)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::int;
    if v_qty is null or v_qty < 1 or v_qty > 500 then raise exception 'Invalid quantity'; end if;
    select * into v_prod from public.products where slug = (v_item->>'slug') and active;
    if not found then raise exception 'Product not available: %', (v_item->>'slug'); end if;
    if v_prod.stock < v_qty then raise exception 'Not enough stock for %', v_prod.name; end if;
    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
    values (v_order_id, v_prod.id, v_prod.name, v_prod.price, v_qty);
    v_total := v_total + v_prod.price * v_qty;
  end loop;

  update public.orders set total = v_total where id = v_order_id;
  return v_ref;
end;
$$;

revoke all on function public.place_order(text,text,text,text,text,text,jsonb) from public;
grant execute on function public.place_order(text,text,text,text,text,text,jsonb) to anon, authenticated;

-- ---------- Inventory follows order status ----------
-- Stock is deducted when an admin moves an order to 'confirmed' (or later) and restored if it is cancelled afterwards.
create or replace function public.sync_stock_on_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  was_reserved boolean := old.status in ('confirmed','shipped','delivered');
  now_reserved boolean := new.status in ('confirmed','shipped','delivered');
begin
  if was_reserved = now_reserved then return new; end if;
  if now_reserved then
    update public.products p set stock = greatest(p.stock - oi.quantity, 0)
    from public.order_items oi where oi.order_id = new.id and oi.product_id = p.id;
  else
    update public.products p set stock = p.stock + oi.quantity
    from public.order_items oi where oi.order_id = new.id and oi.product_id = p.id;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_sync_stock on public.orders;
create trigger orders_sync_stock after update of status on public.orders
for each row execute function public.sync_stock_on_status();

-- ---------- Product image storage (public read, admin write) ----------
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
