import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/site/PageShell';
import { ArticleCard, RubricNav } from '@/components/site/ArticleCard';
import { articlesQuery, RUBRICS } from '@/lib/blog';
import { seo } from '@/lib/site';

export const Route = createFileRoute('/dlya-masterskih/')({
  head: () => seo('Для мастерских', 'Инструкции по ремонту ПВХ-лодок, секреты мастеров, разборы случаев и видео от НеСдует.', '/dlya-masterskih'),
  loader: ({ context }) => context.queryClient.ensureQueryData(articlesQuery()),
  errorComponent: () => <div className="container-site py-20">Не удалось загрузить материалы.</div>,
  notFoundComponent: () => <div className="container-site py-20">Не найдено.</div>,
  component: Blog,
});

function Blog() {
  const { data } = useSuspenseQuery(articlesQuery());
  return <PageShell title="Для мастерских" lead="Экспертные материалы по ремонту и уходу за ПВХ-лодками." crumbs={[{ label: 'Для мастерских' }]}>
    <RubricNav />
    {data.length > 0
      ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.map(a => <ArticleCard key={a.slug} a={a} />)}</div>
      : <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{RUBRICS.map(r => <Link key={r.slug} to="/dlya-masterskih/rubrika/$rubric" params={{ rubric: r.slug }} className="rounded-2xl border border-border bg-card p-6"><h2 className="text-xl">{r.name}</h2><p className="mt-2 text-sm text-muted-foreground">{r.text}</p><p className="mt-4 text-xs uppercase text-muted-foreground">Материалы готовятся</p></Link>)}</div>}
  </PageShell>;
}
