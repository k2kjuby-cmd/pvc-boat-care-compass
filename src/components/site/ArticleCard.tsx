import { Link } from '@tanstack/react-router';
import { ImagePlaceholder } from '@/components/catalog/ProductCard';
import { rubricName, formatDate, type ArticleCard as A } from '@/lib/blog';

export function Illustrative() { return <span className="rounded bg-background/80 px-2 py-0.5 text-[10px] uppercase text-muted-foreground">иллюстративное изображение</span>; }

export function ArticleCard({ a }: { a: A }) {
  return <Link to="/dlya-masterskih/$slug" params={{ slug: a.slug }} className="group block overflow-hidden rounded-2xl border border-border bg-card">
    <div className="relative aspect-[16/9]">{a.cover_url ? <img src={a.cover_url} alt={a.title} loading="lazy" className="h-full w-full object-cover" /> : <ImagePlaceholder className="h-full w-full" />}{a.cover_url && a.cover_illustrative && <div className="absolute bottom-2 left-2"><Illustrative /></div>}</div>
    <div className="p-5"><p className="text-xs uppercase text-primary">{rubricName(a.rubric)} · <span className="text-muted-foreground">{formatDate(a.published_at)}</span></p><h3 className="mt-2 text-lg group-hover:text-primary">{a.title}</h3>{a.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p>}</div>
  </Link>;
}

export function RubricNav({ active }: { active?: string }) {
  const cls = 'rounded-full border px-4 py-1.5 text-sm';
  return <nav aria-label="Рубрики" className="flex flex-wrap gap-2">
    <Link to="/dlya-masterskih" className={`${cls} ${!active ? 'border-primary text-foreground' : 'border-border text-muted-foreground'}`}>Все</Link>
    {(['instrukcii', 'sekrety', 'razbor', 'video'] as const).map(r => <Link key={r} to="/dlya-masterskih/rubrika/$rubric" params={{ rubric: r }} className={`${cls} ${active === r ? 'border-primary text-foreground' : 'border-border text-muted-foreground'}`}>{rubricName(r)}</Link>)}
  </nav>;
}
