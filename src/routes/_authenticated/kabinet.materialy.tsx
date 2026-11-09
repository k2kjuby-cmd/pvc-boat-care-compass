import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { seo } from '@/lib/site';

export const Route = createFileRoute('/_authenticated/kabinet/materialy')({ head: () => seo('Материалы для дилеров', 'Инструкции, фото упаковки и тексты НеСдует.', '/kabinet/materialy'), component: Materials });

export const MATERIAL_KIND = { instruction: 'Инструкции', photo: 'Фото упаковки', text: 'Тексты описаний' } as const;

function Materials() {
  const { data = [] } = useQuery({ queryKey: ['dealer-materials'], queryFn: async () => (await supabase.from('dealer_materials').select('*').order('sort')).data ?? [] });
  if (data.length === 0) return <p className="text-muted-foreground">Материалы пока не добавлены.</p>;
  return <div className="space-y-10">{(Object.keys(MATERIAL_KIND) as (keyof typeof MATERIAL_KIND)[]).map(k => { const list = data.filter(m => m.kind === k); if (!list.length) return null; return <section key={k}><h2 className="text-xl uppercase">{MATERIAL_KIND[k]}</h2><div className="mt-4 space-y-3">{list.map(m => <article key={m.id} className="rounded-lg border border-border bg-card p-5"><h3 className="text-lg">{m.title}</h3>{m.kind === 'photo' && m.url && <img src={m.url} alt={m.title} className="mt-3 max-h-64 rounded" loading="lazy" />}{m.body && <p className="mt-2 whitespace-pre-wrap text-sm">{m.body}</p>}{m.url && <a href={m.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-primary underline">Открыть / скачать</a>}</article>)}</div></section>; })}</div>;
}
