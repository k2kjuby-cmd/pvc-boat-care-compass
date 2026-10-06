create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    return public.has_role(auth.uid(), 'admin');
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin');
  return true;
end $$;
revoke execute on function public.claim_first_admin() from public, anon;
grant execute on function public.claim_first_admin() to authenticated;

create type public.product_status as enum ('published','soon','hidden');

create table public.product_lines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  color text not null default 'none' check (color in ('lite','pro','armor','none')),
  sort int not null default 0
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort int not null default 0
);
create table public.problems (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  icon text not null default 'droplet',
  category_slug text,
  is_soon boolean not null default false,
  sort int not null default 0
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  line_id uuid references public.product_lines(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  short_description text,
  status public.product_status not null default 'hidden',
  is_hit boolean not null default false,
  has_dilution_calc boolean not null default false,
  video_url text check (video_url is null or video_url ~ '^https://'),
  purpose text,
  usage_steps jsonb not null default '[]'::jsonb,
  warnings text,
  composition text,
  suitable_for text[] not null default '{}',
  cure_time text,
  faq jsonb not null default '[]'::jsonb,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  volume_ml numeric,
  weight_g numeric,
  sku text unique,
  price numeric(12,2),
  stock int,
  gross_weight_g numeric,
  sold_on_site boolean not null default true,
  ozon_url text, wildberries_url text, avito_url text, yandex_market_url text,
  image_url text,
  sort int not null default 0
);
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  kind text not null default 'photo' check (kind in ('photo','label','package')),
  is_render boolean not null default false,
  sort int not null default 0
);
create table public.product_recommendations (
  product_id uuid not null references public.products(id) on delete cascade,
  recommended_id uuid not null references public.products(id) on delete cascade,
  sort int not null default 0,
  primary key (product_id, recommended_id),
  check (product_id <> recommended_id)
);
create index on public.product_variants(product_id);
create index on public.product_images(product_id);

grant select on public.product_lines, public.categories, public.problems, public.products, public.product_variants, public.product_images, public.product_recommendations to anon, authenticated;
grant insert, update, delete on public.product_lines, public.categories, public.problems, public.products, public.product_variants, public.product_images, public.product_recommendations to authenticated;
grant all on public.product_lines, public.categories, public.problems, public.products, public.product_variants, public.product_images, public.product_recommendations to service_role;

alter table public.product_lines enable row level security;
alter table public.categories enable row level security;
alter table public.problems enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_recommendations enable row level security;

create policy "public read" on public.product_lines for select to anon, authenticated using (true);
create policy "public read" on public.categories for select to anon, authenticated using (true);
create policy "public read" on public.problems for select to anon, authenticated using (true);
create policy "public read visible" on public.products for select to anon, authenticated using (status <> 'hidden' or public.has_role(auth.uid(),'admin'));
create policy "public read" on public.product_variants for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and (p.status <> 'hidden' or public.has_role(auth.uid(),'admin'))));
create policy "public read" on public.product_images for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and (p.status <> 'hidden' or public.has_role(auth.uid(),'admin'))));
create policy "public read" on public.product_recommendations for select to anon, authenticated using (true);

create policy "admin write" on public.product_lines for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.problems for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.product_variants for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.product_images for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.product_recommendations for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

grant select, update, delete on public.wholesale_leads to authenticated;
create policy "admin read leads" on public.wholesale_leads for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update leads" on public.wholesale_leads for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete leads" on public.wholesale_leads for delete to authenticated using (public.has_role(auth.uid(),'admin'));
grant update on public.site_settings to authenticated;
create policy "admin update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
grant select on public.subscribers to authenticated;
create policy "admin read subscribers" on public.subscribers for select to authenticated using (public.has_role(auth.uid(),'admin'));

alter table public.subscribers add column product_id uuid references public.products(id) on delete cascade;
alter table public.subscribers drop constraint if exists subscribers_topic_check;
alter table public.subscribers add constraint subscribers_topic_check check (topic in ('news','antimold','product'));
alter table public.subscribers drop constraint if exists subscribers_email_topic_key;
create unique index subscribers_unique on public.subscribers (email, topic, coalesce(product_id, '00000000-0000-0000-0000-000000000000'::uuid));

create policy "product images admin select" on storage.objects for select to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "product images admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "product images admin update" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "product images admin delete" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));

insert into public.product_lines (slug,name,color,sort) values ('lite','Lite','lite',1),('pro','Pro','pro',2),('armor','Armor','armor',3);
insert into public.categories (slug,name,sort) values ('remont','Ремонт',1),('germetizaciya','Герметизация внутри',2),('ochistka','Очистка',3),('aksessuary','Аксессуары',4);
insert into public.problems (slug,title,icon,category_slug,is_soon,sort) values
('prokol','Прокол или порез','scissors','remont',false,1),
('shov','Травит шов','waves','germetizaciya',false,2),
('sduvaetsya','Лодка сдувается понемногу','wind','germetizaciya',false,3),
('gryaz','Грязная и выцветшая лодка','sparkles','ochistka',false,4),
('plesen','Плесень','shield-alert',null,true,5);

