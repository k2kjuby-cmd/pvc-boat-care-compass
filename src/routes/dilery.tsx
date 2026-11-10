import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { seo, settingsQuery } from "@/lib/site";
import { getPublicDealers } from "@/lib/dealer.functions";

const dealersQuery = queryOptions({ queryKey: ["public-dealers"], queryFn: () => getPublicDealers() });

export const Route = createFileRoute("/dilery")({
  loader: async ({ context }) => {
    const s = await context.queryClient.ensureQueryData(settingsQuery);
    if (!s.dealers_page_enabled) throw notFound();
    await context.queryClient.ensureQueryData(dealersQuery);
    return null;
  },
  head: ({ loaderData }) =>
    loaderData === undefined
      ? { meta: [{ title: "Страница не найдена — НеСдует" }, { name: "robots", content: "noindex" }] }
      : seo("Наши дилеры", "Официальные дилеры НеСдует по городам России.", "/dilery"),
  component: Dealers,
});

function Dealers() {
  const { data } = useSuspenseQuery(dealersQuery);
  const pinned = data.filter(d => d.map_lat != null && d.map_lng != null);
  const [sel, setSel] = useState(pinned[0]);
  const cities = [...new Set(data.map(d => d.city ?? "Без города"))];
  const bbox = sel ? `${sel.map_lng! - 0.05},${sel.map_lat! - 0.03},${sel.map_lng! + 0.05},${sel.map_lat! + 0.03}` : "19,41,180,82";
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${sel ? `&marker=${sel.map_lat},${sel.map_lng}` : ""}`;
  return (
    <PageShell title="Наши дилеры" lead="Дилеры по городам." crumbs={[{ label: "Наши дилеры" }]}>
      {data.length === 0 ? <p className="text-muted-foreground">Список дилеров формируется.</p> :
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <aside aria-label="Список по городам" className="space-y-5 rounded-2xl border border-border bg-card p-6">
          {cities.map(c => <section key={c}><h2 className="text-lg">{c}</h2><ul className="mt-2 space-y-2">{data.filter(d => (d.city ?? "Без города") === c).map((d, i) => <li key={i}>{d.map_lat != null ? <button className="text-left underline-offset-4 hover:underline" onClick={() => setSel(d)}>{d.company}</button> : <span>{d.company}</span>}{d.public_address && <p className="text-sm text-muted-foreground">{d.public_address}</p>}</li>)}</ul></section>)}
        </aside>
        <iframe title="Карта дилеров" src={src} className="aspect-video w-full rounded-2xl border border-border" loading="lazy" />
      </div>}
    </PageShell>
  );
}
