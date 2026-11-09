import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { seo } from '@/lib/site';
import { dealerAccountQuery } from './kabinet';

export const Route = createFileRoute('/_authenticated/kabinet/profil')({ head: () => seo('Профиль дилера', 'Контакты и реквизиты дилера НеСдует.', '/kabinet/profil'), component: Profile });

const FIELDS = [['contact_name', 'Контактное лицо'], ['phone', 'Телефон'], ['email', 'E-mail для связи'], ['city', 'Город'], ['company', 'Организация'], ['inn', 'ИНН'], ['kpp', 'КПП'], ['ogrn', 'ОГРН / ОГРНИП'], ['legal_address', 'Юридический адрес'], ['public_address', 'Адрес точки продаж (для карты)']] as const;
type K = typeof FIELDS[number][0] | 'bank_details';

function Profile() {
  const qc = useQueryClient(); const { data } = useQuery(dealerAccountQuery);
  const [f, setF] = useState<Record<K, string>>({} as Record<K, string>); const [map, setMap] = useState(false);
  const [pw, setPw] = useState({ current: '', next: '' });
  useEffect(() => { if (data) { const v = {} as Record<K, string>; [...FIELDS.map(x => x[0]), 'bank_details' as const].forEach(k => { v[k] = (data[k] as string | null) ?? ''; }); setF(v); setMap(data.map_consent); } }, [data]);
  async function save(e: React.FormEvent) { e.preventDefault(); const { error } = await supabase.rpc('dealer_update_profile', { _p: { ...f, map_consent: map } }); if (error) toast.error(error.message); else { toast.success('Профиль сохранён'); qc.invalidateQueries({ queryKey: ['dealer-account'] }); } }
  async function changePw(e: React.FormEvent) { e.preventDefault(); if (pw.next.length < 8) { toast.error('Пароль — не менее 8 символов'); return; } const { error } = await supabase.auth.updateUser({ password: pw.next, current_password: pw.current } as { password: string }); if (error) toast.error(error.message); else { toast.success('Пароль изменён'); setPw({ current: '', next: '' }); } }
  return <div className="grid gap-10 lg:grid-cols-2">
    <form onSubmit={save} className="space-y-4"><h2 className="text-xl uppercase">Контакты и реквизиты</h2>
      {FIELDS.map(([k, l]) => <div key={k} className="space-y-1"><Label htmlFor={k}>{l}</Label><Input id={k} value={f[k] ?? ''} onChange={e => setF({ ...f, [k]: e.target.value })} /></div>)}
      <div className="space-y-1"><Label htmlFor="bank">Банковские реквизиты</Label><Textarea id="bank" value={f.bank_details ?? ''} onChange={e => setF({ ...f, bank_details: e.target.value })} /></div>
      <label className="flex items-start gap-2 text-sm"><Checkbox checked={map} onCheckedChange={v => setMap(v === true)} /><span>Согласен(на) на публикацию названия организации, города и адреса точки продаж на странице «Наши дилеры»</span></label>
      <Button type="submit">Сохранить профиль</Button>
    </form>
    <form onSubmit={changePw} className="space-y-4"><h2 className="text-xl uppercase">Смена пароля</h2>
      <div className="space-y-1"><Label htmlFor="cur">Текущий пароль</Label><Input id="cur" type="password" autoComplete="current-password" value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} /></div>
      <div className="space-y-1"><Label htmlFor="new">Новый пароль</Label><Input id="new" type="password" autoComplete="new-password" minLength={8} value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} /></div>
      <Button type="submit" variant="outline">Изменить пароль</Button>
    </form>
  </div>;
}
