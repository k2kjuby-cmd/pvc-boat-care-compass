import { createFileRoute, notFound } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PageShell } from '@/components/site/PageShell';
import { ArticleCard, Illustrative } from '@/components/site/ArticleCard';
import { ProductCard } from '@/components/catalog/ProductCard';
import { VideoPlayer } from '@/components/site/VideoPlayer';
import { articleQuery, parseBody, rubricName, formatDate } from '@/lib/blog';
import { parseVideo } from '@/lib/video';
import { seo } from '@/lib/site';

export const Route = createFileRoute('/dlya-masterskih/$slug')({
  loader: async ({ params, context }) => { const a = await context.queryClient.ensureQueryData(articleQuery(params.slug)); if (!a) throw notFound(); return a; },
  head: ({ loaderData: a, params }) => {
    if (!a) return { meta: [{ title: 'Статья не найдена' }, { name: 'robots', content: 'noindex' }] };
    const base = seo(a.seo_title || a.title, a.seo_description || a.excerpt || a.title, `/dlya-masterskih/${params.slug}`);
    const img = a.cover_url?.startsWith('https://') ? a.cover_url : null;
    return {
      ...base,
      meta: [...base.meta.map(m => 'property' in m && m.property === 'og:type' ? { property: 'og:type', content: 'article' } : m), ...(img ? [{ property: 'og:image', content: img }, { name: 'twitter:image', content: img }] : [])],
      scripts: [{ type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.seo_description || a.excerpt || undefined, datePublished: a.published_at, dateModified: a.updated_at, articleSection: rubricName(a.rubric), ...(img ? { image: [img] } : {}), publisher: { '@type': 'Organization', name: 'НеСдует' } }) }],
    };
  },
  errorComponent: () => <div className="container-site py-20">Не удалось загрузить статью.</div>,
  notFoundComponent: () => <div className="container-site py-20">Статья не найдена.</div>,
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams(); const { data } = useSuspenseQuery(articleQuery(slug)); const a = data!;
  const video = parseVideo(a.video_url);
  return <PageShell title={a.title} lead={a.excerpt ?? undefined} crumbs={[{ label: 'Для мастерских', to: '/dlya-masterskih' }, { label: rubricName(a.rubric), to: `/dlya-masterskih/rubrika/${a.rubric}` }, { label: a.title }]}>
    <p className="-mt-6 text-sm text-muted-foreground"><time dateTime={a.published_at}>{formatDate(a.published_at)}</time></p>
    {a.cover_url && <figure className="relative mt-6 max-w-4xl overflow-hidden rounded-2xl"><img src={a.cover_url} alt={a.title} className="w-full object-cover" />{a.cover_illustrative && <div className="absolute bottom-3 left-3"><Illustrative /></div>}</figure>}
    <article className="mt-8 max-w-3xl space-y-5">{parseBody(a.body).map((b, i) => b.t === 'h2' ? <h2 key={i} className="pt-4 text-2xl uppercase">{b.text}</h2> : b.t === 'h3' ? <h3 key={i} className="pt-2 text-xl">{b.text}</h3> : b.t === 'p' ? <p key={i} className="whitespace-pre-line text-muted-foreground">{b.text}</p> : <figure key={i}><img src={b.url} alt={b.caption} loading="lazy" className="w-full rounded-2xl" /><figcaption className="mt-2 text-sm text-muted-foreground">{b.caption}{b.illustrative && <span className="ml-2"><Illustrative /></span>}</figcaption></figure>)}</article>
    {video && <section className="mt-12 max-w-3xl"><h2 className="text-2xl uppercase">Видео</h2><div className="mt-5"><VideoPlayer video={video} title={`Видео: ${a.title}`} /></div></section>}
    {a.related.length > 0 && <section className="mt-14"><h2 className="text-2xl uppercase">Связанные товары</h2><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{a.related.map(p => <ProductCard key={p.id} p={p} />)}</div></section>}
    {a.readAlso.length > 0 && <section className="mt-14"><h2 className="text-2xl uppercase">Читайте также</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{a.readAlso.map(x => <ArticleCard key={x.slug} a={x} />)}</div></section>}
  </PageShell>;
}
