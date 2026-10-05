import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StubNote } from "@/components/site/PageShell";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/kontakty")({
  head: () => seo("Контакты", "Контакты бренда НеСдует: телефон, e-mail, мессенджеры.", "/kontakty"),
  component: PKontakty,
});

function PKontakty() {
  void StubNote;
  return (
    <PageShell title="Контакты" lead="Свяжитесь с нами удобным способом." crumbs={[{ label: "Контакты" }]}>
      
    </PageShell>
  );
}
