import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StubNote } from "@/components/site/PageShell";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/polzovatelskoe-soglashenie")({
  head: () => seo("Пользовательское соглашение", "Пользовательское соглашение сайта НеСдует.", "/polzovatelskoe-soglashenie"),
  component: PPolzovatelskoeSoglashenie,
});

function PPolzovatelskoeSoglashenie() {
  void StubNote;
  return (
    <PageShell title="Пользовательское соглашение" crumbs={[{ label: "Пользовательское соглашение" }]}>
      
    </PageShell>
  );
}
