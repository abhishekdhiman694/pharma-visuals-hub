-- Schema for pharma product visualizer
-- 1) Roles
create type if not exists public.app_role as enum ('admin', 'moderator', 'user');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- 2) Core tables
create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id text not null references public.categories(id) on delete restrict,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_images_product on public.product_images(product_id);
create index if not exists idx_images_product_sort on public.product_images(product_id, sort_order);

-- 3) Updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger update_products_updated_at
before update on public.products
for each row execute function public.update_updated_at_column();

-- 4) RLS: Public read, admin write
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- Categories policies
create policy if not exists "Categories are viewable by everyone"
  on public.categories for select using (true);
create policy if not exists "Only admins can insert categories"
  on public.categories for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy if not exists "Only admins can update categories"
  on public.categories for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy if not exists "Only admins can delete categories"
  on public.categories for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Products policies
create policy if not exists "Products are viewable by everyone"
  on public.products for select using (true);
create policy if not exists "Only admins can insert products"
  on public.products for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy if not exists "Only admins can update products"
  on public.products for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy if not exists "Only admins can delete products"
  on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Product images policies
create policy if not exists "Product images are viewable by everyone"
  on public.product_images for select using (true);
create policy if not exists "Only admins can insert product images"
  on public.product_images for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy if not exists "Only admins can update product images"
  on public.product_images for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy if not exists "Only admins can delete product images"
  on public.product_images for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 5) Seed default categories
insert into public.categories (id, name)
  values ('ortho','Ortho'),('gyne','Gyne'),('cardio','Cardio'),('neuro','Neuro')
on conflict (id) do nothing;