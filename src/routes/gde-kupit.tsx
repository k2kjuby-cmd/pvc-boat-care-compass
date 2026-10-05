import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { WhereToBuyButtons, useHasMarketplaces } from "@/components/site/WhereToBuy";
import { Button } from "@/components/ui/button";
import { seo, settingsQuery } from "@/lib/site";

export const Route = createFileRoute("/gde-kupit")({
  head: () => seo("Где купить", "Где купить средства НеСдует для ПВХ-лодок: маркетплейсы, наш магазин и дилеры.", "/gde-kupit"),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: Where,
});

function Where() {
  const has = useHasMarketplaces();
  return (
    <PageShell title="Где купить" lead="Выберите удобную площадку." crumbs={[{ label: "Где купить" }]}>
      {has && <WhereToBuyButtons />}
      <div className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl">Вы магазин или мастерская?</h2>
        <p className="mt-2 text-muted-foreground">Закупайте напрямую по оптовым условиям.</p>
        <Button asChild className="mt-4"><Link to="/optovikam" hash="zayavka">Получить оптовый прайс</Link></Button>
      </div>
    </PageShell>
  );
}
