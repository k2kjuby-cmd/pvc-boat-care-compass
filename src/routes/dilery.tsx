import { createFileRoute, notFound } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { seo, settingsQuery } from "@/lib/site";

export const Route = createFileRoute("/dilery")({
  loader: async ({ context }) => {
    const s = await context.queryClient.ensureQueryData(settingsQuery);
    if (!s.dealers_page_enabled) throw notFound();
    return null;
  },
  head: ({ loaderData }) =>
    loaderData === undefined
      ? { meta: [{ title: "Страница не найдена — НеСдует" }, { name: "robots", content: "noindex" }] }
      : seo("Наши дилеры", "Официальные дилеры НеСдует по городам России.", "/dilery"),
  component: Dealers,
});

function Dealers() {
  return (
    <PageShell title="Наши дилеры" lead="Дилеры по городам." crumbs={[{ label: "Наши дилеры" }]}>
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <aside aria-label="Список по городам" className="rounded-2xl border border-border bg-card p-6 text-muted-foreground">Список дилеров формируется.</aside>
        <div className="flex aspect-video items-center justify-center rounded-2xl bg-surface text-muted-foreground"><MapPin className="mr-2 text-primary" /> Карта</div>
      </div>
    </PageShell>
  );
}
