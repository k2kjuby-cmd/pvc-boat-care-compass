import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { seo } from '@/lib/site';

export const Route = createFileRoute('/sozdat-parol')({
  head: () => ({ ...seo('Создание пароля', 'Создание пароля для кабинета дилера НеСдует.', '/sozdat-parol'), meta: [...seo('Создание пароля', 'Создание пароля для кабинета дилера НеСдует.', '/sozdat-parol').meta, { name: 'robots', content: 'noindex' }] }),
  component: SetPassword,
});

function SetPassword() {
  const nav = useNavigate(); const [ready, setReady] = useState(false); const [pw, setPw] = useState(''); const [pw2, setPw2] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setReady(!!data.session)); const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (s) setReady(true); }); return () => data.subscription.unsubscribe(); }, []);
  async function submit(e: React.FormEvent) { e.preventDefault(); if (pw.length < 8) { toast.error('Пароль — не менее 8 символов'); return; } if (pw !== pw2) { toast.error('Пароли не совпадают'); return; } setBusy(true); const { error } = await supabase.auth.updateUser({ password: pw }); setBusy(false); if (error) { toast.error(error.message); return; } toast.success('Пароль создан'); nav({ to: '/kabinet' }); }
  return <div className="container-site flex min-h-[70vh] items-center justify-center py-16"><div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8">
    <h1 className="text-2xl uppercase">Создание пароля</h1>
    {!ready ? <p className="mt-3 text-sm text-muted-foreground">Откройте эту страницу по ссылке из письма. Если ссылка устарела, попросите менеджера отправить её повторно.</p> :
    <form onSubmit={submit} className="mt-6 space-y-4"><div className="space-y-2"><Label htmlFor="p1">Новый пароль</Label><Input id="p1" type="password" autoComplete="new-password" minLength={8} required value={pw} onChange={e => setPw(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="p2">Повторите пароль</Label><Input id="p2" type="password" autoComplete="new-password" minLength={8} required value={pw2} onChange={e => setPw2(e.target.value)} /></div><Button type="submit" className="w-full" disabled={busy}>Сохранить и войти</Button></form>}
  </div></div>;
}
