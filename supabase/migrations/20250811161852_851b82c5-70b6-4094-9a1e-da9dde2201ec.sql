-- Schema for pharma product visualizer (compat-friendly)

-- 1) Roles (enum via DO block for compatibility)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END
$$;

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

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) RLS: Public read, admin write
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- Categories policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins can insert categories" ON public.categories;
CREATE POLICY "Only admins can insert categories"
  ON public.categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Only admins can update categories" ON public.categories;
CREATE POLICY "Only admins can update categories"
  ON public.categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Only admins can delete categories" ON public.categories;
CREATE POLICY "Only admins can delete categories"
  ON public.categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Products policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
CREATE POLICY "Only admins can insert products"
  ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
CREATE POLICY "Only admins can update products"
  ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;
CREATE POLICY "Only admins can delete products"
  ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Product images policies
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON public.product_images;
CREATE POLICY "Product images are viewable by everyone"
  ON public.product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Only admins can insert product images" ON public.product_images;
CREATE POLICY "Only admins can insert product images"
  ON public.product_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Only admins can update product images" ON public.product_images;
CREATE POLICY "Only admins can update product images"
  ON public.product_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Only admins can delete product images" ON public.product_images;
CREATE POLICY "Only admins can delete product images"
  ON public.product_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5) Seed default categories
insert into public.categories (id, name)
  values ('ortho','Ortho'),('gyne','Gyne'),('cardio','Cardio'),('neuro','Neuro')
on conflict (id) do nothing;