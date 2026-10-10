import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site/PageShell";
import { seo, settingsQuery } from "@/lib/site";
import { nonEmpty } from "@/lib/contact-rules";

export const Route = createFileRoute("/dostavka-i-oplata")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  head: () => seo("Доставка и оплата", "Условия доставки и оплаты товаров НеСдует.", "/dostavka-i-oplata"),
  component: PDostavkaIOplata,
});

function PDostavkaIOplata() {
  const { data: s } = useSuspenseQuery(settingsQuery);
  return (
    <PageShell title="Доставка и оплата" lead="Как получить и оплатить заказ." crumbs={[{ label: "Доставка и оплата" }]}>
      <div className="max-w-3xl space-y-8 text-muted-foreground">
        <p className="border-l-2 border-primary pl-4 text-foreground">Черновик — требует проверки юристом.</p>
        {nonEmpty(s.shipping_city) && <section><h2 className="mb-3 text-xl text-foreground">Откуда отправляем</h2><p>Город отправки заказов: {s.shipping_city}.</p></section>}
        {["Способы и география доставки", "Сроки отправки и доставки", "Стоимость доставки и тарифы", "Способы и порядок оплаты", "Получение заказа", "Возврат и обмен"].map(title => <section key={title}><h2 className="mb-3 text-xl text-foreground">{title}</h2><p>Условия ожидают согласования и пока не установлены.</p></section>)}
        {nonEmpty(s.contact_email) && <section><h2 className="mb-3 text-xl text-foreground">Вопросы по заказам</h2><a className="underline" href={`mailto:${s.contact_email}`}>{s.contact_email}</a></section>}
      </div>
    </PageShell>
  );
}
