import { createFileRoute, notFound } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/site/PageShell';
import { ArticleCard, RubricNav } from '@/components/site/ArticleCard';
import { articlesQuery, RUBRICS } from '@/lib/blog';
import { seo } from '@/lib/site';

export const Route = createFileRoute('/dlya-masterskih/rubrika/$rubric')({
  loader: ({ params, context }) => { if (!RUBRICS.some(r => r.slug === params.rubric)) throw notFound(); return context.queryClient.ensureQueryData(articlesQuery(params.rubric)); },
  head: ({ params }) => { const r = RUBRICS.find(x => x.slug === params.rubric); return r ? seo(`${r.name} — для мастерских`, `${r.name}: ${r.text} Материалы НеСдует по ремонту ПВХ-лодок.`, `/dlya-masterskih/rubrika/${r.slug}`) : { meta: [{ title: 'Рубрика не найдена' }, { name: 'robots', content: 'noindex' }] }; },
  errorComponent: () => <div className="container-site py-20">Не удалось загрузить материалы.</div>,
  notFoundComponent: () => <div className="container-site py-20">Рубрика не найдена.</div>,
  component: Rubric,
});

function Rubric() {
  const { rubric } = Route.useParams(); const r = RUBRICS.find(x => x.slug === rubric)!;
  const { data } = useSuspenseQuery(articlesQuery(rubric));
  return <PageShell title={r.name} lead={r.text} crumbs={[{ label: 'Для мастерских', to: '/dlya-masterskih' }, { label: r.name }]}>
    <RubricNav active={rubric} />
    {data.length > 0 ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.map(a => <ArticleCard key={a.slug} a={a} />)}</div> : <p className="mt-8 text-muted-foreground">Материалы рубрики готовятся.</p>}
  </PageShell>;
}
