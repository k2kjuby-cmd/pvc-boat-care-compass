import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { seo } from '@/lib/site';

export const Route = createFileRoute('/_authenticated/kabinet')({
  head: () => ({ ...seo('Кабинет дилера', 'Личный кабинет одобренного дилера НеСдует.', '/kabinet'), meta: [...seo('Кабинет дилера', 'Личный кабинет одобренного дилера НеСдует.', '/kabinet').meta, { name: 'robots', content: 'noindex' }] }),
  component: DealerLayout,
});

export const dealerAccountQuery = { queryKey: ['dealer-account'], queryFn: async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return null; const { data } = await supabase.from('dealer_accounts').select('*').eq('user_id', user.id).maybeSingle(); return data; } };

const TABS = [
  { to: '/kabinet', label: 'Каталог и цены', exact: true },
  { to: '/kabinet/zakazy', label: 'Заказы' },
  { to: '/kabinet/materialy', label: 'Материалы' },
  { to: '/kabinet/profil', label: 'Профиль' },
] as const;

function DealerLayout() {
  const nav = useNavigate(); const qc = useQueryClient();
  const { data, isLoading } = useQuery(dealerAccountQuery);
  async function logout() { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); nav({ to: '/auth', replace: true }); }
  if (isLoading) return <div className="container-site py-20 text-muted-foreground">Загрузка…</div>;
  if (!data?.approved) return <div className="container-site py-20"><h1 className="text-2xl uppercase">Кабинет недоступен</h1><p className="mt-2 text-muted-foreground">Кабинет открывается после одобрения оптовой заявки.</p><div className="mt-4 flex gap-2"><Button asChild><Link to="/optovikam">Оставить заявку</Link></Button><Button variant="outline" onClick={logout}>Выйти</Button></div></div>;
  return <div className="container-site py-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl uppercase">Кабинет дилера</h1><Button size="sm" variant="ghost" onClick={logout}>Выйти</Button></div>
    <nav className="mt-4 flex flex-wrap gap-2">{TABS.map(t => <Link key={t.to} to={t.to} activeOptions={{ exact: 'exact' in t }} className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground" activeProps={{ className: 'border-primary text-foreground' }}>{t.label}</Link>)}</nav>
    <div className="mt-8"><Outlet /></div>
  </div>;
}
