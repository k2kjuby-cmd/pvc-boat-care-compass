import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StubNote } from "@/components/site/PageShell";
import { seo } from "@/lib/site";

export const Route = createFileRoute("/dostavka-i-oplata")({
  head: () => seo("Доставка и оплата", "Условия доставки и оплаты товаров НеСдует.", "/dostavka-i-oplata"),
  component: PDostavkaIOplata,
});

function PDostavkaIOplata() {
  void StubNote;
  return (
    <PageShell title="Доставка и оплата" lead="Как получить и оплатить заказ." crumbs={[{ label: "Доставка и оплата" }]}>
      
    </PageShell>
  );
}
