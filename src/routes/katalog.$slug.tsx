import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, ExternalLink, AlertTriangle, Timer } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { ProductCard, LineBadge, ImagePlaceholder } from "@/components/catalog/ProductCard";
import { StepIcon } from "@/components/catalog/StepIcon";
import { DilutionCalc } from "@/components/catalog/DilutionCalc";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { productQuery, formatPrice, formatVolume, PRODUCT_TYPES, type ProductImage } from "@/lib/catalog";
import { seo } from "@/lib/site";
import { DealerPrice } from "@/components/catalog/DealerPrice";

export const Route = createFileRoute("/katalog/$slug")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!p) throw notFound();
    return { name: p.name, description: p.short_description ?? "", image: p.images[0]?.url ?? null };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Товар не найден — НеСдует" }, { name: "robots", content: "noindex" }] };
    const base = seo(loaderData.name, loaderData.description || `${loaderData.name} — средство НеСдует для ПВХ-лодок.`, `/katalog/${params.slug}`);
    if (loaderData.image?.startsWith("https://")) {
      base.meta.push({ property: "og:image", content: loaderData.image }, { name: "twitter:image", content: loaderData.image });
    }
    return base;
  },
  notFoundComponent: () => (
    <div className="container-site py-20 text-center">
      <h1 className="text-3xl">Товар не найден</h1>
      <Link to="/katalog" className="mt-4 inline-block text-primary">Вернуться в каталог</Link>
    </div>
  ),
  errorComponent: () => <div className="container-site py-20">Не удалось загрузить товар.</div>,
  component: ProductPage,
});

const MARKETS = [
  { key: "ozon_url", name: "Ozon" },
  { key: "wildberries_url", name: "Wildberries" },
  { key: "avito_url", name: "Авито" },
  { key: "yandex_market_url", name: "Яндекс Маркет" },
] as const;

