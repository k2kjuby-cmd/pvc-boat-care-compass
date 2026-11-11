import { createServerFn } from '@tanstack/react-start';
import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { pub, CARD_SELECT, toCard, type RawCard, type CardProduct } from './catalog';

export const RUBRICS = [
  { slug: 'instrukcii', name: 'Инструкции', text: 'Пошаговый ремонт и уход.' },
  { slug: 'sekrety', name: 'Секреты мастеров', text: 'Приёмы из практики.' },
  { slug: 'razbor', name: 'Разбор случаев', text: 'Реальные повреждения и решения.' },
  { slug: 'video', name: 'Видео', text: 'Смотрите, как это делается.' },
] as const;
export type RubricSlug = typeof RUBRICS[number]['slug'];
export const rubricName = (s: string) => RUBRICS.find(r => r.slug === s)?.name ?? s;

export type ArticleCard = { slug: string; title: string; rubric: string; excerpt: string | null; cover_url: string | null; cover_illustrative: boolean; published_at: string };
export type Article = ArticleCard & { seo_title: string | null; seo_description: string | null; body: string; video_url: string | null; updated_at: string; related: CardProduct[]; readAlso: ArticleCard[] };
const CARD = 'slug,title,rubric,excerpt,cover_url,cover_illustrative,published_at';

export const getArticles = createServerFn({ method: 'GET' })
  .inputValidator((v: unknown) => z.object({ rubric: z.string().max(40).optional() }).parse(v ?? {}))
  .handler(async ({ data }): Promise<ArticleCard[]> => {
    let q = pub().from('articles').select(CARD).eq('status', 'published').order('published_at', { ascending: false });
    if (data.rubric) q = q.eq('rubric', data.rubric);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getArticle = createServerFn({ method: 'GET' })
  .inputValidator((v: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(v))
  .handler(async ({ data }): Promise<Article | null> => {
    const sb = pub();
    const { data: a } = await sb.from('articles').select('*').eq('slug', data.slug).eq('status', 'published').maybeSingle();
    if (!a) return null;
    const [prods, also] = await Promise.all([
      a.related_product_ids.length ? sb.from('products').select(CARD_SELECT).in('id', a.related_product_ids).neq('status', 'hidden') : Promise.resolve({ data: [] }),
      sb.from('articles').select(CARD).eq('status', 'published').neq('slug', a.slug).order('published_at', { ascending: false }).limit(12),
    ]);
    const alsoRows = (also.data ?? []) as ArticleCard[];
    const readAlso = [...alsoRows.filter(x => x.rubric === a.rubric), ...alsoRows.filter(x => x.rubric !== a.rubric)].slice(0, 3);
    return { slug: a.slug, title: a.title, rubric: a.rubric, excerpt: a.excerpt, cover_url: a.cover_url, cover_illustrative: a.cover_illustrative, published_at: a.published_at, seo_title: a.seo_title, seo_description: a.seo_description, body: a.body, video_url: a.video_url, updated_at: a.updated_at, related: ((prods.data ?? []) as unknown as RawCard[]).map(toCard), readAlso };
  });

export const articlesQuery = (rubric?: string) => queryOptions({ queryKey: ['articles', rubric ?? 'all'], queryFn: () => getArticles({ data: { rubric } }), staleTime: 60_000 });
export const articleQuery = (slug: string) => queryOptions({ queryKey: ['article', slug], queryFn: () => getArticle({ data: { slug } }), staleTime: 60_000 });

// Body markup: "## " h2, "### " h3, "![подпись](https://…)" photo, "![подпись|иллюстрация](…)" illustrative photo, blank line = paragraph.
export type Block = { t: 'h2' | 'h3' | 'p'; text: string } | { t: 'img'; url: string; caption: string; illustrative: boolean };
export function parseBody(body: string): Block[] {
  return body.replace(/\r/g, '').split(/\n{2,}/).flatMap(chunk => chunk.split('\n').reduce<Block[]>((acc, line) => {
    const l = line.trim(); if (!l) return acc;
    const img = l.match(/^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)$/);
    if (img) { const [cap, flag] = img[1]!.split('|'); acc.push({ t: 'img', url: img[2]!, caption: (cap ?? '').trim(), illustrative: (flag ?? '').trim().toLowerCase().startsWith('иллюстр') }); return acc; }
    if (l.startsWith('### ')) { acc.push({ t: 'h3', text: l.slice(4) }); return acc; }
    if (l.startsWith('## ')) { acc.push({ t: 'h2', text: l.slice(3) }); return acc; }
    const last = acc[acc.length - 1];
    if (last && last.t === 'p') last.text += '\n' + l; else acc.push({ t: 'p', text: l });
    return acc;
  }, []));
}
export const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
