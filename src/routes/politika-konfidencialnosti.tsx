import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StubNote } from "@/components/site/PageShell";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/politika-konfidencialnosti")({
  head: () => seo("Политика конфиденциальности", "Политика обработки персональных данных на сайте НеСдует.", "/politika-konfidencialnosti"),
  component: PPolitikaKonfidencialnosti,
});

function PPolitikaKonfidencialnosti() {
  void StubNote;
  return (
    <PageShell title="Политика конфиденциальности" crumbs={[{ label: "Политика конфиденциальности" }]}>
      
    </PageShell>
  );
}
