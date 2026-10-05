import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StubNote } from "@/components/site/PageShell";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/o-brende")({
  head: () => seo("О бренде", "НеСдует — бренд системы ухода и защиты ПВХ-лодок.", "/o-brende"),
  component: POBrende,
});

function POBrende() {
  void StubNote;
  return (
    <PageShell title="О бренде" lead="Система ухода и защиты ПВХ-лодок." crumbs={[{ label: "О бренде" }]}>
      
    </PageShell>
  );
}
