create type public.lead_status as enum ('new','approved','rejected');

create table public.wholesale_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  company text not null check (char_length(company) between 1 and 200),
  city text not null check (char_length(city) between 1 and 120),
  phone text not null check (char_length(phone) between 5 and 40),
  messenger_type text check (messenger_type in ('max','telegram','whatsapp')),
  messenger_contact text check (char_length(messenger_contact) <= 120),
  business_type text not null check (business_type in ('shop','rental','workshop','dealer','other')),
  inn text check (inn ~ '^[0-9]{10}([0-9]{2})?$'),
  sales_links text check (char_length(sales_links) <= 2000),
  comment text check (char_length(comment) <= 3000),
  source text check (char_length(source) <= 200),
  consent boolean not null check (consent = true),
  status public.lead_status not null default 'new',
  admin_note text
);
grant insert on public.wholesale_leads to anon, authenticated;
grant all on public.wholesale_leads to service_role;
alter table public.wholesale_leads enable row level security;
create policy "public can submit leads" on public.wholesale_leads for insert to anon, authenticated with check (status = 'new' and admin_note is null);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  topic text not null default 'news' check (topic in ('news','antimold')),
  consent boolean not null check (consent = true),
  unique (email, topic)
);
grant insert on public.subscribers to anon, authenticated;
grant all on public.subscribers to service_role;
alter table public.subscribers enable row level security;
create policy "public can subscribe" on public.subscribers for insert to anon, authenticated with check (true);

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  logo_url text,
  ozon_url text,
  wildberries_url text,
  avito_url text,
  yandex_market_url text,
  own_shop_url text,
  dealers_page_enabled boolean not null default false,
  contact_phone text,
  contact_email text,
  contact_telegram text,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "settings are public" on public.site_settings for select to anon, authenticated using (true);
insert into public.site_settings (id) values (1);