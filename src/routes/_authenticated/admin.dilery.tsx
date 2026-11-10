import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { seo } from '@/lib/site';
import type { Database } from '@/integrations/supabase/types';

export const Route = createFileRoute('/_authenticated/admin/dilery')({ head: () => seo('Дилеры', 'Дилеры и материалы НеСдует.', '/admin/dilery'), component: Dealers });
type A = Database['public']['Tables']['dealer_accounts']['Row'];
type L = Database['public']['Tables']['wholesale_leads']['Row'];
type Lv = Database['public']['Tables']['wholesale_levels']['Row'];
const BT: Record<string, string> = { shop: 'Магазин', rental: 'Прокат', workshop: 'Мастерская', dealer: 'Дилер', other: 'Другое' };
const sel = 'h-10 rounded-md border border-input bg-background px-3';

function DealerCard({ a, lead, levels }: { a: A; lead: L | undefined; levels: Lv[] }) {
  const qc = useQueryClient(); const [d, setD] = useState(a);
  async function save() { const { error } = await supabase.from('dealer_accounts').update({ manual_level_id: d.manual_level_id, individual_discount_percent: d.individual_discount_percent, admin_notes: d.admin_notes, approved: d.approved, map_enabled: d.map_enabled, city: d.city, map_lat: d.map_lat, map_lng: d.map_lng }).eq('user_id', a.user_id); if (error) toast.error(error.message); else { toast.success('Дилер сохранён'); qc.invalidateQueries({ queryKey: ['admin-dealers'] }); } }
  return <article className="rounded-lg border border-border bg-card p-5 space-y-3">
    <div className="flex flex-wrap justify-between gap-2"><h3 className="text-lg">{a.company ?? lead?.company} · {a.city ?? lead?.city}</h3><span className={d.approved ? 'text-sm' : 'text-sm text-destructive'}>{d.approved ? 'Активен' : 'Заблокирован'}</span></div>
    <p className="text-sm text-muted-foreground">{a.contact_name ?? lead?.name} · {a.phone ?? lead?.phone} · {a.email} · Тип: {lead ? BT[lead.business_type] ?? lead.business_type : '—'} · Источник: {lead?.source ?? '—'}{a.inn && ` · ИНН ${a.inn}`}</p>
    {lead?.comment && <p className="text-sm">Заявка: {lead.comment}</p>}
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="text-sm">Уровень<select className={`${sel} mt-1 w-full`} value={d.manual_level_id ?? ''} onChange={e => setD({ ...d, manual_level_id: e.target.value || null })}><option value="">Дилер / Опт 1 / Опт 2 — по партии</option>{levels.filter(l => l.manual_only).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
      <label className="text-sm">Индивидуальная скидка, % (до 50)<Input className="mt-1" type="number" min="0" max="50" value={d.individual_discount_percent ?? ''} onChange={e => setD({ ...d, individual_discount_percent: e.target.value === '' ? null : Math.min(50, Math.max(0, Number(e.target.value))) })} /></label>
      <label className="text-sm">Город<Input className="mt-1" value={d.city ?? ''} onChange={e => setD({ ...d, city: e.target.value || null })} /></label>
      <label className="text-sm">Широта (карта)<Input className="mt-1" type="number" step="any" value={d.map_lat ?? ''} onChange={e => setD({ ...d, map_lat: e.target.value === '' ? null : Number(e.target.value) })} /></label>
      <label className="text-sm">Долгота (карта)<Input className="mt-1" type="number" step="any" value={d.map_lng ?? ''} onChange={e => setD({ ...d, map_lng: e.target.value === '' ? null : Number(e.target.value) })} /></label>
      <label className="text-sm">Статус<select className={`${sel} mt-1 w-full`} value={d.approved ? 'a' : 'b'} onChange={e => setD({ ...d, approved: e.target.value === 'a' })}><option value="a">Активен</option><option value="b">Заблокирован</option></select></label>
    </div>
    <Textarea aria-label="Заметки" placeholder="Заметки" value={d.admin_notes ?? ''} onChange={e => setD({ ...d, admin_notes: e.target.value || null })} />
    <label className="flex items-center gap-2 text-sm"><Checkbox checked={d.map_enabled} onCheckedChange={v => setD({ ...d, map_enabled: v === true })} />Показывать на странице «Наши дилеры» {a.map_consent ? '(согласие дилера есть)' : '(дилер ещё не дал согласие — не появится)'}</label>
    <Button size="sm" onClick={save}>Сохранить</Button>
  </article>;
}

function Materials() {
  const qc = useQueryClient(); const [m, setM] = useState({ kind: 'instruction', title: '', body: '', url: '' });
  const { data = [] } = useQuery({ queryKey: ['admin-materials'], queryFn: async () => (await supabase.from('dealer_materials').select('*').order('sort')).data ?? [] });
  async function add() { if (!m.title.trim()) { toast.error('Укажите название'); return; } const { error } = await supabase.from('dealer_materials').insert({ kind: m.kind, title: m.title.trim(), body: m.body || null, url: m.url || null, sort: data.length }); if (error) toast.error(error.message); else { setM({ ...m, title: '', body: '', url: '' }); qc.invalidateQueries({ queryKey: ['admin-materials'] }); } }
  async function del(id: string) { await supabase.from('dealer_materials').delete().eq('id', id); qc.invalidateQueries({ queryKey: ['admin-materials'] }); }
  return <section className="space-y-3"><h2 className="text-xl uppercase">Материалы для дилеров</h2>
    <div className="grid gap-2 sm:grid-cols-[180px_1fr_1fr]"><select aria-label="Тип материала" className={sel} value={m.kind} onChange={e => setM({ ...m, kind: e.target.value })}><option value="instruction">Инструкция</option><option value="photo">Фото упаковки</option><option value="text">Текст описания</option></select><Input placeholder="Название" value={m.title} onChange={e => setM({ ...m, title: e.target.value })} /><Input placeholder="Ссылка на файл или фото" value={m.url} onChange={e => setM({ ...m, url: e.target.value })} /></div>
    <Textarea placeholder="Текст (необязательно)" value={m.body} onChange={e => setM({ ...m, body: e.target.value })} /><Button size="sm" onClick={add}>Добавить материал</Button>
    <ul className="divide-y divide-border">{data.map(x => <li key={x.id} className="flex justify-between gap-2 py-2"><span>{x.title}</span><Button size="sm" variant="ghost" onClick={() => del(x.id)}>Удалить</Button></li>)}</ul>
  </section>;
}

function Dealers() {
  const q = useQuery({ queryKey: ['admin-dealers'], queryFn: async () => { const [a, l, v] = await Promise.all([supabase.from('dealer_accounts').select('*').order('created_at', { ascending: false }), supabase.from('wholesale_leads').select('*'), supabase.from('wholesale_levels').select('*').order('sort')]); for (const r of [a, l, v]) if (r.error) throw r.error; return { accounts: a.data ?? [], leads: l.data ?? [], levels: v.data ?? [] }; } });
  function csv() { if (!q.data) return; const head = ['Компания', 'Контакт', 'Телефон', 'E-mail', 'Город', 'ИНН', 'КПП', 'ОГРН', 'Юр. адрес', 'Тип бизнеса', 'Источник', 'Уровень', 'Инд. скидка, %', 'Статус', 'На карте', 'Согласие на карту', 'Заметки', 'Создан'];
    const rows = q.data.accounts.map(a => { const l = q.data.leads.find(x => x.id === a.lead_id); return [a.company ?? l?.company, a.contact_name ?? l?.name, a.phone ?? l?.phone, a.email, a.city ?? l?.city, a.inn, a.kpp, a.ogrn, a.legal_address, l ? BT[l.business_type] : '', l?.source, q.data.levels.find(x => x.id === a.manual_level_id)?.name ?? 'по партии', a.individual_discount_percent, a.approved ? 'Активен' : 'Заблокирован', a.map_enabled ? 'да' : 'нет', a.map_consent ? 'да' : 'нет', a.admin_notes, a.created_at]; });
    const text = '\ufeff' + [head, ...rows].map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })); const el = document.createElement('a'); el.href = url; el.download = 'nesduet-dilery.csv'; el.click(); URL.revokeObjectURL(url); }
  return <div className="space-y-10"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl uppercase">Дилеры</h1><Button variant="outline" onClick={csv}>Экспорт CSV</Button></div>
    <p className="text-sm text-muted-foreground">Дилер появляется здесь после одобрения заявки во вкладке «Заявки» — ему уходит письмо со ссылкой для создания пароля.</p>
    {q.data?.accounts.length === 0 && <p className="text-muted-foreground">Дилеров пока нет.</p>}
    <div className="space-y-3">{q.data?.accounts.map(a => <DealerCard key={a.user_id} a={a} lead={q.data.leads.find(l => l.id === a.lead_id)} levels={q.data.levels} />)}</div>
    <Materials /></div>;
}
