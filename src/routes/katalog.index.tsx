import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell, StubNote } from "@/components/site/PageShell";
import { ProductCard } from "@/components/catalog/ProductCard";
import { catalogQuery, taxonomyQuery, PRODUCT_TYPES } from "@/lib/catalog";
import { seo } from "@/lib/site";

type Search = { zadacha?: string; izdelie?: string; obyem?: number };

export const Route = createFileRoute("/katalog/")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const out: Search = {};
    if (typeof s["zadacha"] === "string") out.zadacha = s["zadacha"];
    if (typeof s["izdelie"] === "string") out.izdelie = s["izdelie"];
    const v = Number(s["obyem"]);
    if (Number.isFinite(v) && v > 0) out.obyem = v;
    return out;
  },
  head: () => seo("Каталог", "Каталог средств НеСдует для ремонта, герметизации, очистки и защиты ПВХ-лодок.", "/katalog"),
  loader: async ({ context }) => {
    await Promise.all([context.queryClient.ensureQueryData(catalogQuery), context.queryClient.ensureQueryData(taxonomyQuery)]);
  },
  errorComponent: () => <div className="container-site py-20">Каталог временно недоступен.</div>,
  component: Catalog,
});

function Chip({ active, children, ...rest }: { active: boolean; children: React.ReactNode } & React.ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={`rounded-full border px-4 py-1.5 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
      {children}
    </Link>
  );
}

function Catalog() {
  const search = Route.useSearch();
  const { data: products } = useSuspenseQuery(catalogQuery);
  const { data: tax } = useSuspenseQuery(taxonomyQuery);
  const volumes = [...new Set(products.flatMap((p) => p.volumes))].sort((a, b) => a - b);
  const list = products.filter(
    (p) =>
      (!search.zadacha || p.category?.slug === search.zadacha) &&
      (!search.izdelie || p.suitable_for.includes(search.izdelie)) &&
      (!search.obyem || p.volumes.includes(search.obyem)),
  );
  const without = (k: keyof Search) => {
    const n = { ...search };
    delete n[k];
    return n;
  };

  return (
    <PageShell title="Каталог" lead="Средства для ремонта и ухода за ПВХ-лодками." crumbs={[{ label: "Каталог" }]}>
      <div className="space-y-4">
        <FilterRow label="Задача">
          <Chip to="/katalog" search={without("zadacha")} active={!search.zadacha}>Все</Chip>
          {tax.categories.map((c) => (
            <Chip key={c.slug} to="/katalog" search={{ ...search, zadacha: c.slug }} active={search.zadacha === c.slug}>{c.name}</Chip>
          ))}
        </FilterRow>
        <FilterRow label="Изделие">
          <Chip to="/katalog" search={without("izdelie")} active={!search.izdelie}>Все</Chip>
          {PRODUCT_TYPES.map((t) => (
            <Chip key={t.value} to="/katalog" search={{ ...search, izdelie: t.value }} active={search.izdelie === t.value}>{t.label}</Chip>
          ))}
        </FilterRow>
        {volumes.length > 0 && (
          <FilterRow label="Объём">
            <Chip to="/katalog" search={without("obyem")} active={!search.obyem}>Любой</Chip>
            {volumes.map((v) => (
              <Chip key={v} to="/katalog" search={{ ...search, obyem: v }} active={search.obyem === v}>{v} мл</Chip>
            ))}
          </FilterRow>
        )}
      </div>
      <div className="mt-10">
        {list.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {list.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        ) : (
          <StubNote>По выбранным фильтрам товаров нет. <Link to="/katalog" className="text-primary underline">Сбросить фильтры</Link></StubNote>
        )}
      </div>
    </PageShell>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 text-xs uppercase text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
