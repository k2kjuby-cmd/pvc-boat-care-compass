import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StubNote } from "@/components/site/PageShell";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/katalog")({
  head: () => seo("Каталог", "Каталог средств НеСдует для ремонта, герметизации, очистки и защиты ПВХ-лодок.", "/katalog"),
  validateSearch: (s: Record<string, unknown>) => ({ problema: typeof s.problema === "string" ? s.problema : undefined }),
  component: PKatalog,
});

function PKatalog() {
  void StubNote;
  return (
    <PageShell title="Каталог" lead="Средства для ремонта и ухода за ПВХ-лодками." crumbs={[{ label: "Каталог" }]}>
      <StubNote>Каталог наполняется — товары появятся в ближайшее время.</StubNote>
    </PageShell>
  );
}