function safeEmbed(url: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="text-2xl uppercase">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQuery(slug));
  const [vi, setVi] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);
  if (!p) return null;

  const v = p.variants[vi];
  // Узкие этикетки не показываем в галерее (правило бренда: только широкая этикетка и фото тары)
  const visibleImages = p.images.filter((i) => !(i.alt ?? "").toLowerCase().includes("узк"));
  const photos = visibleImages.filter((i) => i.kind === "photo");
  const variantImg = v?.image_url ?? null;
  const gallery: { url: string; alt: string; is_render: boolean }[] = [
    ...(variantImg ? [{ url: variantImg, alt: `${p.name} ${v ? formatVolume(v) : ""}`, is_render: false }] : []),
    ...photos.map((i) => ({ url: i.url, alt: i.alt ?? p.name, is_render: i.is_render })),
  ];
  const [main, ...thumbs] = gallery;
  const packaging = visibleImages.filter((i) => i.kind === "label" || i.kind === "package");
  const markets = v ? MARKETS.filter((m) => v[m.key]) : [];
  const isSoon = p.status === "soon";
  const video = safeEmbed(p.video_url);
  const suitable = PRODUCT_TYPES.filter((t) => p.suitable_for.includes(t.value));
  const crumbs = [{ label: "Каталог", to: "/katalog" }, ...(p.category ? [{ label: p.category.name, to: "/katalog", search: { zadacha: p.category.slug } }] : []), { label: p.name }];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.short_description ?? undefined,
    image: gallery.map((g) => g.url).filter((u) => u.startsWith("https://")),
    brand: { "@type": "Brand", name: "НеСдует" },
    ...(v?.price != null
      ? {
          offers: {
            "@type": "Offer",
            price: Number(v.price),
            priceCurrency: "RUB",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <PageShell title={p.name} crumbs={crumbs}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {main ? (
            <button type="button" onClick={() => setZoom(main.url)} className="relative block w-full overflow-hidden rounded-3xl bg-surface" aria-label="Увеличить фото">
              <img src={main.url} alt={main.alt} className="aspect-square w-full object-cover" />
              {main.is_render && <RenderNote />}
            </button>
          ) : (
            <ImagePlaceholder className="aspect-square w-full rounded-3xl" />
          )}
          {thumbs.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {thumbs.map((g) => (
                <button key={g.url} type="button" onClick={() => setZoom(g.url)} className="overflow-hidden rounded-xl bg-surface" aria-label="Увеличить фото">
                  <img src={g.url} alt={g.alt} loading="lazy" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:pt-2">
          <div className="flex items-center gap-2">
            <LineBadge line={p.line} />
            {isSoon && <span className="rounded-full bg-armor px-2.5 py-0.5 text-xs font-semibold text-background">Скоро</span>}
          </div>
          {p.short_description && <p className="mt-4 text-lg text-muted-foreground">{p.short_description}</p>}

          {p.variants.length > 0 && (
            <div className="mt-6">
              <div className="text-xs uppercase text-muted-foreground">Фасовка</div>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Фасовка">
                {p.variants.map((x, i) => (
                  <button key={x.id} type="button" role="radio" aria-checked={i === vi} onClick={() => setVi(i)} className={`rounded-xl border px-4 py-2 font-display ${i === vi ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}>
                    {formatVolume(x) || "—"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {v?.price != null && <div className="mt-6 font-display text-4xl">{formatPrice(Number(v.price))}</div>}
          {!isSoon && v && <DealerPrice key={v.id} variantId={v.id} />}

          {isSoon ? (
            <div className="mt-6 rounded-2xl border border-armor/40 bg-card p-5">
              <p className="mb-3 font-display">Сообщим, когда товар появится</p>
              <SubscribeForm topic="product" productId={p.id} cta="Уведомить" />
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {v?.sold_on_site !== false && v?.price != null && (
                <Button size="lg" className="w-full shadow-glow sm:w-auto" onClick={() => toast("Корзина появится в ближайшем обновлении")}>
                  <ShoppingCart /> В корзину
                </Button>
              )}
              {markets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {markets.map((m) => v?.[m.key] ? (
                    <Button key={m.key} asChild variant="outline" className="bg-card">
                      <a href={v[m.key] ?? undefined} target="_blank" rel="noopener noreferrer">Купить на {m.name} <ExternalLink className="h-4 w-4" /></a>
                    </Button>
                  ) : null)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {p.purpose && <Section title="Для чего"><p className="max-w-3xl whitespace-pre-line text-muted-foreground">{p.purpose}</p></Section>}

      {p.usage_steps.length > 0 && (
        <Section title="Как применять">
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {p.usage_steps.map((s, i) => (
              <li key={i} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-center justify-between">
                  <StepIcon name={s.icon} className="h-8 w-8 text-primary" />
                  <span className="font-display text-3xl text-foreground/15">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {p.has_dilution_calc && <Section title="Калькулятор разведения"><DilutionCalc /></Section>}

      {p.warnings && (
        <Section title="Предупреждения и ограничения">
          <div className="flex gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p className="whitespace-pre-line">{p.warnings}</p>
          </div>
        </Section>
      )}

      {p.composition && <Section title="Состав"><p className="max-w-3xl text-muted-foreground">{p.composition}</p></Section>}

      {suitable.length > 0 && (
        <Section title="Подходит для">
          <div className="flex flex-wrap gap-2">{suitable.map((t) => <span key={t.value} className="rounded-full bg-card px-4 py-1.5">{t.label}</span>)}</div>
        </Section>
      )}

      {packaging.length > 0 && (
        <Section title="Упаковка и инструкция">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {packaging.map((i: ProductImage) => (
              <button key={i.id} type="button" onClick={() => setZoom(i.url)} className="relative overflow-hidden rounded-2xl bg-surface" aria-label="Увеличить">
                <img src={i.url} alt={i.alt ?? (i.kind === "label" ? "Этикетка" : "Упаковка")} loading="lazy" className="aspect-square w-full object-contain" />
                {i.is_render && <RenderNote />}
              </button>
            ))}
          </div>
        </Section>
      )}

      {p.cure_time && (
        <Section title="Срок выдержки">
          <p className="flex items-center gap-2 font-display text-xl"><Timer className="text-primary" aria-hidden /> {p.cure_time}</p>
        </Section>
      )}

      {p.faq.length > 0 && (
        <Section title="Вопросы и ответы">
          <Accordion type="single" collapsible className="max-w-3xl">
            {p.faq.map((f, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      )}

      {p.recommended.length > 0 && (
        <Section title="Рекомендуем к этому товару">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{p.recommended.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </Section>
      )}

      {video && (
        <Section title="Видео">
          <div className="aspect-video overflow-hidden rounded-2xl bg-surface">
            <iframe src={video} title={`Видео: ${p.name}`} className="h-full w-full" loading="lazy" allowFullScreen allow="encrypted-media; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-presentation" />
          </div>
        </Section>
      )}

      {p.similar.length > 0 && (
        <Section title="Похожие товары">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{p.similar.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </Section>
      )}

      <Dialog open={!!zoom} onOpenChange={(o) => !o && setZoom(null)}>
        <DialogContent className="max-w-4xl border-border bg-background p-2">
          <DialogTitle className="sr-only">{p.name}</DialogTitle>
          {zoom && <img src={zoom} alt={p.name} className="max-h-[85vh] w-full object-contain" />}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function RenderNote() {
  return <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground">Изображение иллюстративное</span>;
}