insert into public.products (slug,name,line_id,category_id,short_description,status,is_hit,warnings,suitable_for,sort) values
('zhidkaya-zaplatka-lite','Жидкая заплатка НеСдует Lite',(select id from public.product_lines where slug='lite'),(select id from public.categories where slug='remont'),'Жидкая заплатка для небольших повреждений ПВХ.','published',true,'Только для небольших повреждений.','{boat}',1),
('zhidkaya-zaplatka-pro','Жидкая заплатка НеСдует Pro',(select id from public.product_lines where slug='pro'),(select id from public.categories where slug='remont'),'Жидкая заплатка для небольших повреждений ПВХ.','published',true,'Только для небольших повреждений.','{boat}',2),
('zhidkaya-zaplatka-armor','Жидкая заплатка НеСдует Armor',(select id from public.product_lines where slug='armor'),(select id from public.categories where slug='remont'),'Жидкая заплатка для небольших повреждений ПВХ.','published',true,'Только для небольших повреждений.','{boat}',3),
('armirovannyj-gel','Армированный гель для ремонта ПВХ лодок',null,(select id from public.categories where slug='remont'),'Жидкая заплатка с длинной фиброй.','published',false,null,'{boat}',4),
('antiprokol','Антипрокол НеСдует',null,(select id from public.categories where slug='germetizaciya'),'Заливается внутрь баллона.','published',true,null,'{boat}',5),
('antiprokol-lite-dlya-shvov','Антипрокол НеСдует Lite для швов',(select id from public.product_lines where slug='lite'),(select id from public.categories where slug='germetizaciya'),'Жидкий герметик для швов.','published',false,'Только для небольших повреждений.','{boat}',6),
('ochistitel-clean-black','Очиститель-концентрат Clean+Black',null,(select id from public.categories where slug='ochistka'),'Концентрат: разведение 1:10 и 1:30.','published',false,null,'{boat}',7),
('aktivator-antiprokola','Активатор для Антипрокола',null,(select id from public.categories where slug='aksessuary'),'Наносится снаружи на место, где состав пузырится или вытекает, помогает быстро остановить выход.','published',false,null,'{boat}',8),
('otverditel-antiprokola','Отвердитель Антипрокола (компонент 2)',null,(select id from public.categories where slug='aksessuary'),'Компонент 2 для Антипрокола.','soon',false,'Меры безопасности будут добавлены.','{boat}',9),
('vysushivatel-antiprokola','Высушиватель Антипрокола (компонент 2, сухой комплект)',null,(select id from public.categories where slug='aksessuary'),'Компонент 2, сухой комплект.','soon',false,null,'{boat}',10),
('vysushivatel-vnutrennij','Высушиватель внутренний',null,(select id from public.categories where slug='aksessuary'),'Применяется после использования Антипрокола.','soon',false,null,'{boat}',11);

update public.products set has_dilution_calc = true where slug='ochistitel-clean-black';
update public.products set
  composition = 'Водно-дисперсионные полиуретановые компоненты, функциональные добавки, стабилизаторы, усиливающие компоненты, наполнители',
  cure_time = 'не менее 24 часов',
  usage_steps = '[{"icon":"search","title":"Найдите утечку","text":"Накачайте лодку до рабочего давления и найдите место прокола снаружи мыльным раствором по пузырям."}]'::jsonb
where slug='antiprokol';

insert into public.product_variants (product_id,volume_ml,price,gross_weight_g,sort)
select p.id, v.vol, v.price, v.gw, v.sort from public.products p join (values
 ('zhidkaya-zaplatka-lite',40,250,45,1),('zhidkaya-zaplatka-pro',40,270,45,1),('zhidkaya-zaplatka-armor',40,300,45,1),
 ('armirovannyj-gel',50,300,45,1),
 ('antiprokol',300,1320,null,1),('antiprokol',500,2000,null,2),('antiprokol',1000,3600,null,3),('antiprokol',5000,16000,null,4),
 ('antiprokol-lite-dlya-shvov',100,312,null,1),('antiprokol-lite-dlya-shvov',300,858,null,2),('antiprokol-lite-dlya-shvov',500,1300,null,3),('antiprokol-lite-dlya-shvov',1000,2340,null,4),('antiprokol-lite-dlya-shvov',5000,10400,null,5),
 ('ochistitel-clean-black',100,300,null,1),('ochistitel-clean-black',300,855,null,2),('ochistitel-clean-black',500,1350,null,3),('ochistitel-clean-black',1000,2550,null,4),('ochistitel-clean-black',5000,12000,null,5),
 ('aktivator-antiprokola',5,100,null,1),('aktivator-antiprokola',50,300,null,2),('aktivator-antiprokola',100,500,null,3),
 ('otverditel-antiprokola',50,400,null,1),
 ('vysushivatel-vnutrennij',50,300,null,1)
) as v(slug,vol,price,gw,sort) on v.slug = p.slug;

insert into public.product_recommendations (product_id, recommended_id, sort)
select a.id, r.id, x.sort from public.products a, public.products r, (values ('aktivator-antiprokola',1),('otverditel-antiprokola',2),('vysushivatel-antiprokola',3),('vysushivatel-vnutrennij',4)) as x(slug,sort)
where a.slug='antiprokol' and r.slug=x.slug;